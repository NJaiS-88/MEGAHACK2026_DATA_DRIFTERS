"""
Concept Dependency Module
Manages prerequisite relationships between concepts.
"""

from typing import List, Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample concept dependency graph
concept_graph = {
    "Ownership Model": ["Memory Management"],
    "Borrowing": ["Ownership Model"],
    "Lifetimes": ["Borrowing", "Ownership Model"],
    "Memory Safety": ["Memory Management", "Ownership Model"],
    "Concurrency": ["Memory Safety", "Ownership Model"],
    "Zero-Cost Abstractions": ["Ownership Model", "Borrowing"],
    
    # Python concepts
    "Object-Oriented Programming": ["Functions", "Data Structures"],
    "List Comprehensions": ["Lists", "Loops"],
    "Decorators": ["Functions", "Closures"],
    "Generators": ["Iterators", "Functions"],
    "Exception Handling": ["Control Flow"],
    "Memory Management": ["Variables", "Data Types"],
    
    # JavaScript concepts
    "Closures": ["Functions", "Scope"],
    "Promises": ["Asynchronous Programming"],
    "Async/Await": ["Promises", "Asynchronous Programming"],
    "Event Loop": ["Asynchronous Programming", "Callbacks"],
    "Prototypes": ["Objects", "Inheritance"],
    "Hoisting": ["Scope", "Variables"],
    
    # ML concepts
    "Supervised Learning": ["Machine Learning Basics", "Data Preprocessing"],
    "Unsupervised Learning": ["Machine Learning Basics", "Data Preprocessing"],
    "Neural Networks": ["Supervised Learning", "Linear Algebra"],
    "Gradient Descent": ["Calculus", "Optimization"],
    "Overfitting": ["Model Evaluation", "Supervised Learning"],
    "Cross-Validation": ["Model Evaluation", "Data Splitting"],
    
    # Generic concepts
    "Fundamentals": [],
    "Core Principles": ["Fundamentals"],
    "Advanced Topics": ["Core Principles"],
    "Best Practices": ["Core Principles"],
    "Common Patterns": ["Core Principles"]
}


def get_prerequisites(concepts: List[str]) -> Dict[str, List[str]]:
    """
    Get prerequisite mapping for a list of concepts.
    
    Args:
        concepts: List of concepts to get prerequisites for
        
    Returns:
        Dictionary mapping each concept to its list of prerequisites
    """
    prerequisites = {}
    
    for concept in concepts:
        # Direct prerequisites from graph
        direct_prereqs = concept_graph.get(concept, [])
        
        # Filter to only include prerequisites that are in the concepts list
        # or are foundational concepts
        relevant_prereqs = [
            prereq for prereq in direct_prereqs
            if prereq in concepts or prereq in ["Memory Management", "Functions", 
                                                 "Variables", "Data Types", "Control Flow",
                                                 "Machine Learning Basics", "Data Preprocessing"]
        ]
        
        prerequisites[concept] = relevant_prereqs
    
    logger.info(f"Retrieved prerequisites for {len(concepts)} concepts")
    return prerequisites


def add_concept_dependency(concept: str, prerequisites: List[str]):
    """
    Add a new concept dependency to the graph.
    
    Args:
        concept: The concept that depends on prerequisites
        prerequisites: List of prerequisite concepts
    """
    concept_graph[concept] = prerequisites
    logger.info(f"Added dependency: {concept} depends on {prerequisites}")


def get_all_dependencies(concept: str) -> List[str]:
    """
    Get all transitive dependencies for a concept (recursive).
    
    Args:
        concept: The concept to get all dependencies for
        
    Returns:
        List of all prerequisite concepts (transitive closure)
    """
    visited = set()
    dependencies = []
    
    def dfs(current_concept: str):
        if current_concept in visited:
            return
        visited.add(current_concept)
        
        prereqs = concept_graph.get(current_concept, [])
        for prereq in prereqs:
            if prereq not in dependencies:
                dependencies.append(prereq)
            dfs(prereq)
    
    dfs(concept)
    return dependencies
