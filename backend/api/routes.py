from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from typing import List
from backend.api.schemas import PromptRequest
from backend.core.orchestrator import run_triad_workflow, cancel_workflow
from backend.tools.filesystem import list_directory, read_file
from backend.tools.terminal import run_command
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "gravity-zero"}


@router.websocket("/ws/thoughts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.post("/chat")
async def handle_prompt(request: PromptRequest):
    await manager.broadcast(json.dumps({
        "type": "info",
        "message": f"Received objective: {request.message}"
    }))

    context = f"Initial context. Target dir: {request.target_dir}"

    async def log_callback(msg: str, msg_type: str):
        await manager.broadcast(json.dumps({"type": msg_type, "message": msg}))

    try:
        result = await run_triad_workflow(
            request.message, context,
            emit_log=log_callback,
            chat_id=request.chat_id,
        )
    except Exception as e:
        logger.exception("Triad workflow crashed")
        raise HTTPException(status_code=500, detail=str(e))

    status = result.get("status")
    if status == "error":
        await manager.broadcast(json.dumps({
            "type": "error",
            "message": f"Triad workflow failed: {result.get('message', '')}"
        }))
    elif status == "cancelled":
        await manager.broadcast(json.dumps({
            "type": "error",
            "message": "Triad workflow was halted."
        }))
    else:
        await manager.broadcast(json.dumps({
            "type": "success",
            "message": "Triad workflow completed."
        }))

    return result


@router.post("/chat/cancel")
def cancel_chat():
    cancel_workflow()
    return {"status": "cancelled"}


@router.get("/fs/tree")
def get_file_tree(path: str = "."):
    try:
        return list_directory(path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Directory not found: {path}")
    except PermissionError:
        raise HTTPException(status_code=403, detail=f"Permission denied: {path}")


@router.get("/fs/read")
def read_fs_file(path: str):
    if not path:
        raise HTTPException(status_code=400, detail="Path parameter is required")
    try:
        content = read_file(path)
        return {"content": content}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {path}")
    except PermissionError:
        raise HTTPException(status_code=403, detail=f"Permission denied: {path}")
    except UnicodeDecodeError:
        raise HTTPException(status_code=422, detail=f"Cannot read binary file: {path}")


@router.post("/terminal/run")
async def execute_command(command: dict):
    cmd = command.get("command", "")
    if not cmd:
        raise HTTPException(status_code=400, detail="Command is required")
    cwd = command.get("cwd", ".")
    result = await run_command(cmd, cwd)
    return result
