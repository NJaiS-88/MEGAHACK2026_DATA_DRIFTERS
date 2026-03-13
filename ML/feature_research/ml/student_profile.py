"""
Student Profile Module
Manages student learning data and readiness analysis.
"""

from typing import Dict, Any, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mock student profiles database
student_profiles = {
    "123": {
        "concept_mastery": {
            "Memory Management": 40,
            "Pointers": 65,
            "Functions": 70,
            "Variables": 85,
            "Data Types": 80
        },
        "misconceptions": [
            "Memory Allocation misunderstanding",
            "Pointer arithmetic confusion"
        ],
        "learning_style": "visual",
        "difficulty_level": "intermediate"
    },
    "456": {
        "concept_mastery": {
            "Functions": 90,
            "Control Flow": 85,
            "Data Structures": 75
        },
        "misconceptions": [],
        "learning_style": "hands-on",
        "difficulty_level": "advanced"
    },
    "789": {
        "concept_mastery": {
            "Variables": 50,
            "Data Types": 45
        },
        "misconceptions": [
            "Variable scope confusion"
        ],
        "learning_style": "theoretical",
        "difficulty_level": "beginner"
    }
}


def get_student_profile(student_id: str) -> Dict[str, Any]:
    """
    Retrieve student profile by ID.
    
    Args:
        student_id: Unique student identifier
        
    Returns:
        Student profile dictionary
    """
    profile = student_profiles.get(student_id, {
        "concept_mastery": {},
        "misconceptions": [],
        "learning_style": "balanced",
        "difficulty_level": "intermediate"
    })
    
    logger.info(f"Retrieved profile for student {student_id}")
    return profile


def analyze_student_readiness(student_id: str, concepts: List[str]) -> Dict[str, Any]:
    """
    Analyze student readiness for a set of concepts.
    
    Args:
        student_id: Student identifier
        concepts: List of concepts to analyze readiness for
        
    Returns:
        Dictionary with readiness analysis including:
        - recommended_starting_concept
        - readiness_scores (per concept)
        - overall_readiness
    """
    profile = get_student_profile(student_id)
    mastery = profile.get("concept_mastery", {})
    misconceptions = profile.get("misconceptions", [])
    
    readiness_scores = {}
    for concept in concepts:
        # Base score from mastery
        base_score = mastery.get(concept, 0)
        
        # Penalty for misconceptions (if concept-related)
        penalty = 0
        for misconception in misconceptions:
            if concept.lower() in misconception.lower() or misconception.lower() in concept.lower():
                penalty += 10
        
        readiness_scores[concept] = max(0, base_score - penalty)
    
    # Find recommended starting concept (lowest readiness = needs most work)
    if readiness_scores:
        recommended = min(readiness_scores.items(), key=lambda x: x[1])[0]
    else:
        recommended = concepts[0] if concepts else None
    
    # Calculate overall readiness
    if readiness_scores:
        overall_readiness = sum(readiness_scores.values()) / len(readiness_scores)
    else:
        overall_readiness = 0
    
    analysis = {
        "recommended_starting_concept": recommended,
        "readiness_scores": readiness_scores,
        "overall_readiness": overall_readiness,
        "student_mastery": mastery,
        "misconceptions": misconceptions
    }
    
    logger.info(f"Analyzed readiness for student {student_id}: {len(concepts)} concepts")
    return analysis


def update_student_mastery(student_id: str, concept: str, mastery_score: int):
    """
    Update student mastery for a specific concept.
    
    Args:
        student_id: Student identifier
        concept: Concept name
        mastery_score: Mastery score (0-100)
    """
    if student_id not in student_profiles:
        student_profiles[student_id] = {
            "concept_mastery": {},
            "misconceptions": [],
            "learning_style": "balanced",
            "difficulty_level": "intermediate"
        }
    
    student_profiles[student_id]["concept_mastery"][concept] = mastery_score
    logger.info(f"Updated mastery for student {student_id}, concept {concept}: {mastery_score}")


def add_misconception(student_id: str, misconception: str):
    """
    Add a misconception to student profile.
    
    Args:
        student_id: Student identifier
        misconception: Description of the misconception
    """
    if student_id not in student_profiles:
        student_profiles[student_id] = {
            "concept_mastery": {},
            "misconceptions": [],
            "learning_style": "balanced",
            "difficulty_level": "intermediate"
        }
    
    if misconception not in student_profiles[student_id]["misconceptions"]:
        student_profiles[student_id]["misconceptions"].append(misconception)
        logger.info(f"Added misconception for student {student_id}: {misconception}")
