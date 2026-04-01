import asyncio
import os
from backend.core.config import WORKSPACE_DIR

COMMAND_TIMEOUT_SECONDS = 30


async def run_command(command: str, cwd: str = ".") -> dict:
    target_cwd = os.path.abspath(os.path.join(WORKSPACE_DIR, cwd))
    try:
        process = await asyncio.create_subprocess_shell(
            command,
            cwd=target_cwd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(
            process.communicate(),
            timeout=COMMAND_TIMEOUT_SECONDS,
        )
        return {
            "exit_code": process.returncode,
            "stdout": stdout.decode("utf-8", errors="replace"),
            "stderr": stderr.decode("utf-8", errors="replace"),
        }
    except asyncio.TimeoutError:
        process.kill()
        return {
            "exit_code": -1,
            "stdout": "",
            "stderr": f"Command timed out after {COMMAND_TIMEOUT_SECONDS}s",
        }
    except Exception as e:
        return {
            "exit_code": -1,
            "stdout": "",
            "stderr": str(e),
        }
