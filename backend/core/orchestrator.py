import logging
from backend.agents.planner import run_planner
from backend.agents.coder import run_coder
from backend.agents.reviewer import run_reviewer
from backend.tools.filesystem import read_file, write_file
from backend.tools.terminal import run_command as execute_terminal
from backend.api.schemas import AgPlan
import os
from backend.core.config import WORKSPACE_DIR
from typing import Callable, Awaitable
from datetime import datetime

logger = logging.getLogger(__name__)

class TriadState:
    def __init__(self):
        self.is_cancelled = False

triad_state = TriadState()

def cancel_workflow():
    triad_state.is_cancelled = True

async def run_triad_workflow(objective: str, context: str, emit_log: Callable[[str, str], Awaitable[None]] = None, chat_id: str = None):
    triad_state.is_cancelled = False
    
    log_file_path = None
    if chat_id:
        log_dir = os.path.join(WORKSPACE_DIR, ".ag_logs")
        os.makedirs(log_dir, exist_ok=True)
        log_file_path = os.path.join(log_dir, f"{chat_id}.log")

    async def log(msg: str, level: str = "info"):
        if emit_log:
            await emit_log(msg, level)
        if level == "error":
            logger.error(msg)
        else:
            logger.info(msg)
            
        if log_file_path:
            try:
                with open(log_file_path, "a", encoding="utf-8") as f:
                    timestamp = datetime.now().isoformat()
                    f.write(f"[{timestamp}] [{level.upper()}] {msg}\n")
            except Exception:
                pass

    await log("Starting Planner phase...", "info")
    try:
        plan: AgPlan = await run_planner(objective, context)
    except Exception as e:
        await log(f"Planner error: {str(e)}", "error")
        return {"status": "error", "message": f"Planner error: {str(e)}"}
        
    if triad_state.is_cancelled:
        await log("Triad workflow was manually cancelled.", "error")
        return {"status": "cancelled"}
        
    await log(f"Generated Plan: {plan.objective} with {len(plan.steps)} steps.", "success")
    
    # Handle Dynamic Workspace Folder
    if getattr(plan, 'project_dir', '.') != '.':
        try:
            target_dir = os.path.join(WORKSPACE_DIR, plan.project_dir)
            os.makedirs(target_dir, exist_ok=True)
            await log(f"Provisioned new workspace directory: {plan.project_dir}/", "info")
            # Enforce that all steps operate inside this directory
            for step in plan.steps:
                if step.file and not step.file.startswith(plan.project_dir):
                    step.file = os.path.join(plan.project_dir, step.file).replace("\\", "/")
        except Exception as e:
            await log(f"Failed to create workspace directory: {e}", "error")
    
    applied_changes = []
    
    for step in plan.steps:
        if triad_state.is_cancelled:
            await log("Triad workflow was manually cancelled mid-step.", "error")
            break
            
        if step.action == "RUN" and step.command:
            await log(f"Executing Terminal Command: `{step.command}`...", "info")
            try:
                target_exec = getattr(plan, 'project_dir', '.')
                cmd_res = execute_terminal(step.command, target_exec)
                if cmd_res["exit_code"] == 0:
                    txt = cmd_res["stdout"][:500] if cmd_res["stdout"] else "Successfully completed"
                    await log(f"Terminal success:\n{txt}...", "success")
                else:
                    err = cmd_res["stderr"][:500] or cmd_res["stdout"][:500]
                    await log(f"Terminal failed (Exit {cmd_res['exit_code']}):\n{err}...", "error")
            except Exception as e:
                await log(f"Terminal execution error: {e}", "error")
            continue
            
        await log(f"Processing Planner Step: {step.description} on {step.file}", "info")
        
        file_context = ""
        if step.file and step.action in ["MODIFY", "DELETE"]:
            try:
                file_context = read_file(step.file)
            except Exception:
                pass
        
        try:
            await log(f"Invoking Coder for {step.file}...", "info")
            code_change = await run_coder(objective, step, context=file_context)
            if getattr(plan, 'project_dir', '.') != '.':
                if not code_change.file_path.startswith(plan.project_dir):
                    code_change.file_path = os.path.join(plan.project_dir, code_change.file_path).replace("\\", "/")
        except Exception as e:
            await log(f"Coder error: {str(e)}", "error")
            continue
            
        if triad_state.is_cancelled:
            await log("Triad workflow was manually cancelled mid-step.", "error")
            break
            
        await log(f"Coder output generated: {code_change.action} on {code_change.file_path}", "success")
        
        try:
            await log(f"Invoking Reviewer for {step.file}...", "info")
            review_result = await run_reviewer(objective, code_change)
        except Exception as e:
            await log(f"Reviewer error: {str(e)}", "error")
            continue
            
        if review_result.approved:
            await log(f"Reviewer result: APPROVED! Feedback: {review_result.feedback}", "success")
            if code_change.action in ["CREATE", "MODIFY"]:
                write_file(code_change.file_path, code_change.content)
            elif code_change.action == "DELETE":
                target = os.path.abspath(os.path.join(WORKSPACE_DIR, code_change.file_path))
                if os.path.exists(target):
                    os.remove(target)
            
            applied_changes.append(code_change.file_path)
            await log("Code change applied to filesystem successfully.", "success")
        else:
            await log(f"Reviewer result: REJECTED! Feedback: {review_result.feedback}", "error")
            
    plan_dump = plan.model_dump() if 'plan' in locals() and hasattr(plan, 'model_dump') else None
    return {"status": "success", "applied_changes": applied_changes, "plan": plan_dump}
