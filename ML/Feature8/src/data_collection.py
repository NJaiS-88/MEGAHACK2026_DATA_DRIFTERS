import os
import yaml
from datasets import load_dataset
import pandas as pd

def load_config():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    config_path = os.path.join(project_root, "config", "model_config.yaml")
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)
        
    # Make directories absolute
    for key, path in config['paths'].items():
        if not os.path.isabs(path):
            config['paths'][key] = os.path.join(project_root, path)
            
    return config

def collect_data():
    config = load_config()
    print("Downloading 'sciq' dataset from HuggingFace...")
    # SciQ is a dataset of science questions, perfect for our educational domain
    dataset = load_dataset("sciq", split="train")
    df = pd.DataFrame(dataset)
    
    os.makedirs(config["paths"]["datasets_dir"], exist_ok=True)
    out_path = os.path.join(config["paths"]["datasets_dir"], "sciq.csv")
    df.to_csv(out_path, index=False)
    print(f"Data collected and saved to {out_path}")

if __name__ == "__main__":
    collect_data()
