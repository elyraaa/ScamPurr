"""
ML Service — Adoption Listing Scam Classifier
----------------------------------------------
Supports two modes:

  MOCK MODE  (USE_MOCK_ML=true):
    Fast, dependency-free rule-based scorer using weighted keyword patterns.
    Ships out of the box — no model file, no training required.
    Returns a score from 0–100 with detailed factor explanations.

  REAL MODE  (USE_MOCK_ML=false):
    TF-IDF vectorizer → Random Forest classifier trained on synthetic scam data.
    Load from MODEL_PATH (default: model/scam_classifier.pkl).
    Run scripts/train_model.py to generate the model file.

Both modes return the same output schema:
  {
    "score": float,           # 0–100 scam probability
    "factors": [
      {
        "factor": str,
        "weight": float,      # 0–1 contribution to score
        "description": str,
        "is_red_flag": bool,
        "category": str,
      }
    ]
  }
"""
import re
import logging
import os
from typing import Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# ── Data Classes ──────────────────────────────────────────────────────────────

@dataclass
class MLFactor:
    factor: str
    weight: float          # 0.0–1.0
    description: str
    is_red_flag: bool
    category: str


@dataclass
class MLResult:
    score: float           # 0–100
    factors: list[MLFactor] = field(default_factory=list)


# ── Keyword Signal Definitions ─────────────────────────────────────────────────

SCAM_SIGNALS = [
    # ── Payment red flags ────────────────────────────────────────────────────
    {
        "pattern": r"\b(western union|wire transfer|money gram|moneygram|gift card|zelle|cash app|venmo|bitcoin|crypto|paypal friends)\b",
        "factor": "Suspicious Payment Method",
        "weight": 0.92,
        "description": "Requests payment via untraceable methods (wire transfer, gift cards, crypto). Legitimate shelters use credit cards or checks.",
        "is_red_flag": True,
        "category": "payment",
    },
    {
        "pattern": r"\b(shipping fee|transport fee|delivery fee|vaccination fee|customs fee|insurance fee|clearance fee)\b",
        "factor": "Suspicious Fee Request",
        "weight": 0.88,
        "description": "Requests a separate fee for shipping, transport, or customs. Scammers use these fees to extract money after initial contact.",
        "is_red_flag": True,
        "category": "payment",
    },
    {
        "pattern": r"\b(send money|transfer funds|pay.*before|deposit.*first|advance.*payment)\b",
        "factor": "Advance Payment Demand",
        "weight": 0.85,
        "description": "Demands money before meeting the cat or providing verification. Legitimate adoptions don't require advance wire transfers.",
        "is_red_flag": True,
        "category": "payment",
    },
    # ── Urgency red flags ─────────────────────────────────────────────────────
    {
        "pattern": r"\b(act now|limited time|first come|going fast|won't last|hurry|urgent|must decide|today only|last chance)\b",
        "factor": "Artificial Urgency",
        "weight": 0.70,
        "description": "Uses high-pressure urgency tactics to prevent you from researching the listing or shelter properly.",
        "is_red_flag": True,
        "category": "language",
    },
    # ── Emotional manipulation ────────────────────────────────────────────────
    {
        "pattern": r"\b(god bless|may god|pastor|missionary|minister|church|blessing|pray|jesus|lord)\b",
        "factor": "Religious Appeal Manipulation",
        "weight": 0.75,
        "description": "Invokes religion to build false trust — a common tactic in pet adoption scams, especially in email-style listings.",
        "is_red_flag": True,
        "category": "language",
    },
    {
        "pattern": r"\b(dying|cancer|terminally ill|moving abroad|military deployment|deployed|overseas|widow|widower|divorce|passed away)\b",
        "factor": "Sob Story / Life Crisis",
        "weight": 0.65,
        "description": "Uses emotional hardship narratives (death, illness, military deployment) to justify unusual selling conditions.",
        "is_red_flag": True,
        "category": "language",
    },
    # ── Verification red flags ────────────────────────────────────────────────
    {
        "pattern": r"\b(no questions asked|no meetup|cannot meet|can't meet|will ship|can be shipped|delivery only|nationwide delivery)\b",
        "factor": "Refuses In-Person Meeting",
        "weight": 0.80,
        "description": "Refuses local pickup or in-person meeting. Legitimate adopters always allow you to meet the cat first.",
        "is_red_flag": True,
        "category": "verification",
    },
    {
        "pattern": r"\b(no papers|no vet records|no documentation|no certificate|unregistered)\b",
        "factor": "No Veterinary Documentation",
        "weight": 0.60,
        "description": "Cannot provide vet records, vaccination certificates, or registration papers.",
        "is_red_flag": True,
        "category": "verification",
    },
    # ── Price red flags ───────────────────────────────────────────────────────
    {
        "pattern": r"\b(free (to|kitten|cat|purebred|persian|siamese|ragdoll|maine coon|bengal|scottish fold))\b",
        "factor": "Free Purebred Cat",
        "weight": 0.72,
        "description": "Offering a purebred or pedigree cat for free is highly unusual and a common bait tactic before fee requests.",
        "is_red_flag": True,
        "category": "price",
    },
    # ── Grammar / template patterns ───────────────────────────────────────────
    {
        "pattern": r"\b(contact me at|reach me at|email me at|whatsapp me|text me at)\b.*@",
        "factor": "Redirect to Personal Contact",
        "weight": 0.55,
        "description": "Asks you to contact via personal email or messaging app, bypassing the platform's secure messaging.",
        "is_red_flag": True,
        "category": "language",
    },
    {
        "pattern": r"\b(rehom(e|ing)|re-hom(e|ing))\b.{0,80}\b(fee|cost|price|charge)\b",
        "factor": "Rehoming Fee",
        "weight": 0.45,
        "description": "Charges a 'rehoming fee' — sometimes legitimate, but frequently used as a first payment in a scam chain.",
        "is_red_flag": True,
        "category": "payment",
    },
]

