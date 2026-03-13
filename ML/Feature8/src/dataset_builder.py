import os
import yaml
import pandas as pd
import uuid

def load_config():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    config_path = os.path.join(project_root, "config", "model_config.yaml")
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)
        
    for key, path in config['paths'].items():
        if not os.path.isabs(path):
            config['paths'][key] = os.path.join(project_root, path)
            
    return config

def build_dataset():
    config = load_config()
    in_path = os.path.join(config["paths"]["datasets_dir"], "sciq.csv")
    df = pd.read_csv(in_path)
    
    resources = []
    
    for idx, row in df.iterrows():
        # Explanation resource
        if pd.notna(row.get('support')) and len(str(row.get('support')).strip()) > 0:
            res_id = str(uuid.uuid4())
            resources.append({
                "resource_id": res_id,
                "concept": row.get('correct_answer', 'Science Concept'),
                "resource_type": "concept_explanation",
                "title": f"Understanding {row.get('correct_answer', 'Science Concept')}",
                "content": row['support'],
                "difficulty_level": "intermediate",
                "tags": "science, explanation"
            })
        
        # Practice questions resource
        res_id = str(uuid.uuid4())
        question_text = f"Question: {row['question']}\nOptions:\n- {row['distractor1']}\n- {row['distractor2']}\n- {row['distractor3']}\n- {row['correct_answer']}"
        resources.append({
            "resource_id": res_id,
            "concept": row.get('correct_answer', 'Science Concept'),
            "resource_type": "practice_questions",
            "title": f"Practice: {row.get('correct_answer', 'Concept')}",
            "content": question_text,
            "difficulty_level": "intermediate",
            "tags": "science, practice"
        })
    
    res_df = pd.DataFrame(resources)
    os.makedirs(config["paths"]["data_dir"], exist_ok=True)
    out_path = os.path.join(config["paths"]["data_dir"], "learning_resources.csv")
    res_df.to_csv(out_path, index=False)
    print(f"Built structured resource dataset with {len(res_df)} items at {out_path}")

if __name__ == "__main__":
    build_dataset()
