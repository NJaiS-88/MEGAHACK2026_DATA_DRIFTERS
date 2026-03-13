import yaml
from sentence_transformers import SentenceTransformer, util
import torch

import os

class ConceptTagger:
    def __init__(self, config_path=None):
        if config_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            config_path = os.path.join(base_dir, "config", "concepts.yaml")
            
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        
        self.concepts = self.config['concepts']
        self.model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        
        # Pre-compute embeddings for concepts based on their name and keywords
        self.concept_embeddings = []
        self.concept_names = []
        
        for concept in self.concepts:
            # Combine name and keywords for a richer representation
            text = f"{concept['name']} {' '.join(concept['keywords'])}"
            embedding = self.model.encode(text, convert_to_tensor=True)
            self.concept_embeddings.append(embedding)
            self.concept_names.append(concept['name'])
            
        self.concept_embeddings = torch.stack(self.concept_embeddings)

    def get_concept(self, question_text, threshold=0.25):
        # Encode question
        q_embedding = self.model.encode(question_text, convert_to_tensor=True)
        
        # Compute cosine similarity
        cos_scores = util.cos_sim(q_embedding, self.concept_embeddings)[0]
        
        # Get index of highest score
        best_idx = torch.argmax(cos_scores).item()
        best_score = cos_scores[best_idx].item()
        
        if best_score < threshold:
            return "Uncategorized"
            
        return self.concept_names[best_idx]

    def get_difficulty(self, question_text):
        # Simple heuristic for difficulty based on question length or complexity
        # In a real scenario, this could also be a model or part of the dataset
        words = question_text.split()
        if len(words) < 10:
            return "easy"
        elif len(words) < 20:
            return "medium"
        else:
            return "hard"
