from pathlib import Path

import joblib

MODEL_PATH = Path(__file__).with_name("chart_type_model.joblib")


PIE_KEYWORDS = [
    "distribution",
    "share",
    "proportion",
    "percentage",
    "percent",
    "composition",
    "breakdown",
    "split",
    "parts",
    "ratio",
    "pie",
]

LINE_KEYWORDS = [
    "trend",
    "over time",
    "time series",
    "monthly",
    "month",
    "yearly",
    "year",
    "weekly",
    "quarter",
    "growth",
    "change over time",
    "forecast",
    "line",
]

BAR_KEYWORDS = [
    "compare",
    "comparison",
    "by ",
    "vs",
    "top",
    "rank",
    "category",
    "state",
    "region",
    "city",
    "product",
    "sales",
]


def _keyword_chart_type(query: str) -> str | None:
    q = query.lower().replace("_", " ").replace("-", " ")

    if any(keyword in q for keyword in PIE_KEYWORDS):
        return "pie"

    if any(keyword in q for keyword in LINE_KEYWORDS):
        return "line"

    if any(keyword in q for keyword in BAR_KEYWORDS):
        return "bar"

    return None


def _rule_based_fallback(query: str) -> str:
    chart_type = _keyword_chart_type(query)
    if chart_type:
        return chart_type
    return "bar"


def predict_chart(query: str) -> str:
    if not query or not query.strip():
        return "bar"

    keyword_chart = _keyword_chart_type(query)
    if keyword_chart:
        return keyword_chart

    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
        pred = model.predict([query])[0]
        if pred in {"bar", "line", "pie"}:
            if hasattr(model, "predict_proba"):
                try:
                    probabilities = model.predict_proba([query])[0]
                    classes = list(model.classes_)
                    confidence = probabilities[classes.index(pred)] if pred in classes else 0.0
                    if confidence >= 0.55:
                        return pred
                except Exception:
                    pass
            else:
                return pred

    return _rule_based_fallback(query)
