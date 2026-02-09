from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
from pathlib import Path
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

# Ensure .env is found even when running from repo root.
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

USING_FALLBACK_DB = False

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is missing. Set it in backend/.env. "
        "For Supabase on IPv4-only networks, prefer the Session pooler URL "
        "(aws-0-<region>.pooler.supabase.com:5432) from the Supabase dashboard."
    )

def _ensure_sslmode_require(url: str) -> str:
    if not url.lower().startswith("postgres"):
        return url
    parsed = urlparse(url)
    q = dict(parse_qsl(parsed.query, keep_blank_values=True))
    if "sslmode" not in q:
        q["sslmode"] = "require"
        parsed = parsed._replace(query=urlencode(q))
        return urlunparse(parsed)
    return url

DATABASE_URL = _ensure_sslmode_require(DATABASE_URL)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()
