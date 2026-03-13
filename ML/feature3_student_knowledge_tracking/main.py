from fastapi import FastAPI
from .routes import submit_answer

app = FastAPI(
    title="ThinkMap AI - ML Service",
    description="Student Knowledge Tracking API",
    version="1.0.0"
)

# Include routers
app.include_router(submit_answer.router, tags=["Knowledge Tracking"])

@app.get("/")
def read_root():
    return {"message": "Welcome to ThinkMap AI - Student Knowledge Tracking API"}
