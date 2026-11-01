import json
import hashlib
from pathlib import Path
from typing import Any, Optional
from app.core.config import settings

def get_cache_key(prefix: str, data: Any) -> str:
    serialized = json.dumps(data, sort_keys=True, default=str)
    h = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
    return f"{prefix}_{h}"

def read_cache(key: str) -> Optional[Any]:
    cache_file = settings.CACHE_DIR / f"{key}.json"
    if cache_file.exists():
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
    return None

def write_cache(key: str, data: Any) -> None:
    cache_file = settings.CACHE_DIR / f"{key}.json"
    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)
    except Exception:
        pass
