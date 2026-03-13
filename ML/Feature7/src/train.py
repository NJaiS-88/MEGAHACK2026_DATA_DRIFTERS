import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer, get_linear_schedule_with_warmup
from torch.optim import AdamW
import yaml
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.data_pipeline import get_dataloaders
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import numpy as np

def train():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(root_dir, "config", "model_config.yaml")
    
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")

    # Load data
    train_loader, val_loader, num_classes = get_dataloaders("data/processed_dataset.csv", "config/model_config.yaml")

    print(f"Initializing Sequence Classifier with {num_classes} classes...")
    model = AutoModelForSequenceClassification.from_pretrained(
        config['model']['name'],
        num_labels=num_classes
    )
    model.to(device)

    optimizer = AdamW(model.parameters(), lr=float(config['model']['learning_rate']))
    epochs = config['model']['epochs']
    total_steps = len(train_loader) * epochs
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=0, num_training_steps=total_steps)

    best_f1 = 0
    output_dir = os.path.join(root_dir, config['model']['output_dir'])
    os.makedirs(output_dir, exist_ok=True)

    for epoch in range(epochs):
        print(f"\\nEpoch {epoch+1}/{epochs}")
        
        model.train()
        total_train_loss = 0
        
        for batch in train_loader:
            b_input_ids = batch['input_ids'].to(device)
            b_input_mask = batch['attention_mask'].to(device)
            b_labels = batch['labels'].to(device)
            
            optimizer.zero_grad()
            
            outputs = model(b_input_ids, attention_mask=b_input_mask, labels=b_labels)
            loss = outputs.loss
            total_train_loss += loss.item()
            
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()

        avg_train_loss = total_train_loss / len(train_loader)
        print(f"Training Loss: {avg_train_loss:.4f}")

        # Validation phase
        model.eval()
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

        acc = accuracy_score(all_labels, all_preds)
        prec = precision_score(all_labels, all_preds, average='weighted', zero_division=0)
        rec = recall_score(all_labels, all_preds, average='weighted', zero_division=0)
        f1 = f1_score(all_labels, all_preds, average='weighted', zero_division=0)
        
        print(f"Validation Accuracy: {acc:.4f} | Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            print(f"New best model found! Savings to {output_dir}")
            model.save_pretrained(output_dir)
            tokenizer = AutoTokenizer.from_pretrained(config['model']['name'])
            tokenizer.save_pretrained(output_dir)

if __name__ == "__main__":
    train()
