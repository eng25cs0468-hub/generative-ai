from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


queries = [
    "show sales by region",
    "sales comparison",
    "compare product sales",
    "monthly revenue",
    "revenue over time",
    "profit trend",
    "category distribution",
    "market share",
    "sales breakdown",
    "sales by category",
    "growth over months",
    "yearly performance",
]

labels = [
    "bar",
    "bar",
    "bar",
    "line",
    "line",
    "line",
    "pie",
    "pie",
    "bar",
    "bar",
    "line",
    "line",
]


def train_and_save_model(model_path: Path) -> None:
    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
            ("clf", LogisticRegression(max_iter=1000, random_state=42)),
        ]
    )
    pipeline.fit(queries, labels)
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")


if __name__ == "__main__":
    model_file = Path(__file__).with_name("chart_type_model.joblib")
    train_and_save_model(model_file)
