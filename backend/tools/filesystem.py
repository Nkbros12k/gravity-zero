import os
from typing import List, Dict, Any
from backend.core.config import WORKSPACE_DIR

def list_directory(path: str = ".") -> List[Dict[str, Any]]:
    target = os.path.abspath(os.path.join(WORKSPACE_DIR, path))
    
    items = []
    if not os.path.exists(target):
        return items

    for entry in os.scandir(target):
        if entry.name in [".git", "node_modules", "venv", "__pycache__", ".venv"]:
            continue
        items.append({
            "name": entry.name,
            "is_dir": entry.is_dir(),
            "path": os.path.relpath(entry.path, WORKSPACE_DIR).replace("\\", "/")
        })
    
    # Sort directories first, then files
    items.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))
    return items

def read_file(path: str) -> str:
    target = os.path.abspath(os.path.join(WORKSPACE_DIR, path))
    with open(target, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path: str, content: str):
    target = os.path.abspath(os.path.join(WORKSPACE_DIR, path))
    os.makedirs(os.path.dirname(target), exist_ok=True)
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
