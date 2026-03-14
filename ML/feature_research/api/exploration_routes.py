"""
Exploration Routes
API endpoints for the Guided Concept Exploration Engine.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import logging

from ml.concept_explorer import extract_concepts, generate_learning_path
from ml.concept_dependency import get_prerequisites
from ml.student_profile import analyze_student_readiness, get_student_profile
from services.misconception_bridge import run_misconception_detection
from services.reasoning_bridge import update_reasoning_score
from services.concept_map_bridge import update_concept_map

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["exploration"])


# Request/Response Models
class ExploreTopicRequest(BaseModel):
    student_id: str
    topic: str


class ConceptExplanationRequest(BaseModel):
    student_id: str
    concept: str
    student_explanation: str


class ExploreTopicResponse(BaseModel):
    core_concepts: List[str]
    prerequisites: Dict[str, List[str]]
    learning_path: List[str]
    student_readiness: Dict[str, Any]
    message: str


class ConceptExplanationResponse(BaseModel):
    misconception_detection: Dict[str, Any]
    reasoning_score: Dict[str, Any]
    concept_map_update: Dict[str, Any]
    message: str


@router.post("/explore-topic", response_model=ExploreTopicResponse)
async def explore_topic(request: ExploreTopicRequest):
    """
    Explore a topic and generate a personalized learning path.
    
    Process:
    1. Extract core concepts from the topic
    2. Detect prerequisites for each concept
    3. Analyze student readiness
    4. Generate ordered learning path
    """
    try:
        logger.info(f"Exploring topic '{request.topic}' for student {request.student_id}")
        
        # Step 1: Extract concepts
        concepts = extract_concepts(request.topic)
        
        if not concepts:
            raise HTTPException(
                status_code=400,
                detail="No concepts could be extracted from the topic"
            )
        
        # Step 2: Get prerequisites
        prerequisites = get_prerequisites(concepts)
        
        # Step 3: Analyze student readiness
        student_readiness = analyze_student_readiness(request.student_id, concepts)
        student_data = {
            "concept_mastery": student_readiness.get("student_mastery", {}),
            "misconceptions": student_readiness.get("misconceptions", [])
        }
        
        # Step 4: Generate learning path
        learning_path = generate_learning_path(concepts, prerequisites, student_data)
        
        response = ExploreTopicResponse(
            core_concepts=concepts,
            prerequisites=prerequisites,
            learning_path=learning_path,
            student_readiness=student_readiness,
            message=f"Successfully generated learning path for topic: {request.topic}"
        )
        
        logger.info(f"Successfully generated learning path with {len(learning_path)} concepts")
        return response
        
    except Exception as e:
        logger.error(f"Error exploring topic: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error exploring topic: {str(e)}")


@router.post("/concept-explanation", response_model=ConceptExplanationResponse)
async def process_concept_explanation(request: ConceptExplanationRequest):
    """
    Process student's concept explanation and update related systems.
    
    Process:
    1. Run misconception detection
    2. Update concept map
    3. Update reasoning score
    """
    try:
        logger.info(f"Processing explanation for concept '{request.concept}' from student {request.student_id}")
        
        # Step 1: Run misconception detection
        misconception_result = run_misconception_detection(
            request.student_explanation,
            request.concept
        )
        
        # Step 2: Update reasoning score
        reasoning_result = update_reasoning_score(
            request.student_id,
            request.concept,
            request.student_explanation
        )
        
        # Step 3: Update concept map (using reasoning score as mastery indicator)
        mastery_level = reasoning_result.get("reasoning_score", 50)
        concept_map_result = update_concept_map(
            request.student_id,
            request.concept,
            mastery_level
        )
        
        response = ConceptExplanationResponse(
            misconception_detection=misconception_result,
            reasoning_score=reasoning_result,
            concept_map_update=concept_map_result,
            message=f"Successfully processed explanation for concept: {request.concept}"
        )
        
        logger.info(f"Successfully processed explanation for concept: {request.concept}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing concept explanation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing concept explanation: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Guided Concept Exploration Engine"}
