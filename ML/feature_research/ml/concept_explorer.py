"""
Concept Explorer Module
Handles concept extraction and learning path generation using ML models.
"""

from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model instance
_model = None


def get_model():
    """Lazy load the sentence transformer model."""
    global _model
    if _model is None:
        logger.info("Loading sentence transformer model...")
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        logger.info("Model loaded successfully")
    return _model


def extract_concepts(topic: str) -> List[str]:
    """
    Extract core concepts from a given topic.
    
    Args:
        topic: The topic to extract concepts from (e.g., "Rust Programming Language")
        
    Returns:
        List of extracted concepts
    """
    # Topic-specific concept extraction using template logic
    # In production, this could use LLM or more sophisticated NLP
    
    topic_lower = topic.lower()
    
    # Concept templates for different topics
    concept_templates = {
        "rust": [
            "Ownership Model",
            "Borrowing",
            "Lifetimes",
            "Memory Safety",
            "Concurrency",
            "Zero-Cost Abstractions"
        ],
        "python": [
            "Object-Oriented Programming",
            "List Comprehensions",
            "Decorators",
            "Generators",
            "Exception Handling",
            "Memory Management"
        ],
        "javascript": [
            "Closures",
            "Promises",
            "Async/Await",
            "Event Loop",
            "Prototypes",
            "Hoisting"
        ],
        "machine learning": [
            "Supervised Learning",
            "Unsupervised Learning",
            "Neural Networks",
            "Gradient Descent",
            "Overfitting",
            "Cross-Validation"
        ]
    }
    
    # Match topic to template
    concepts = []
    for key, value in concept_templates.items():
        if key in topic_lower:
            concepts = value
            break
    
    # Default concepts if no match
    if not concepts:
        concepts = [
            "Fundamentals",
            "Core Principles",
            "Advanced Topics",
            "Best Practices",
            "Common Patterns"
        ]
    
    logger.info(f"Extracted {len(concepts)} concepts for topic: {topic}")
    return concepts


def generate_learning_path(
    concepts: List[str],
    prerequisites: Dict[str, List[str]],
    student_data: Dict[str, Any]
) -> List[str]:
    """
    Generate an ordered learning path based on concepts, prerequisites, and student mastery.
    
    Args:
        concepts: List of concepts to learn
        prerequisites: Dictionary mapping concepts to their prerequisites
        student_data: Student's current mastery and misconceptions
        
    Returns:
        Ordered list of concepts representing the learning path
    """
    from ml.concept_dependency import get_prerequisites
    from ml.student_profile import analyze_student_readiness
    
    # Get prerequisite mapping for all concepts
    all_prerequisites = get_prerequisites(concepts)
    
    # Analyze student readiness
    student_mastery = student_data.get("concept_mastery", {})
    misconceptions = student_data.get("misconceptions", [])
    
    # Build dependency graph
    concept_set = set(concepts)
    visited = set()
    learning_path = []
    
    def get_concept_priority(concept: str) -> float:
        """Calculate priority based on prerequisites and student mastery."""
        # Check if prerequisites are met
        prereqs = all_prerequisites.get(concept, [])
        prereq_met = all(prereq in visited or prereq not in concept_set 
                        for prereq in prereqs)
        
        if not prereq_met:
            return -1  # Cannot learn yet
        
        # Check student mastery
        mastery = student_mastery.get(concept, 0)
        
        # Lower mastery = higher priority (needs more work)
        # But also consider prerequisite completion
        priority = 100 - mastery
        
        return priority
    
    # Topological sort with student awareness
    remaining = set(concepts)
    
    while remaining:
        # Find concepts that can be learned (prerequisites met)
        available = []
        for concept in remaining:
            priority = get_concept_priority(concept)
            if priority >= 0:
                available.append((priority, concept))
        
        if not available:
            # If no concepts available, add remaining in any order
            learning_path.extend(sorted(remaining))
            break
        
        # Sort by priority (highest first)
        available.sort(reverse=True, key=lambda x: x[0])
        
        # Add the highest priority concept
        _, next_concept = available[0]
        learning_path.append(next_concept)
        visited.add(next_concept)
        remaining.remove(next_concept)
    
    logger.info(f"Generated learning path with {len(learning_path)} concepts")
    return learning_path


def get_concept_similarity(concept1: str, concept2: str) -> float:
    """
    Calculate semantic similarity between two concepts using embeddings.
    
    Args:
        concept1: First concept
        concept2: Second concept
        
    Returns:
        Similarity score between 0 and 1
    """
    model = get_model()
    embeddings = model.encode([concept1, concept2])
    
    # Calculate cosine similarity
    from numpy import dot
    from numpy.linalg import norm
    
    similarity = dot(embeddings[0], embeddings[1]) / (norm(embeddings[0]) * norm(embeddings[1]))
    return float(similarity)
