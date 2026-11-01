import yaml
from pathlib import Path
from pydantic_settings import BaseSettings

CONFIG_PATH = Path(__file__).resolve().parent.parent.parent / "config" / "thresholds.yaml"

def load_thresholds() -> dict:
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return {}

THRESHOLDS = load_thresholds()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgroTrace"
    API_V1_STR: str = "/api"
    CACHE_DIR: Path = Path(__file__).resolve().parent.parent.parent / ".cache"
    DATABASE_URL: str = "sqlite:///./agrotrace.db"
    
    # LLM Settings
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    PLANNER_MODEL: str = "gemini-1.5-flash"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
settings.CACHE_DIR.mkdir(parents=True, exist_ok=True)
