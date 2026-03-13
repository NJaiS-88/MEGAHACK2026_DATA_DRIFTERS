from functools import lru_cache
from typing import Optional
from pathlib import Path

from pydantic import Field, field_validator, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict

# Find project root (three levels up from feature1/config)
# ML/feature1/config/config.py -> ML/feature1/config/ -> ML/feature1/ -> ML/ -> MegaHack6.0/
base_dir = Path(__file__).resolve().parent.parent.parent.parent
env_file = base_dir / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(env_file) if env_file.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    gemini_api_key: Optional[str] = None
    # Force a known-good model name and IGNORE any GEMINI_MODEL env override
    # to avoid conflicts from global environment settings.
    gemini_model: str = Field("gemini-flash-latest")

    ocr_engine: str = Field("pytesseract", env="OCR_ENGINE")
    easyocr_langs: str = Field("en", env="EASYOCR_LANGS")

    max_chars_per_chunk: int = Field(8000, env="MAX_CHARS_PER_CHUNK")
    gemini_max_retries: int = Field(1, env="GEMINI_MAX_RETRIES")

    @field_validator("ocr_engine")
    @classmethod
    def validate_ocr_engine(cls, v: str) -> str:
        v_lower = v.lower()
        if v_lower not in {"pytesseract", "easyocr"}:
            raise ValueError("OCR_ENGINE must be either 'pytesseract' or 'easyocr'.")
        return v_lower

    @property
    def easyocr_lang_list(self) -> list[str]:
        return [lang.strip() for lang in self.easyocr_langs.split(",") if lang.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()


def clear_settings_cache():
    """Clear the cached settings instance. Useful for testing or when env vars change."""
    get_settings.cache_clear()

