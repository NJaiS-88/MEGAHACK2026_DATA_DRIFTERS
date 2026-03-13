import os
import yaml
import pandas as pd
import re

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

def clean_text(text):
    if not isinstance(text, str):
        return ""
    # Simplify spaces and new lines
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def preprocess_dataset():
    config = load_config()
    in_path = os.path.join(config["paths"]["data_dir"], "learning_resources.csv")
    df = pd.read_csv(in_path)
    
    # Apply text cleaning
    df['content'] = df['content'].apply(clean_text)
    
    # Filter out empty or extremely short contents
    df = df[df['content'].str.len() > 10]
    
    # Deduplicate matching contents
    df = df.drop_duplicates(subset=['content'])
    
    out_path = os.path.join(config["paths"]["data_dir"], "learning_resources_clean.csv")
    df.to_csv(out_path, index=False)
    print(f"Preprocessed dataset saved to {out_path} with {len(df)} items.")

if __name__ == "__main__":
    preprocess_dataset()
