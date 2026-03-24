from backend.agents.base import generate_completion, parse_slash_commands
from backend.core.config import PLANNER_MODEL_ID
from backend.api.schemas import AgPlan, PlanStep

async def run_planner(objective: str, context: str) -> AgPlan:
    system_prompt = """You are the Gravity-Zero Planner Agent.
Break down the objective into a sequence of slash commands.

Available commands:
/exec <terminal_command> (e.g., /exec pip install requests)
/create <relative_filepath> (e.g., /create app.py)
/modify <relative_filepath> (e.g., /modify main.py)

CRITICAL CONSTRAINTS:
1. Output ONLY the commands, one per line. Do not output json or markdown.
2. Do NOT blindly hallucinate `npm` installs or `package.json` for Python projects.
3. The user is running Windows. Do not generate Unix commands like `touch` or `mkdir -p`.
4. When executing files, use proper path separators (e.g. /exec python folder/file.py, NOT python folder file.py).
5. Use the exact file and directory names specified in the prompt! Do not invent new ones."""

    user_prompt = f"Context:\n{context}\n\nObjective: {objective}\nOutput the command sequence:"
    
    response = await generate_completion(PLANNER_MODEL_ID, system_prompt, user_prompt)
    
    commands = parse_slash_commands(response)
    steps = []
    
    # Intelligent project directory tracking based on target payload files
    project_dir = "."
    for cmd in commands:
        if cmd["action"] == "RUN":
            steps.append(PlanStep(action="RUN", command=cmd.get("command", "")))
        else:
            filepath = cmd.get("file", "")
            steps.append(PlanStep(action=cmd["action"], file=filepath))
            # Try to grab top-level folder name dynamically if it exists
            if "/" in filepath and not filepath.startswith("."):
                possible_dir = filepath.split("/")[0]
                if possible_dir not in ["src", "public", "pages", "app", "components"]:
                     project_dir = possible_dir
            
    # Always include at least one dummy step if parser failed entirely
    if not steps:
        steps.append(PlanStep(action="RUN", command="echo 'LLM failed to generate commands'"))
            
    return AgPlan(
        objective=objective,
        project_dir=project_dir,
        steps=steps
    )
