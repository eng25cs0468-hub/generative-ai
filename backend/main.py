from collections import defaultdict
from datetime import datetime, timezone
import csv
import io
from pathlib import Path
import re

from fastapi import FastAPI
from fastapi import File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.db import queries_collection, sales_collection
from backend.model.agent_planner import plan_chart_with_langchain_agent
from backend.model.predict import predict_chart

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChartQueryRequest(BaseModel):
    query: str
    chartType: str = "auto"


VALID_CHART_TYPES = {"auto", "bar", "line", "pie", "scatter", "histogram"}


def _to_int(value):
    try:
        return int(str(value).replace(",", "").strip())
    except Exception:
        return 0


def _maybe_number(value):
    if value is None:
        return value
    if isinstance(value, (int, float)):
        return value

    text = str(value).strip().replace(",", "")
    if text == "":
        return ""

    if re.fullmatch(r"-?\d+", text):
        try:
            return int(text)
        except Exception:
            return value

    if re.fullmatch(r"-?\d*\.\d+", text):
        try:
            return float(text)
        except Exception:
            return value

    return value


def _normalize(text: str) -> str:
    return text.lower().replace("_", " ").replace("-", " ")


def _get_fields_from_sample() -> list[str]:
    sample = sales_collection.find_one({}, {"_id": 0}) if sales_collection is not None else None
    if not sample:
        return []
    return list(sample.keys())


def detect_columns(query: str, fields: list[str]) -> tuple[str, str]:
    q = _normalize(query)
    metric_aliases = {
        "Amount": ["sales", "revenue", "amount", "value"],
        "Profit": ["profit", "margin"],
        "Quantity": ["quantity", "units", "count", "volume"],
    }

    dimension_aliases = {
        "State": ["state", "region"],
        "City": ["city"],
        "Category": ["category"],
        "Sub-Category": ["sub category", "subcategory"],
        "PaymentMode": ["payment", "payment mode", "paymentmethod", "mode"],
        "Year-Month": ["month", "time", "trend", "over time", "year"],
    }

    y_col = None
    for col, aliases in metric_aliases.items():
        if col in fields and any(alias in q for alias in aliases):
            y_col = col
            break
    if y_col is None:
        y_col = "Amount" if "Amount" in fields else (fields[1] if len(fields) > 1 else None)

    x_col = None
    for col, aliases in dimension_aliases.items():
        if col in fields and any(alias in q for alias in aliases):
            x_col = col
            break

    if x_col is None:
        for field in fields:
            f = _normalize(field)
            if f in q and field != y_col:
                x_col = field
                break

    if x_col is None:
        for candidate in ["Category", "State", "Year-Month", "City", "PaymentMode"]:
            if candidate in fields and candidate != y_col:
                x_col = candidate
                break

    if x_col is None and fields:
        x_col = fields[0]

    return x_col, y_col


def build_chart_data(x_col: str, y_col: str) -> list[dict]:
    grouped = defaultdict(int)
    for row in sales_collection.find({}, {"_id": 0, x_col: 1, y_col: 1}):
        key = str(row.get(x_col, "Unknown"))
        grouped[key] += _to_int(row.get(y_col, 0))

    data = [{x_col: k, y_col: v} for k, v in grouped.items()]
    if x_col == "Year-Month":
        data.sort(key=lambda item: item.get(x_col, ""))
    else:
        data.sort(key=lambda item: item.get(y_col, 0), reverse=True)
    return data[:12]


def build_scatter_data(base_data: list[dict], x_col: str, y_col: str) -> list[dict]:
    points = []
    for idx, item in enumerate(base_data, start=1):
        points.append(
            {
                "x": idx,
                "y": _to_int(item.get(y_col, 0)),
                "name": str(item.get(x_col, "Unknown")),
            }
        )
    return points


