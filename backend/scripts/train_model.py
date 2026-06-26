"""
Train the ScamPurr AI listing scam classifier.
Generates: model/scam_classifier.pkl (TF-IDF vectorizer + Random Forest)

Usage:
    cd backend
    python scripts/train_model.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# ── Synthetic Training Data ────────────────────────────────────────────────────

SCAM_LISTINGS = [
    "Beautiful Persian kittens available for free! Due to my recent deployment overseas, I need to find them good homes quickly. You will only need to pay the shipping fee of $150 via Western Union.",
    "Adorable Ragdoll kittens, free to good home. Contact me at mypets@gmail.com. I cannot meet in person but can arrange nationwide delivery. God bless you.",
    "Scottish Fold kittens for rehoming! Act now, limited time! Pay a small transport fee of $200 gift card. Last chance before they go to the shelter.",
    "Free Maine Coon kitten due to circumstances. Pastor needs urgent home. Send wire transfer deposit first, then we'll ship overnight.",
    "Pure breed Siamese, free adoption. Owner is terminally ill and cannot care for them. Wire transfer only, no meetups available.",
    "BENGAL KITTENS FREE! First come first served! Must pay delivery fee via Zelle to confirm. Once payment received, we will ship.",
    "Healthy kittens available. I'm a missionary in Africa and cannot bring them with me. Please send money order for shipping.",
    "Purebred Persian, free to approved home. No questions asked, can be shipped anywhere. Payment via Bitcoin for security.",
    "Exotic shorthair kittens FREE! My family is going through divorce so I need to rehome quickly. Pay insurance fee to ship.",
    "Beautiful Bengal kittens for adoption. Send $300 via gift card for vaccination fee before meeting. Act now!",
    "Maine Coon kittens going fast! Can't meet, will ship. Western Union payment only. God bless!",
    "Free ragdoll for good home. Military deployment, must go ASAP. Shipping fee via money gram required.",
    "Purebred Siamese kittens, no papers needed. Pay $200 customs fee to release from quarantine.",
    "Adorable kittens need urgent home. Owner passed away. Contact me for shipping, pay upfront via cash app.",
    "FREE Scottish fold! One day only! Send $150 Zelle for transport fee. Won't last!",
    "Bengal kittens free to caring owner. I cannot meet but will ship with courier. Pay insurance fee first.",
    "Gorgeous Persian kittens. Due to moving abroad, giving away free but need shipping fee. WhatsApp me.",
    "Rare kittens available free. Pay only delivery charges via Western Union. Act now, limited offer.",
    "Beautiful kittens free to good home. No meetup, delivery only nationwide. Transfer fee required.",
    "Adorable Ragdoll. Owner in hospital, needs urgent rehoming. Wire $250 for transport and insurance.",
]

LEGITIMATE_LISTINGS = [
    "Friendly adult tabby cat available for adoption from our registered shelter. Fully vaccinated, spayed, and microchipped. Adoption application required. Come meet her at our facility on weekends.",
    "Two bonded brothers, 3 years old, looking for their forever home. Both neutered and up to date on vaccinations. Local pickup only. Please fill out our adoption form.",
    "Our non-profit rescue has 5 kittens ready for adoption. All kittens have been vet checked, vaccinated, and dewormed. Home visit required. Adoption fee: $75 covers vet costs.",
    "Mixed breed cat seeking loving home. Licensed rescue, adoption process includes application and interview. Health certificate provided. In-person meeting required.",
    "Rescue tabby, 2 years old, loves cuddles. Come visit us at the shelter. Fully vaccinated and microchipped. $50 adoption fee to cover spay and vaccinations.",
    "3-year-old domestic shorthair looking for his forever family. ASPCA member rescue. Adoption application, home visit, and in-person interview required. All vet records provided.",
    "We have 8 kittens available through our accredited rescue organization. All have received health certificates and are ready for their forever homes. Adoption fee applies.",
    "Beautiful tortoiseshell, neutered and microchipped. Please visit our shelter or check petfinder.com for our adoption application. Health guarantee included.",
    "Senior cats need loving homes! Our registered 501c3 rescue places cats with families. Adoption process includes application, reference check, and in-person meeting.",
    "Friendly ginger tabby needs a home. We are a licensed shelter. Vaccination records, vet history, and microchip included in adoption. Come meet him any Saturday.",
    "Two sisters looking for home together. Both spayed, vaccinated, microchipped. Local pickup in Seattle. Full vet records included. Adoption fee $150 for the pair.",
    "Young male, neutered, litter trained. Registered no-kill shelter. Full health exam, FIV/FeLV tested, all vaccines current. Adoption fee $80.",
    "Playful kittens ready for adoption. All have first set of vaccines and deworming. Adoption application available on our website. Home checks conducted.",
    "Rescue from hoarding situation, now healthy and ready for adoption. Fully vetted, vaccinated, microchipped. Licensed rescue organization.",
    "Bonded pair of cats needing a home. Please visit our shelter website to submit application. Home visit required. All vet records included.",
    "Friendly adult cat, 4 years old. Spayed, vaccinated, microchipped. Adoption fee $60. Must meet at our facility. References required.",
    "Orange tabby kitten, 12 weeks. Vet checked, first vaccines done. Local adoptions only — come visit us at our Brookside location.",
    "Maine Coon mix needing home. Registered rescue with accreditation. Detailed health history provided. Adoption process and home check required.",
    "Older cat available for adoption. Our non-profit organization works with certified vets. Home visit, adoption application, and reference check required.",
    "Beautiful black cat, very affectionate. 501c3 rescue with established track record. Full vet records, microchip, all vaccines. In-person adoption only.",
]

# ── Build Dataset ──────────────────────────────────────────────────────────────

def build_dataset():
    texts = SCAM_LISTINGS + LEGITIMATE_LISTINGS
    labels = [1] * len(SCAM_LISTINGS) + [0] * len(LEGITIMATE_LISTINGS)

    # Augment with variations
    augmented_texts = []
    augmented_labels = []
    for text, label in zip(texts, labels):
        augmented_texts.append(text)
        augmented_labels.append(label)
        # Simple augmentation: lowercase version
        augmented_texts.append(text.lower())
        augmented_labels.append(label)
        # Truncated version
        augmented_texts.append(text[:len(text)//2])
        augmented_labels.append(label)

    return augmented_texts, augmented_labels


def train():
    print("Building training dataset...")
    texts, labels = build_dataset()

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")

    # TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        stop_words="english",
        min_df=1,
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Random Forest Classifier
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        random_state=42,
        class_weight="balanced",
    )
    clf.fit(X_train_vec, y_train)

    # Evaluate
    y_pred = clf.predict(X_test_vec)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Scam"]))

    # Save model
    os.makedirs("model", exist_ok=True)
    model_path = "model/scam_classifier.pkl"
    joblib.dump({
        "vectorizer": vectorizer,
        "classifier": clf,
        "feature_names": vectorizer.get_feature_names_out().tolist(),
    }, model_path)
    print(f"\nModel saved to {model_path}")


if __name__ == "__main__":
    train()
