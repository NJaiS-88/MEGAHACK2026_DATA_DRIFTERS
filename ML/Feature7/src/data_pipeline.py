import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer
import yaml
import os

class MisconceptionDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
        
    def __len__(self):
        return len(self.texts)
        
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt',
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

def get_dataloaders(csv_path, config_path="config/model_config.yaml"):
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_abs_path = os.path.join(root_dir, config_path)
    csv_abs_path = os.path.join(root_dir, csv_path)
    
    with open(config_abs_path, "r") as f:
        config = yaml.safe_load(f)
        
    if not os.path.exists(csv_abs_path):
        raise FileNotFoundError(f"Dataset missing at {csv_abs_path}. Run dataset_builder.py first.")
        
    df = pd.read_csv(csv_abs_path)
    
    from sklearn.model_selection import train_test_split
    df_train, df_val = train_test_split(df, test_size=0.2, random_state=42)
    
    tokenizer = AutoTokenizer.from_pretrained(config['model']['name'])
    
    train_dataset = MisconceptionDataset(
        df_train['input_text'].values,
        df_train['label_id'].values,
        tokenizer,
        config['model']['max_length']
    )
    
    val_dataset = MisconceptionDataset(
        df_val['input_text'].values,
        df_val['label_id'].values,
        tokenizer,
        config['model']['max_length']
    )
    
    train_loader = DataLoader(train_dataset, batch_size=config['model']['batch_size'], shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=config['model']['batch_size'], shuffle=False)
    
    # We now have 5 distinct classification mappings
    num_classes = 5
    
    return train_loader, val_loader, num_classes
