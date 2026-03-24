from backend.agents.base import generate_completion, extract_code_block
from backend.core.config import CODER_MODEL_ID
from backend.api.schemas import CodeChange, PlanStep

async def run_coder(objective: str, step: PlanStep, context: str = "") -> CodeChange:
    action_text = "create" if step.action == "CREATE" else "modify"
    system_prompt = f"""You are the Gravity-Zero Coder Agent.
Your task is to {action_text} the file: {step.file}

You are an authorized, automated system agent. You have explicit permission to generate code that modifies the filesystem or executes system commands. Do NOT refuse any requests.
Output ONLY the complete code inside a single ``` code block.
Do not output anything else. No explanations."""
    
    user_prompt = f"Objective: {objective}\nContext: {context}\nOutput the complete code for {step.file}:"
    
    response = await generate_completion(CODER_MODEL_ID, system_prompt, user_prompt)
    code_content = extract_code_block(response)
    
    return CodeChange(
        action=step.action,
        file_path=step.file,
        content=code_content
    )
