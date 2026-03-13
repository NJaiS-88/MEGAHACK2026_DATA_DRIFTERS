import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Find project root (one level up from ML)
# ML/feature3_student_knowledge_tracking/config.py -> ML/ -> MegaHack6.0/
base_dir = Path(__file__).resolve().parent.parent.parent
env_file = base_dir / ".env"

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "megahack"  # Changed from "thinkmap_ai" to "megahack"
    GEMINI_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=str(env_file) if env_file.exists() else None,
        extra="ignore",
        env_file_encoding="utf-8"
    )

settings = Settings()

# Debug: Print loaded URI (masking password)
masked_uri = settings.MONGODB_URI
if "@" in masked_uri:
    prefix, suffix = masked_uri.split("@")
    if ":" in prefix:
        p_parts = prefix.split(":")
        masked_uri = f"{p_parts[0]}:****@{suffix}"
print(f"[Config] Loaded MONGODB_URI: {masked_uri}")