TRUST_SIGNALS = [
    {
        "pattern": r"\b(licensed|accredited|registered (shelter|rescue|breeder)|non.?profit|501.?c)\b",
        "factor": "Licensed or Registered Organization",
        "weight": 0.80,
        "description": "Presents verifiable registration or accreditation with a rescue or breeder organization.",
        "is_red_flag": False,
        "category": "verification",
    },
    {
        "pattern": r"\b(adoption application|home visit|home check|interview process|spay|neuter|microchip(ped)?)\b",
        "factor": "Proper Adoption Process",
        "weight": 0.70,
        "description": "Follows a proper vetting process (application, home visit, spay/neuter requirement), typical of legitimate shelters.",
        "is_red_flag": False,
        "category": "verification",
    },
    {
        "pattern": r"\b(vet(erinary)? (records?|history|exam|check|care)|vaccination(s)?|health guarantee|health certificate)\b",
        "factor": "Veterinary Documentation Provided",
        "weight": 0.65,
        "description": "Mentions veterinary records, health certificates, or vaccination history — positive transparency signals.",
        "is_red_flag": False,
        "category": "verification",
    },
    {
        "pattern": r"\b(meet.{0,30}(cat|kitten)|visit.{0,30}(shelter|us|our)|in.?person|local pickup|pick up)\b",
        "factor": "Encourages In-Person Meeting",
        "weight": 0.60,
        "description": "Invites potential adopters to meet the cat or visit the shelter in person.",
        "is_red_flag": False,
        "category": "verification",
    },
]


# ── Mock Scoring Engine ────────────────────────────────────────────────────────

ADOPTION_RELEVANCE_PATTERN = re.compile(
    r"\b(adopt|adoption|animal|cat|cats|kitten|kittens|pet|pets|rescue|shelter|"
    r"spay|neuter|microchip|vaccination|vet|veterinary|welfare|humane|paw|paws|feline)\b",
    re.IGNORECASE,
)


