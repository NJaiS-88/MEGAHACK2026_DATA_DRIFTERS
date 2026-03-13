import os
import yaml
import numpy as np
import faiss

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

def train_index():
    config = load_config()
    emb_path = os.path.join(config["paths"]["models_dir"], "embeddings.npy")
    
    print("Loading embeddings...")
    embeddings = np.load(emb_path)
    
    dim = embeddings.shape[1]
    print(f"Building FAISS index for dimension {dim}...")
    
    # We use inner product, ST models like all-MiniLM output normalized embeddings
    index = faiss.IndexFlatIP(dim)
    faiss.normalize_L2(embeddings)
    index.add(embeddings)
    
    idx_path = config["paths"]["faiss_index"]
    faiss.write_index(index, idx_path)
    print(f"FAISS index saved to {idx_path}")

if __name__ == "__main__":
    train_index()
