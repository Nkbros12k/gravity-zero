from pydantic import BaseModel
from typing import List, Optional

# Frontend API Requests
class PromptRequest(BaseModel):
    message: str
    target_dir: str
    chat_id: Optional[str] = None

# LLM Chat Completion Models (OpenAI Spec)
class ChatCompletionMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[ChatCompletionMessage]
    temperature: float = 0.7
    max_tokens: int = -1
    stream: bool = False

# Agent Internal Structures
class PlanStep(BaseModel):
    action: str
    file: Optional[str] = None
    command: Optional[str] = None
    description: Optional[str] = "No description provided."

class AgPlan(BaseModel):
    objective: str
    project_dir: str = "."
    steps: List[PlanStep]

class CodeChange(BaseModel):
    file_path: str
    action: str  # CREATE, MODIFY, DELETE
    content: str

class ReviewResult(BaseModel):
    approved: bool
    feedback: str
