import json
import re
from typing import Any

from backend.config import GROQ_API_KEY, GROQ_MODEL

VALID_CHARTS = {"bar", "line", "pie"}

SYSTEM_PROMPT = """
You are a data visualization planning agent for a Generative AI dashboard.
Your task: decide the best chart and columns from a user query and available dataset columns.

Rules:
1) Return ONLY a valid JSON object.
2) JSON keys must be exactly: chartType, x, y, reason.
3) chartType must be one of: bar, line, pie.
4) x and y must exactly match one of the available columns.
5) Prefer time columns for line charts when query implies trend/month/year/time.
6) Prefer numeric columns for y.

Do not include markdown fences or extra text.
""".strip()


def _extract_json(raw: str) -> dict[str, Any] | None:
    if not raw:
        return None

    # Try direct parse first.
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    # Fallback: parse first JSON block.
    match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
    if not match:
        return None

    try:
        parsed = json.loads(match.group(0))
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        return None


def _validate_plan(plan: dict[str, Any], fields: list[str]) -> dict[str, Any] | None:
    chart_type = str(plan.get("chartType", "")).lower().strip()
    x = str(plan.get("x", "")).strip()
    y = str(plan.get("y", "")).strip()
    reason = str(plan.get("reason", "")).strip()

    if chart_type not in VALID_CHARTS:
        return None
    if x not in fields or y not in fields:
        return None

    return {
        "chartType": chart_type,
        "x": x,
        "y": y,
        "reason": reason,
    }


def plan_chart_with_langchain_agent(query: str, fields: list[str]) -> dict[str, Any] | None:
    if not GROQ_API_KEY:
        return None

    try:
        from langchain.agents import AgentExecutor, create_tool_calling_agent
        from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
        from langchain_core.tools import tool
        from langchain_groq import ChatGroq
    except Exception:
        return None

    fields_text = ", ".join(fields) if fields else ""
    numeric_candidates = [col for col in ["Amount", "Profit", "Quantity"] if col in fields]

    @tool
    def list_available_columns() -> str:
        """Return all dataset columns that can be used for x/y."""
        return fields_text

    @tool
    def list_numeric_columns() -> str:
        """Return numeric columns suitable for y-axis aggregation."""
        return ", ".join(numeric_candidates)

    llm = ChatGroq(
        api_key=GROQ_API_KEY,
        model=GROQ_MODEL,
        temperature=0,
    )

    tools = [list_available_columns, list_numeric_columns]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            (
                "human",
                "User query: {query}\n"
                "Available columns: {fields}\n"
                "First inspect tools if needed, then produce final JSON output only.",
            ),
            MessagesPlaceholder("agent_scratchpad"),
        ]
    )

    agent = create_tool_calling_agent(llm, tools, prompt)
    executor = AgentExecutor(agent=agent, tools=tools, verbose=False)

    try:
        result = executor.invoke({"query": query, "fields": fields_text})
    except Exception:
        return None

    output = str(result.get("output", "")).strip()
    parsed = _extract_json(output)
    if parsed is None:
        return None

    return _validate_plan(parsed, fields)
