"""
Main FastAPI Server
Guided Concept Exploration Engine
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from api.exploration_routes import router

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Guided Concept Exploration Engine",
    description="ML-powered system that transforms topic searches into personalized learning paths",
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
        "message": "Welcome to Guided Concept Exploration Engine",
        "version": "1.0.0",
        "endpoints": {
            "explore_topic": "/api/v1/explore-topic",
            "concept_explanation": "/api/v1/concept-explanation",
            "health": "/api/v1/health",
            "docs": "/docs"
        }
    }


@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup."""
    logger.info("Starting Guided Concept Exploration Engine...")
    
    # Pre-load the sentence transformer model
    try:
        from ml.concept_explorer import get_model
        model = get_model()
        logger.info("ML models loaded successfully")
    except Exception as e:
        logger.error(f"Error loading ML models: {str(e)}")
        raise
    
    logger.info("Server startup complete")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
