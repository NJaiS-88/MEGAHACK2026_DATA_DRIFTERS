import os
import yaml
import pandas as pd
from sentence_transformers import SentenceTransformer
import numpy as np

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

def build_embeddings():
    config = load_config()
    in_path = os.path.join(config["paths"]["data_dir"], "learning_resources_clean.csv")
    df = pd.read_csv(in_path)
    
    model_name = config['model']['sentence_transformer']
    print(f"Loading SentenceTransformer: {model_name}")
    model = SentenceTransformer(model_name)
    
    print("Encoding contents...")
    embeddings = model.encode(df['content'].tolist(), show_progress_bar=True, convert_to_numpy=True)
    
    os.makedirs(config["paths"]["models_dir"], exist_ok=True)
    
    emb_path = os.path.join(config["paths"]["models_dir"], "embeddings.npy")
    np.save(emb_path, embeddings)
    
    df_path = config["paths"]["resource_df"]
    df.to_pickle(df_path)
    print(f"Embeddings saved to {emb_path} and dataframe to {df_path}")

if __name__ == "__main__":
    build_embeddings()
