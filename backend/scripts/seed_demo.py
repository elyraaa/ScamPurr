"""
Seed Demo Data for ScamPurr AI
-------------------------------
Creates 3 demo analyses (LOW, MEDIUM, HIGH risk) for a demo user.
Useful for showcasing the platform without manual input.

Usage:
    cd backend
    cp .env.example .env
    python scripts/seed_demo.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()

from app.database import SessionLocal, create_all_tables
from app.models.user import User
from app.models.analysis import Analysis, AnalysisType
from app.models.risk_score import RiskScore, Explanation, RiskLabel

DEMO_USER = {
    "id": "demo-user-seed-001",
    "firebase_uid": "demo-user-1",
    "email": "demo@scampurr.ai",
    "display_name": "Demo Cat Detective",
    "photo_url": None,
}

DEMO_ANALYSES = [
    # ── LOW RISK ──────────────────────────────────────────────────────────────
    {
        "id": str(uuid.uuid4()),
        "type": AnalysisType.LISTING,
        "input_text": "Our registered non-profit rescue has 3 kittens ready for adoption. All are vaccinated, microchipped, and spayed/neutered. Adoption application required. Please visit our shelter to meet them in person. $75 adoption fee covers vet costs. Full vet records provided.",
        "input_url": None,
        "created_at": datetime.now(timezone.utc) - timedelta(days=3),
        "risk": {
            "listing_score": 8.5,
            "url_score": None,
            "combined_score": 8.5,
            "risk_label": RiskLabel.LOW,
        },
        "explanations": [
            {
                "factor": "Licensed or Registered Organization",
                "weight": 0.80,
                "description": "Presents verifiable registration — a registered non-profit rescue organization.",
                "is_red_flag": False,
                "category": "verification",
                "order": 0,
            },
            {
                "factor": "Proper Adoption Process",
                "weight": 0.70,
                "description": "Follows a proper vetting process (application, spay/neuter, microchip), typical of legitimate shelters.",
                "is_red_flag": False,
                "category": "verification",
                "order": 1,
            },
            {
                "factor": "Veterinary Documentation Provided",
                "weight": 0.65,
                "description": "Mentions full vet records, vaccination, and health documentation — strong transparency signals.",
                "is_red_flag": False,
                "category": "verification",
                "order": 2,
            },
            {
                "factor": "Encourages In-Person Meeting",
                "weight": 0.60,
                "description": "Invites potential adopters to visit the shelter in person — typical of legitimate shelters.",
                "is_red_flag": False,
                "category": "verification",
                "order": 3,
            },
        ],
    },
    # ── MEDIUM RISK ───────────────────────────────────────────────────────────
    {
        "id": str(uuid.uuid4()),
        "type": AnalysisType.URL,
        "input_text": None,
        "input_url": "http://cutekittens4u.xyz/adopt",
        "created_at": datetime.now(timezone.utc) - timedelta(days=1),
        "risk": {
            "listing_score": None,
            "url_score": 52.0,
            "combined_score": 52.0,
            "risk_label": RiskLabel.MEDIUM,
        },
        "explanations": [
            {
                "factor": "No HTTPS Encryption",
                "weight": 0.80,
                "description": "Site uses plain HTTP — no SSL/TLS encryption. Legitimate adoption sites always use HTTPS.",
                "is_red_flag": True,
                "category": "ssl",
                "order": 0,
            },
            {
                "factor": "High-Risk Domain Extension",
                "weight": 0.75,
                "description": "Domain uses '.xyz' — a top-level domain frequently associated with spam and scam sites.",
                "is_red_flag": True,
                "category": "domain",
                "order": 1,
            },
            {
                "factor": "Recently Registered Domain",
                "weight": 0.45,
                "description": "Domain is approximately 45 days old — recently registered sites carry higher risk.",
                "is_red_flag": True,
                "category": "domain",
                "order": 2,
            },
        ],
    },
    # ── CRITICAL RISK ─────────────────────────────────────────────────────────
    {
        "id": str(uuid.uuid4()),
        "type": AnalysisType.COMBINED,
        "input_text": "Beautiful Persian kittens FREE! I'm going through a divorce and need urgent rehoming. Act now — only 2 left! You only need to pay a $200 shipping fee via Western Union or gift card. Can't meet in person — will ship nationwide. God bless you!",
        "input_url": "http://free-persian-kittens.tk/adopt-now",
        "created_at": datetime.now(timezone.utc) - timedelta(hours=2),
        "risk": {
            "listing_score": 89.5,
            "url_score": 91.0,
            "combined_score": 90.1,
            "risk_label": RiskLabel.CRITICAL,
        },
        "explanations": [
            {
                "factor": "Suspicious Payment Method",
                "weight": 0.92,
                "description": "Requests payment via Western Union and gift cards — untraceable payment methods exclusively used by scammers.",
                "is_red_flag": True,
                "category": "payment",
                "order": 0,
            },
            {
                "factor": "Suspicious Fee Request",
                "weight": 0.88,
                "description": "Requests a $200 'shipping fee' — scammers use these fees to extract money after initial contact.",
                "is_red_flag": True,
                "category": "payment",
                "order": 1,
            },
            {
                "factor": "Refuses In-Person Meeting",
                "weight": 0.80,
                "description": "Explicitly refuses local pickup. Legitimate adopters always allow you to meet the cat first.",
                "is_red_flag": True,
                "category": "verification",
                "order": 2,
            },
            {
                "factor": "High-Risk Domain Extension",
                "weight": 0.75,
                "description": "Domain uses '.tk' — a top-level domain extremely common in scam and phishing sites.",
                "is_red_flag": True,
                "category": "domain",
                "order": 3,
            },
            {
                "factor": "Artificial Urgency",
                "weight": 0.70,
                "description": "Uses high-pressure urgency ('Act now', 'only 2 left') to prevent you from researching the listing.",
                "is_red_flag": True,
                "category": "language",
                "order": 4,
            },
            {
                "factor": "Sob Story / Life Crisis",
                "weight": 0.65,
                "description": "Uses divorce as justification for unusual selling conditions — a classic emotional manipulation tactic.",
                "is_red_flag": True,
                "category": "language",
                "order": 5,
            },
            {
                "factor": "Religious Appeal Manipulation",
                "weight": 0.75,
                "description": "Invokes religion ('God bless you') to build false trust — a common scam tactic in pet listings.",
                "is_red_flag": True,
                "category": "language",
                "order": 6,
            },
            {
                "factor": "No HTTPS Encryption",
                "weight": 0.80,
                "description": "Site uses plain HTTP with no SSL encryption.",
                "is_red_flag": True,
                "category": "ssl",
                "order": 7,
            },
        ],
    },
]


def seed():
    create_all_tables()
    db = SessionLocal()

    try:
        # Upsert demo user
        user = db.query(User).filter(User.firebase_uid == DEMO_USER["firebase_uid"]).first()
        if not user:
            user = User(**DEMO_USER)
            db.add(user)
            db.commit()
            print(f"Created demo user: {user.email}")
        else:
            print(f"Demo user already exists: {user.email}")

        # Seed analyses
        for demo in DEMO_ANALYSES:
            existing = db.query(Analysis).filter(Analysis.id == demo["id"]).first()
            if existing:
                print(f"Analysis {demo['id'][:8]}... already exists, skipping.")
                continue

            analysis = Analysis(
                id=demo["id"],
                user_id=user.id,
                type=demo["type"],
                input_text=demo["input_text"],
                input_url=demo["input_url"],
                created_at=demo["created_at"],
            )
            db.add(analysis)
            db.commit()

            risk_score_id = str(uuid.uuid4())
            risk_score = RiskScore(
                id=risk_score_id,
                analysis_id=demo["id"],
                listing_score=demo["risk"]["listing_score"],
                url_score=demo["risk"]["url_score"],
                combined_score=demo["risk"]["combined_score"],
                risk_label=demo["risk"]["risk_label"],
            )
            db.add(risk_score)
            db.commit()

            for i, exp_data in enumerate(demo["explanations"]):
                exp = Explanation(
                    id=str(uuid.uuid4()),
                    risk_score_id=risk_score_id,
                    **exp_data,
                )
                db.add(exp)
            db.commit()

            print(
                f"Seeded {demo['type'].value} analysis — "
                f"{demo['risk']['risk_label'].value} ({demo['risk']['combined_score']})"
            )

        print("\n✅ Demo data seeded successfully!")
        print(f"   Login token for demo: demo-user-1")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
