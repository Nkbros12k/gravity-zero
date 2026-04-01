from backend.agents.base import generate_completion, extract_code_block
from backend.core.config import CODER_MODEL_ID
from backend.api.schemas import CodeChange, PlanStep


async def run_coder(objective: str, step: PlanStep, context: str = "") -> CodeChange:
    action_text = "create" if step.action == "CREATE" else "modify"
    system_prompt = f"""You are the Gravity-Zero Coder Agent.
Your task is to {action_text} the file: {step.file}

Output ONLY the complete file content inside a single ``` code block.
Do not include explanations, comments about what you changed, or any text outside the code block."""

    user_prompt = f"Objective: {objective}\nExisting file content:\n{context}\n\nOutput the complete code for {step.file}:"

    response = await generate_completion(CODER_MODEL_ID, system_prompt, user_prompt)
    code_content = extract_code_block(response)

    return CodeChange(
        action=step.action,
        file_path=step.file,
        content=code_content,
    )