def _mock_score(text: str) -> MLResult:
    """Rule-based mock scorer. No model file required."""
    text_lower = text.lower()
    factors: list[MLFactor] = []
    raw_score = 0.0

    # Check scam signals
    for signal in SCAM_SIGNALS:
        if re.search(signal["pattern"], text_lower, re.IGNORECASE):
            factors.append(MLFactor(
                factor=signal["factor"],
                weight=signal["weight"],
                description=signal["description"],
                is_red_flag=True,
                category=signal["category"],
            ))
            raw_score += signal["weight"]

    # Check trust signals (reduce score)
    for signal in TRUST_SIGNALS:
        if re.search(signal["pattern"], text_lower, re.IGNORECASE):
            factors.append(MLFactor(
                factor=signal["factor"],
                weight=signal["weight"],
                description=signal["description"],
                is_red_flag=False,
                category=signal["category"],
            ))
            raw_score -= signal["weight"] * 0.5  # Trust signals halve their weight in reduction

    # Normalize to 0–100
    # Max possible score ≈ sum of all scam weights (~7.5), we cap at 100
    if not ADOPTION_RELEVANCE_PATTERN.search(text_lower):
        factors.append(MLFactor(
            factor="Low Cat Adoption Relevance",
            weight=0.50,
            description=(
                "This text may be harmless, but it does not appear to describe a cat adoption, "
                "shelter, rescue, or pet listing. Confirm you pasted the actual adoption listing."
            ),
            is_red_flag=True,
            category="relevance",
        ))
        raw_score += 0.50

    MAX_RAW = sum(s["weight"] for s in SCAM_SIGNALS)
    normalized = max(0.0, min(100.0, (raw_score / MAX_RAW) * 100))

    # Baseline: listings with no signals get a small base suspicion (~5%)
    if not any(f.is_red_flag for f in factors):
        normalized = max(normalized, 5.0)

    # Sort: red flags first (by weight desc), then trust signals
    factors.sort(key=lambda f: (-f.weight if f.is_red_flag else f.weight))

    return MLResult(score=round(normalized, 2), factors=factors)


# ── Real Mode (TF-IDF + Random Forest) ───────────────────────────────────────

_model_cache: Optional[dict] = None


def _load_model(model_path: str) -> Optional[dict]:
    """Load the serialized TF-IDF vectorizer + Random Forest model."""
    global _model_cache
    if _model_cache:
        return _model_cache
    try:
        import joblib
        data = joblib.load(model_path)
        _model_cache = data
        logger.info(f"ML model loaded from {model_path}")
        return data
    except Exception as e:
        logger.error(f"Failed to load ML model from {model_path}: {e}")
        return None


def _real_score(text: str, model_path: str) -> MLResult:
    """TF-IDF + Random Forest scoring with mock fallback."""
    model_data = _load_model(model_path)
    if not model_data:
        logger.warning("Model unavailable, falling back to mock scorer.")
        return _mock_score(text)

    vectorizer = model_data["vectorizer"]
    clf = model_data["classifier"]
    feature_names = model_data.get("feature_names", [])

    X = vectorizer.transform([text])
    proba = clf.predict_proba(X)[0]
    scam_prob = proba[1]  # P(scam)
    score = round(scam_prob * 100, 2)

    # Use mock factors for explainability even in real mode
    mock_result = _mock_score(text)

    return MLResult(score=score, factors=mock_result.factors)


# ── Public Interface ───────────────────────────────────────────────────────────

def analyze_listing(text: str) -> MLResult:
    """
    Analyze adoption listing text and return a scam risk score with explanations.
    Automatically uses mock or real mode based on settings.
    """
    from app.config import get_settings
    settings = get_settings()

    if settings.USE_MOCK_ML:
        return _mock_score(text)
    else:
        return _real_score(text, settings.MODEL_PATH)
