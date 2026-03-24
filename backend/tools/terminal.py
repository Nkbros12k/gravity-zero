import subprocess
import os
from backend.core.config import WORKSPACE_DIR

def run_command(command: str, cwd: str = ".") -> dict:
    target_cwd = os.path.abspath(os.path.join(WORKSPACE_DIR, cwd))
    try:
        # Run command synchronously for simplicity in this MVP
        result = subprocess.run(
            command,
            cwd=target_cwd,
            shell=True,
            capture_output=True,
            text=True
        )
        return {
            "exit_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr
        }
    except Exception as e:
        return {
            "exit_code": -1,
            "stdout": "",
            "stderr": str(e)
        }
