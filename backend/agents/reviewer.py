from backend.agents.base import generate_completion
from backend.core.config import REVIEWER_MODEL_ID
from backend.api.schemas import CodeChange, ReviewResult


async def run_reviewer(objective: str, code_change: CodeChange) -> ReviewResult:
    system_prompt = """You are the Gravity-Zero Reviewer Agent.
Analyze the code provided to ensure it fulfills the user's objective and has no syntax errors.

Output EXACTLY one of the following formats:
APPROVED
REJECTED: <your feedback describing the issue>"""

    user_prompt = (
        f"Objective: {objective}\n\n"
        f"File: {code_change.file_path}\n"
        f"Action: {code_change.action}\n"
        f"Code:\n```\n{code_change.content}\n```\n\n"
        f"Review this code:"
    )

    response = await generate_completion(REVIEWER_MODEL_ID, system_prompt, user_prompt)

    decision_line = response.strip().split("\n")[0].strip().upper()

    if decision_line.startswith("APPROVED"):
        return ReviewResult(
            approved=True,
            feedback="Code meets all requirements.",
        )

    feedback = response.replace("REJECTED:", "").strip()
    if not feedback:
        feedback = "The code failed validation."
    return ReviewResult(approved=False, feedback=feedback)
