import json
import sys
import os

# Add feature_3 to path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_loaders.dataset_loader import get_all_datasets
from src.concept_tagger import ConceptTagger

def build_dataset():
    print("Fetching raw data...")
    raw_questions = get_all_datasets()
    print(f"Loaded {len(raw_questions)} raw questions.")
    
    tagger = ConceptTagger()
    
    processed_questions = []
    print("Tagging and processing questions...")
    
    # Process up to a limit or all
    count = 0
    for i, q in enumerate(raw_questions):
        # Clean question and options
        text = q["question"]
        options = q["options"]
        if not options: # Fix for datasets without explicit options
            options = ["A", "B", "C", "D"]
            
        concept = tagger.get_concept(text)
        if concept == "Uncategorized":
            continue
            
        difficulty = tagger.get_difficulty(text)
        
        processed_questions.append({
            "id": i + 1,
            "question": text,
            "options": options,
            "correct_answer": q["correct_answer"],
            "concept": concept,
            "difficulty": difficulty
        })
        
        count += 1
        if count % 100 == 0:
            print(f"Processed {count} questions...")
            
    # Save to JSON
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_path = os.path.join(base_dir, "data", "questions.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(processed_questions, f, indent=2)
        
    print(f"Successfully saved {len(processed_questions)} questions to {output_path}")

if __name__ == "__main__":
    build_dataset()
