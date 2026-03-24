from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import routes

app = FastAPI(title="Gravity-Zero Orchestrator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Gravity-Zero Backend is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