def build_histogram_data(base_data: list[dict], y_col: str, bins: int = 6) -> list[dict]:
    values = [_to_int(item.get(y_col, 0)) for item in base_data]
    if not values:
        return []

    min_v = min(values)
    max_v = max(values)
    if min_v == max_v:
        return [{"name": f"{min_v}-{max_v}", "value": len(values)}]

    bins = max(3, min(bins, 10))
    width = max(1, (max_v - min_v + bins - 1) // bins)
    counts = [0] * bins

    for v in values:
        idx = min((v - min_v) // width, bins - 1)
        counts[idx] += 1

    histogram = []
    for i, count in enumerate(counts):
        start = min_v + i * width
        end = start + width - 1
        histogram.append({"name": f"{start}-{end}", "value": count})

    return histogram


def _chart_snapshot(x_col: str, y_col: str) -> tuple[list[dict], list[dict]]:
    chart_data = build_chart_data(x_col, y_col)
    return chart_data, [{"name": d.get(x_col), "value": d.get(y_col)} for d in chart_data]

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.get("/test-insert")
def test_insert():
    if queries_collection is None:
        return {"error": "MongoDB not connected"}

    data = {"msg": "Inserted from FastAPI"}
    queries_collection.insert_one(data)
    return {"status": "Inserted successfully"}


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if sales_collection is None:
        return {"error": "MongoDB not connected"}

    if not file.filename.lower().endswith(".csv"):
        return {"error": "Please upload a CSV file"}

    content = await file.read()
    decoded = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))

    records = []
    for row in reader:
        parsed_row = {}
        for key, raw_value in row.items():
            clean_key = (key or "").strip()
            if not clean_key:
                continue

            parsed_value = _maybe_number(raw_value)

            # Keep canonical sales metrics as ints for consistency.
            if clean_key in {"Amount", "Profit", "Quantity"}:
                parsed_value = _to_int(parsed_value)

            parsed_row[clean_key] = parsed_value

        if parsed_row:
            records.append(parsed_row)

    sales_collection.delete_many({})
    if records:
        sales_collection.insert_many(records)

    return {
        "status": "File uploaded and imported",
        "filename": file.filename,
        "records_inserted": len(records),
    }


