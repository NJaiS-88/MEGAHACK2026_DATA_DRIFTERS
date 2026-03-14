"""
Main FastAPI Server
Misconception Investigation Agent
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from api.agent_routes import router

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Misconception Investigation Agent",
    description="Agentic AI system that investigates WHY student misconceptions occur",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Misconception Investigation Agent",
        "version": "1.0.0",
        "endpoints": {
            "investigate": "/api/v1/investigate",
            "health": "/api/v1/health",
            "docs": "/docs"
        }
    }


@app.on_event("startup")
async def startup_event():
    """Initialize agent on startup."""
    logger.info("Starting Misconception Investigation Agent...")
    logger.info("Agent initialized successfully")
    logger.info("Server startup complete")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
