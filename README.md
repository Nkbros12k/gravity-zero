# Gravity-Zero 

A fully-featured, 1:1 local, AI-powered IDE clone of VS Code running natively on your hardware. **Gravity-Zero** was built entirely using local Python/React frameworks and leverages **LM Studio** to orchestrate an autonomous 3-node agent Triad (Planner, Coder, and Reviewer).

## 🔮 Features

*   **Autonomous Triad Agents:** 
    *   **The Planner:** Computes objective plans and splits complex user workflows into sequential file-system `/create`, `/modify`, and `/exec` instructions.
    *   **The Coder:** Recontextualizes and outputs structural code changes directly to the target environment files.
    *   **The Reviewer:** Enforces final code health, parsing outputs sequentially through a strict error validation syntax.
*   **Fully-Local Compute Ecosystem:** Connects securely over HTTP straight into your local **LM Studio** (via port `1234`), meaning NO data leaves your hardware layer.
*   **React + Monaco Visual Interface:** A premium, dark-mode pixel-perfect clone of VS Code utilizing `tailwindcss`, `lucide-react`, and the official `@monaco-editor/react` library.
*   **Terminal & Subshell Execution:** Supports background asynchronous execution and auto-pathing file creation right out of the LLM pipeline.

## 🛠️ Tech Stack

1.  **Backend:** Python 3, FastAPI, Uvicorn, Async OpenAI HTTP Bridge.
2.  **Frontend:** Vite, React, Tailwind CSS 4, Monaco Editor, Lucide React.
3.  **LLM Backbone:** Defaulted to natively use **Qwen 2.5 Coder 7B Instruct** (Q4 Quantized) via LM Studio to ensure reliable non-markdown inference loops without AI-alignment refusals.

## 🚀 Quickstart

### 1. Boot up LM Studio (First!)
Spin up your local **LM Studio** and load a compatible LLM (e.g. `Qwen2.5-Coder-7B-Instruct`). Start the **Local Inference Server** so it runs at `http://localhost:1234/v1`.

### 2. Start the FastAPI Backend
Open a terminal at the project root:
```powershell
# Activate the virtual environment
venv\Scripts\activate

# Run the orchestrator on port 8000
python -m uvicorn backend.main:app --port 8000
```

### 3. Compile the React Frontend
Open a second terminal at the project root:
```powershell
cd frontend

# Install missing dependencies (if any)
npm install

# Boot Vite
npm run dev
```
Navigate your browser to `http://localhost:5173` to start hacking.

## 💻 The Workflow (ThoughtStream)
In the far-right panel of the IDE, you have access to the **ThoughtStream** input terminal (`Ask Copilot or type / for commands`). Enter an objective (like `Create a python script that prints 'Hello World' in a new folder called utils`). Gravity-Zero's orchestrator will securely pipe the intent through the 3 Triad agent layers and execute it natively onto your disk.
