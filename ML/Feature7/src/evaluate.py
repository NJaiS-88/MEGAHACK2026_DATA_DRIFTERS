import torch
from transformers import AutoModelForSequenceClassification
import yaml
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.data_pipeline import get_dataloaders
from sklearn.metrics import classification_report
import numpy as np

def evaluate():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(root_dir, "config", "model_config.yaml")
    
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model_dir = os.path.join(root_dir, config['model']['output_dir'])
    
    if not os.path.exists(model_dir):
        print(f"Model directory {model_dir} not found. Train the model first using train.py.")
        return

    print("Loading validated model...")
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    model.to(device)
    model.eval()

    _, val_loader, _ = get_dataloaders("data/processed_dataset.csv", "config/model_config.yaml")
    
    all_preds = []
    all_labels = []

    for batch in val_loader:
        b_input_ids = batch['input_ids'].to(device)
        b_input_mask = batch['attention_mask'].to(device)
        b_labels = batch['labels'].to(device)
        
        with torch.no_grad():
            outputs = model(b_input_ids, attention_mask=b_input_mask)
            
        logits = outputs.logits.detach().cpu().numpy()
        label_ids = b_labels.to('cpu').numpy()
        
        preds = np.argmax(logits, axis=1)
        all_preds.extend(preds)
        all_labels.extend(label_ids)

    print("\\nEvaluation Report:")
    target_names = [
        "No Misconception",
        "Factual Error",
        "Unrelated / Missing Info",
        "Conceptual Understanding",
        "Misapplied Principle"
    ]
    print(classification_report(all_labels, all_preds, target_names=target_names, zero_division=0))

if __name__ == "__main__":
    evaluate()
