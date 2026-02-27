from pathlib import Path

from app.core.config import settings


def save_file(name: str, data: bytes) -> str:
    storage_dir = Path(settings.STORAGE_DIR)
    storage_dir.mkdir(parents=True, exist_ok=True)

    stored_path = storage_dir / name
    stored_path.write_bytes(data)

    return stored_path.relative_to(storage_dir).as_posix()


def get_file_path(stored_path: str) -> str:
    storage_dir = Path(settings.STORAGE_DIR)
    return str((storage_dir / stored_path).resolve())


def delete_file(stored_path: str) -> None:
    file_path = Path(get_file_path(stored_path))
    if file_path.exists():
        file_path.unlink()
