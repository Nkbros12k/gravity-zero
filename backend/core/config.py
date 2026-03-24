import os

# LM Studio connection details
LM_STUDIO_BASE_URL = os.getenv("LM_STUDIO_BASE_URL", "http://localhost:1234/v1")

# Default target models for the Triad agents
PLANNER_MODEL_ID = os.getenv("PLANNER_MODEL_ID", "qwen2.5-coder-7b-instruct")
CODER_MODEL_ID = os.getenv("CODER_MODEL_ID", "qwen2.5-coder-7b-instruct")
REVIEWER_MODEL_ID = os.getenv("REVIEWER_MODEL_ID", "qwen2.5-coder-7b-instruct")

# Target workspace directory for filesystem/terminal tools
# By default, runs from the parent of the backend directory
WORKSPACE_DIR = os.getenv("WORKSPACE_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
