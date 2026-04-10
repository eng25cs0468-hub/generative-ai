import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).with_name(".env"))


def _env(name: str, default: str = "") -> str:
	value = os.getenv(name)
	if value is None:
		return default
	value = value.strip()
	return value if value else default

# Keep fallback only to avoid breaking existing local setup.
MONGO_URI = _env(
	"MONGO_URI",
	"mongodb+srv://appuser:AppUser4056Test@cluster0.i7fn8pl.mongodb.net/genai_dashboard?retryWrites=true&w=majority",
)
DB_NAME = _env("DB_NAME", "genai_dashboard")

GROQ_API_KEY = _env("GROQ_API_KEY", "")
GROQ_MODEL = _env("GROQ_MODEL", "llama3-70b-8192")