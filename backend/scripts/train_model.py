"""
Train the ScamPurr AI listing scam classifier.

Default:
    python scripts/train_model.py

With a custom labeled CSV:
    python scripts/train_model.py --data data/training_examples.csv

CSV columns:
    text,label
    "Free kitten, pay shipping by gift card",1
    "Licensed shelter, meet in person, vet records included",0
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split


DEFAULT_DATA_PATH = Path("data/training_examples.csv")
DEFAULT_MODEL_PATH = Path("model/scam_classifier.pkl")


SCAM_LISTINGS = [
    "Beautiful Persian kittens available for free. Pay the shipping fee via Western Union before delivery.",
    "Ragdoll kittens free to good home. I cannot meet in person but can arrange nationwide delivery.",
    "Scottish Fold kittens. Pay a small transport fee by gift card. Last chance before they go to shelter.",
    "Free Maine Coon kitten due to deployment. Send wire transfer deposit first, then we ship overnight.",
    "Pure breed Siamese, free adoption. Wire transfer only, no meetups available.",
    "Bengal kittens free. Must pay delivery fee via Zelle to confirm.",
    "Healthy kittens available. Send money order for shipping.",
    "Purebred Persian free to approved home. Payment via Bitcoin for transport.",
    "Exotic shorthair kittens. Pay insurance fee to ship.",
    "Maine Coon kittens going fast. Can't meet, will ship. Western Union payment only.",
]


LEGITIMATE_LISTINGS = [
    "Friendly adult tabby available from a registered shelter. Vaccinated, spayed, and microchipped.",
    "Two bonded brothers looking for a home. Local pickup only. Adoption form required.",
    "Non-profit rescue has kittens ready for adoption. Vet checked, vaccinated, and dewormed.",
    "Licensed rescue, adoption process includes application and interview. Health certificate provided.",
    "Rescue tabby loves cuddles. Come visit us at the shelter. Adoption fee covers vet costs.",
    "Domestic shorthair looking for family. Adoption application and in-person interview required.",
    "Accredited rescue organization with health certificates. Adoption fee applies.",
    "Tortoiseshell cat, neutered and microchipped. Visit our shelter for adoption application.",
    "Registered rescue places cats with families after reference checks and home visit.",
    "Licensed shelter. Vaccination records, vet history, and microchip included in adoption.",
]


def synthetic_dataset() -> pd.DataFrame:
    rows = []
    for text in SCAM_LISTINGS:
        rows.append({"text": text, "label": 1})
        rows.append({"text": text.lower(), "label": 1})
    for text in LEGITIMATE_LISTINGS:
        rows.append({"text": text, "label": 0})
        rows.append({"text": text.lower(), "label": 0})
    return pd.DataFrame(rows)


def load_dataset(path: Path) -> pd.DataFrame:
    if not path.exists():
        print(f"No CSV found at {path}; using built-in demo training data.")
        return synthetic_dataset()

    data = pd.read_csv(path)
    required_columns = {"text", "label"}
    missing = required_columns - set(data.columns)
    if missing:
        raise ValueError(f"Training CSV is missing columns: {', '.join(sorted(missing))}")

    data = data[["text", "label"]].dropna()
    data["text"] = data["text"].astype(str).str.strip()
    data["label"] = data["label"].astype(int)
    data = data[data["text"] != ""]

    invalid_labels = sorted(set(data["label"]) - {0, 1})
    if invalid_labels:
        raise ValueError(f"Labels must be 0 or 1. Invalid labels: {invalid_labels}")

    if data["label"].nunique() < 2:
        raise ValueError("Training data must include both classes: 0=legitimate and 1=scam.")

    return data


def train(data_path: Path, model_path: Path) -> None:
    print("Building training dataset...")
    data = load_dataset(data_path)

    X_train, X_test, y_train, y_test = train_test_split(
        data["text"],
        data["label"],
        test_size=0.2,
        random_state=42,
        stratify=data["label"],
    )

    print(f"Training samples: {len(X_train)}, test samples: {len(X_test)}")

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        stop_words="english",
        min_df=1,
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    classifier = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        random_state=42,
        class_weight="balanced",
    )
    classifier.fit(X_train_vec, y_train)

    y_pred = classifier.predict(X_test_vec)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Scam"]))

    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "vectorizer": vectorizer,
            "classifier": classifier,
            "feature_names": vectorizer.get_feature_names_out().tolist(),
        },
        model_path,
    )
    print(f"\nModel saved to {model_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train the ScamPurr AI listing classifier.")
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA_PATH, help="CSV with text,label columns.")
    parser.add_argument("--out", type=Path, default=DEFAULT_MODEL_PATH, help="Output model path.")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    train(args.data, args.out)
