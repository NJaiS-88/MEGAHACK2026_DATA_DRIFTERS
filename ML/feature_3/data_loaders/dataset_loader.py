from datasets import load_dataset
import pandas as pd

def load_arc():
    print("Loading ARC-Challenge...")
    dataset = load_dataset("ai2_arc", "ARC-Challenge", split="train")
    questions = []
    for item in dataset:
        # Resolve answerKey to the actual choice text
        choices = item["choices"]
        correct_text = ""
        for label, text in zip(choices["label"], choices["text"]):
            if label == item["answerKey"]:
                correct_text = text
                break
                
        questions.append({
            "question": item["question"],
            "options": choices["text"],
            "correct_answer": correct_text or item["answerKey"],
            "source": "ai2_arc"
        })
    return questions

def load_openbookqa():
    print("Loading OpenBookQA...")
    dataset = load_dataset("openbookqa", "main", split="train")
    questions = []
    for item in dataset:
        # Resolve answerKey to the actual choice text
        choices = item["choices"]
        correct_text = ""
        for label, text in zip(choices["label"], choices["text"]):
            if label == item["answerKey"]:
                correct_text = text
                break
                
        questions.append({
            "question": item["question_stem"],
            "options": choices["text"],
            "correct_answer": correct_text or item["answerKey"],
            "source": "openbookqa"
        })
    return questions

def load_explanation_bank():
    print("Loading Explanation Bank...")
    # Using a subset or specific split if available, otherwise general load
    try:
        dataset = load_dataset("explanation_bank", split="train")
        questions = []
        for item in dataset:
            # Explanation bank structure might differ, adapting based on common HF patterns
            # Note: Explanation bank is often used for explanations, but let's try to extract Q&A if possible
            if "question" in item and "answer" in item:
                questions.append({
                    "question": item["question"],
                    "options": item.get("options", []),
                    "correct_answer": item["answer"],
                    "source": "explanation_bank"
                })
        return questions
    except Exception as e:
        print(f"Error loading explanation_bank: {e}")
        return []

def get_all_datasets():
    all_qs = []
    all_qs.extend(load_arc())
    all_qs.extend(load_openbookqa())
    # all_qs.extend(load_explanation_bank()) # Optional or based on availability
    return all_qs