@app.post("/generate-chart")
def generate_chart(payload: ChartQueryRequest):
    if sales_collection is None:
        return {"error": "MongoDB not connected"}
    if sales_collection.count_documents({}) == 0:
        return {"error": "No data found. Upload a CSV first."}

    query = payload.query.strip()
    fields = _get_fields_from_sample()

    requested_chart_type = (payload.chartType or "auto").strip().lower()
    if requested_chart_type not in VALID_CHART_TYPES:
        requested_chart_type = "auto"

    # GenAI path: use LangChain agent + system prompt + Groq for chart planning.
    agent_plan = plan_chart_with_langchain_agent(query, fields)

    if agent_plan:
        chart_type = agent_plan["chartType"]
        x_col = agent_plan["x"]
        y_col = agent_plan["y"]
        plan_source = "langchain-agent"
        plan_reason = agent_plan.get("reason", "")
    else:
        # Fallback path: lightweight local model + deterministic column detection.
        chart_type = predict_chart(query)
        x_col, y_col = detect_columns(query, fields)
        plan_source = "ml-fallback"
        plan_reason = "Fallback to local model and heuristic column detection."

    if requested_chart_type != "auto":
        chart_type = requested_chart_type
        plan_source = "manual-override"
        plan_reason = f"User selected chart type: {requested_chart_type}."

    if not x_col or not y_col:
        return {"error": "Unable to detect chart columns from query/data."}

    base_data = build_chart_data(x_col, y_col)
    if chart_type == "scatter":
        chart_data = build_scatter_data(base_data, x_col, y_col)
    elif chart_type == "histogram":
        chart_data = build_histogram_data(base_data, y_col)
    else:
        chart_data = [{"name": d.get(x_col), "value": d.get(y_col)} for d in base_data]

    if queries_collection is not None:
        queries_collection.insert_one(
            {
                "query": query,
                "x": x_col,
                "y": y_col,
                "chartType": chart_type,
                "data": base_data,
                "chartData": chart_data,
                "groupBy": x_col,
                "metric": y_col,
                "requestedChartType": requested_chart_type,
                "source": plan_source,
                "reason": plan_reason,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
        )

    message = f"Bot: Generated {chart_type} chart for {x_col} vs {y_col}."

    # Always generate an AI explanation for the chart

    # Try to generate AI explanation, fallback to a simple message if unavailable
    try:
        explanation = generate_chart_explanation(query, {
            "chartType": chart_type,
            "x": x_col,
            "y": y_col
        }, base_data)
        if not explanation or explanation == "Explanation unavailable" or explanation == "Could not generate explanation":
            explanation = f"This is a {chart_type} chart showing {y_col} grouped by {x_col}."
    except Exception:
        explanation = f"This is a {chart_type} chart showing {y_col} grouped by {x_col}."

    return {
        "chartType": chart_type,
        "x": x_col,
        "y": y_col,
        "data": base_data,
        # Backward compatible fields for old frontend code.
        "chartData": chart_data,
        "groupBy": x_col,
        "metric": y_col,
        "requestedChartType": requested_chart_type,
        "message": message,
        "source": plan_source,
        "reason": plan_reason,
        "explanation": explanation,
    }


@app.get("/genai-status")
def genai_status():
    from config import GROQ_API_KEY, GROQ_MODEL

    return {
        "groqConfigured": bool(GROQ_API_KEY),
        "groqModel": GROQ_MODEL,
        "mode": "langchain-agent" if GROQ_API_KEY else "ml-fallback",
    }


@app.get("/history")
def get_history(limit: int = 20):
    if queries_collection is None:
        return {"error": "MongoDB not connected"}

    docs = list(
        queries_collection.find({}, {"_id": 0})
        .sort("_id", -1)
        .limit(limit)
    )
    enriched_docs = []
    for doc in docs:
        x_col = doc.get("x") or doc.get("groupBy")
        y_col = doc.get("y") or doc.get("metric")
        if x_col and y_col:
            data, chart_data = _chart_snapshot(x_col, y_col)
            doc["x"] = x_col
            doc["y"] = y_col
            doc.setdefault("groupBy", x_col)
            doc.setdefault("metric", y_col)
            doc.setdefault("data", data)
            doc.setdefault("chartData", chart_data)
        enriched_docs.append(doc)
    return {"history": enriched_docs}


@app.get("/insights")
def get_insights(metric: str = "Amount"):
    if sales_collection is None:
        return {"error": "MongoDB not connected"}
    if sales_collection.count_documents({}) == 0:
        return {"error": "No data found. Upload a CSV first."}

    valid_metrics = {"Amount", "Profit", "Quantity"}
    metric = metric if metric in valid_metrics else "Amount"

    rows = list(sales_collection.find({}, {"_id": 0, "Category": 1, metric: 1}))
    total = sum(_to_int(row.get(metric, 0)) for row in rows)

    by_category = defaultdict(int)
    for row in rows:
        by_category[str(row.get("Category", "Unknown"))] += _to_int(row.get(metric, 0))
    # --- Explanation Agent ---
    def generate_chart_explanation(query: str, chart_plan: dict, sample_data: list[dict]) -> str:
        try:
            from langchain_groq import ChatGroq
        except Exception:
            return "Explanation unavailable"

        llm = ChatGroq(
            api_key=GROQ_API_KEY,
            model=GROQ_MODEL,
            temperature=0.3,
        )

        prompt = (
            """
            Explain the following chart plan and data in simple terms for a business user. Be concise and insightful.
            Query: {query}
            Chart Type: {chart_type}
            X: {x}
            Y: {y}
            Sample Data: {sample}
            """.format(
                query=query,
                chart_type=chart_plan.get("chartType"),
                x=chart_plan.get("x"),
                y=chart_plan.get("y"),
                sample=sample_data[:5],
            )
        )

        try:
            response = llm.invoke(prompt)
            return response.content.strip()
        except Exception:
            return "Could not generate explanation"


@app.get("/sales-count")
def sales_count():
    if sales_collection is None:
        return {"error": "MongoDB not connected"}

    return {
        "collection": "sales_data",
        "count": sales_collection.count_documents({})
    }


@app.get("/analytics-summary")
def analytics_summary():
    if sales_collection is None:
        return {
            "connected": False,
            "message": "MongoDB not connected",
            "totalRows": 0,
            "columns": [],
            "numericSummary": {},
            "sample": [],
        }

    total_rows = sales_collection.count_documents({})
    if total_rows == 0:
        return {
            "connected": True,
            "message": "No data found. Upload a CSV first.",
            "totalRows": 0,
            "columns": [],
            "numericSummary": {},
            "sample": [],
        "explanation": explanation,
        }

    sample_doc = sales_collection.find_one({}, {"_id": 0}) or {}
    columns = list(sample_doc.keys())

    numeric_summary = {}
    for metric in ["Amount", "Profit", "Quantity"]:
        if metric in columns:
            values = [
                _to_int(row.get(metric, 0))
                for row in sales_collection.find({}, {"_id": 0, metric: 1})
            ]
            if values:
                numeric_summary[metric] = {
                    "min": min(values),
                    "max": max(values),
                    "avg": round(sum(values) / len(values), 2),
                }

    sample_rows = list(sales_collection.find({}, {"_id": 0}).limit(5))

    return {
        "connected": True,
        "message": "Analytics summary generated.",
        "totalRows": total_rows,
        "columns": columns,
        "numericSummary": numeric_summary,
        "sample": sample_rows,
    }