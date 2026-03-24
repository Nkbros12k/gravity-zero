from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
from backend.api.schemas import PromptRequest
from backend.core.orchestrator import run_triad_workflow, cancel_workflow
from backend.tools.filesystem import list_directory, read_file
from backend.tools.terminal import run_command
import json

router = APIRouter()

# Global connection manager for Thought Stream
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.get("/health")
def health_check():
    return {"status": "ok"}

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
    await manager.broadcast(json.dumps({"type": "info", "message": f"Received objective: {request.message}"}))
    
    # Simple context injection for the agent MVP
    context = "Initial context. Target dir: " + request.target_dir
    
    async def log_callback(msg: str, msg_type: str):
        await manager.broadcast(json.dumps({"type": msg_type, "message": msg}))
    
    result = await run_triad_workflow(request.message, context, emit_log=log_callback, chat_id=request.chat_id)
    
    if result.get("status") == "error":
        await manager.broadcast(json.dumps({"type": "error", "message": "Triad workflow failed."}))
    elif result.get("status") == "cancelled":
        await manager.broadcast(json.dumps({"type": "error", "message": "Triad workflow was halted."}))
    else:
        await manager.broadcast(json.dumps({"type": "success", "message": "Triad workflow completed."}))
        
    return result

@router.post("/chat/cancel")
def cancel_chat():
    cancel_workflow()
    return {"status": "cancelled"}

@router.get("/fs/tree")
def get_file_tree(path: str = "."):
    return list_directory(path)

@router.get("/fs/read")
def read_fs_file(path: str):
    try:
        content = read_file(path)
        return {"content": content}
    except Exception as e:
        return {"error": str(e)}

@router.post("/terminal/run")
def execute_command(command: dict):
    cmd = command.get("command", "")
    cwd = command.get("cwd", ".")
    return run_command(cmd, cwd)
