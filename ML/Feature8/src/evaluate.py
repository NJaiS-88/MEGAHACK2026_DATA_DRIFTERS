import os
import yaml
import faiss
import pandas as pd
from sentence_transformers import SentenceTransformer

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

def evaluate_retrieval():
    config = load_config()
    idx_path = config["paths"]["faiss_index"]
    df_path = config["paths"]["resource_df"]
    
    print("Loading index and dataset...")
    index = faiss.read_index(idx_path)
    df = pd.read_pickle(df_path)
    model = SentenceTransformer(config['model']['sentence_transformer'])
    
    # Create simple synthetic test cases
    test_queries = [
        "What is the role of photosynthesis in plants?",
        "Student thinks force keeps objects moving instead of inertia.",
        "How is the heart configured in humans?"
    ]
    
    q_embeddings = model.encode(test_queries, convert_to_numpy=True)
    faiss.normalize_L2(q_embeddings)
    
    k = 5
    distances, indices = index.search(q_embeddings, k)
    
    print("\nEvaluation on sample queries (Precision checking manually to verify logic):")
    for i, q in enumerate(test_queries):
        print(f"\nQuery: {q}")
        for j, rank in enumerate(indices[i]):
            score = distances[i][j]
            res = df.iloc[rank]
            print(f" - Rank {j+1} [{score:.3f}] ({res['resource_type']}) {res['title']}")

if __name__ == "__main__":
    evaluate_retrieval()
