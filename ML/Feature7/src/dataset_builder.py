import pandas as pd
from datasets import load_dataset
from src.preprocessing import clean_text
import os
import sys

# Ensure proper path loading
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def build_dataset(output_path='data/processed_dataset.csv'):
    print("Building Multi-Domain Misconception Dataset...")
    records = []
    
    # 1. Scitail (Science Logic/Entailment)
    print("Loading HuggingFace Scitail Dataset (Science)...")
    try:
        scitail = load_dataset("scitail", "snli_format", split="train[:2500]")
        for item in scitail:
            explanation = item['sentence1'] + " means " + item['sentence2']
            if item['gold_label'] == 'contradiction':
                misconception = "Factual Error / Direct Contradiction"
            elif item['gold_label'] == 'neutral':
                misconception = "Unrelated / Missing Information"
            else:
                misconception = "No Misconception"
                
            records.append({
                "input_text": clean_text(explanation),
                "misconception_label": misconception,
                "concept_category": "Science"
            })
    except Exception as e:
        print(f"Skipped Scitail: {e}")

    # 2. AI2 ARC (Science Questions & Conceptual reasoning)
    print("Loading HuggingFace AI2_ARC Dataset (Conceptual Science)...")
    try:
        arc = load_dataset("ai2_arc", "ARC-Easy", split="train[:2000]")
        for item in arc:
            answer_key = item['answerKey']
            question = item['question']
            choices = item['choices']
            
            for label, text in zip(choices['label'], choices['text']):
                student_text = f"{question} The answer is {text}."
                if label != answer_key:
                    misconception = "Conceptual Misunderstanding"
                else:
                    misconception = "No Misconception"
                
                records.append({
                    "input_text": clean_text(student_text),
                    "misconception_label": misconception,
                    "concept_category": "General Science/Logic"
                })
    except Exception as e:
        print(f"Skipped ARC: {e}")

    # 3. OpenBookQA (General Knowledge & Common Sense)
    print("Loading HuggingFace OpenBookQA Dataset (General Knowledge)...")
    try:
        obqa = load_dataset("openbookqa", "main", split="train[:2000]")
        for item in obqa:
            answer_key = item['answerKey']
            question = item['question_stem']
            choices = item['choices']
            
            for label, text in zip(choices['label'], choices['text']):
                student_text = f"{question} {text}."
                if label != answer_key:
                    misconception = "Misapplied Principle / Reasoning Error"
                else:
                    misconception = "No Misconception"
                
                records.append({
                    "input_text": clean_text(student_text),
                    "misconception_label": misconception,
                    "concept_category": "Common Sense"
                })
    except Exception as e:
        print(f"Skipped OpenBookQA: {e}")

    df = pd.DataFrame(records)
    
    # Establish universal global mappings
    label_map_dict = {
        "No Misconception": 0,
        "Factual Error / Direct Contradiction": 1,
        "Unrelated / Missing Information": 2,
        "Conceptual Misunderstanding": 3,
        "Misapplied Principle / Reasoning Error": 4
    }
    
    df['label_id'] = df['misconception_label'].map(label_map_dict).fillna(0).astype(int)
    
    print("Cleaning and Deduplicating dataset...")
    df = df.drop_duplicates(subset=["input_text"])
    
    print("Balancing classes to ensure robust training logic...")
    if len(df) > 0:
        min_len = df['label_id'].value_counts().min()
        df = df.groupby('label_id').apply(lambda x: x.sample(min_len, random_state=42)).reset_index(drop=True)
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Dataset successfully built to {output_path} with {len(df)} records natively supporting 5 distinct structural classes!")

if __name__ == "__main__":
    # Ensure working directory resolves relative mappings correctly
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root_dir)
    build_dataset()
