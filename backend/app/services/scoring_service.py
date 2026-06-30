"""
Scoring Service
----------------
Combines ML listing score and URL trust score into a final risk score,
then generates prioritized, human-readable explanations.

Formula:
  combined_score = 0.55 * listing_score + 0.45 * url_score   (combined)
  combined_score = listing_score                                (listing-only)
  combined_score = url_score                                    (URL-only)

Risk Labels:
  LOW       0–29
  MEDIUM    30–59
  HIGH      60–79
  CRITICAL  80–100
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.models.analysis import Analysis, AnalysisType
from app.models.risk_score import RiskScore, Explanation, RiskLabel
from app.schemas.risk_score import RiskScoreResponse, ExplanationResponse
from app.services.ml_service import MLResult, MLFactor
from app.services.url_service import URLResult, URLFactor

logger = logging.getLogger(__name__)

LISTING_WEIGHT = 0.55
URL_WEIGHT = 0.45


def _score_to_label(score: float) -> RiskLabel:
    if score < 30:
        return RiskLabel.LOW
    elif score < 60:
        return RiskLabel.MEDIUM
    elif score < 80:
        return RiskLabel.HIGH
    else:
        return RiskLabel.CRITICAL


def _ml_factor_to_explanation(
    factor: MLFactor, order: int, risk_score_id: str
) -> Explanation:
    return Explanation(
        id=str(uuid.uuid4()),
        risk_score_id=risk_score_id,
        factor=factor.factor,
        weight=round(factor.weight, 4),
        description=factor.description,
        is_red_flag=factor.is_red_flag,
        category=factor.category,
        order=order,
    )


def _url_factor_to_explanation(
    factor: URLFactor, order: int, risk_score_id: str
) -> Explanation:
    return Explanation(
        id=str(uuid.uuid4()),
        risk_score_id=risk_score_id,
        factor=factor.factor,
        weight=round(factor.weight, 4),
        description=factor.description,
        is_red_flag=factor.is_red_flag,
        category=factor.category,
        order=order,
    )


def build_score_response(
    analysis_id: str,
    ml_result: Optional[MLResult] = None,
    url_result: Optional[URLResult] = None,
) -> RiskScoreResponse:
    """Build a non-persisted risk score response for guest analyses."""
    listing_score: Optional[float] = ml_result.score if ml_result else None
    url_score: Optional[float] = url_result.score if url_result else None

    if listing_score is not None and url_score is not None:
        combined = LISTING_WEIGHT * listing_score + URL_WEIGHT * url_score
    elif listing_score is not None:
        combined = listing_score
    else:
        combined = url_score or 0.0

    combined = round(combined, 2)
    label = _score_to_label(combined)
    risk_score_id = str(uuid.uuid4())
    explanations: list[ExplanationResponse] = []
    order = 0

    if ml_result:
        for factor in ml_result.factors:
            explanations.append(ExplanationResponse(
                id=str(uuid.uuid4()),
                factor=factor.factor,
                weight=round(factor.weight, 4),
                description=factor.description,
                is_red_flag=factor.is_red_flag,
                category=factor.category,
                order=order,
            ))
            order += 1

    if url_result:
        for factor in url_result.factors:
            explanations.append(ExplanationResponse(
                id=str(uuid.uuid4()),
                factor=factor.factor,
                weight=round(factor.weight, 4),
                description=factor.description,
                is_red_flag=factor.is_red_flag,
                category=factor.category,
                order=order,
            ))
            order += 1

    return RiskScoreResponse(
        id=risk_score_id,
        analysis_id=analysis_id,
        listing_score=listing_score,
        url_score=url_score,
        combined_score=combined,
        risk_label=label,
        explanations=explanations,
        created_at=datetime.now(timezone.utc),
    )


def compute_and_save_score(
    db: Session,
    analysis: Analysis,
    ml_result: Optional[MLResult] = None,
    url_result: Optional[URLResult] = None,
) -> RiskScore:
    """
    Compute final risk score from ML and/or URL results,
    persist RiskScore + Explanation rows, and return the ORM object.
    """
    listing_score: Optional[float] = ml_result.score if ml_result else None
    url_score: Optional[float] = url_result.score if url_result else None

    # ── Combine scores ────────────────────────────────────────────────────
    if listing_score is not None and url_score is not None:
        combined = LISTING_WEIGHT * listing_score + URL_WEIGHT * url_score
    elif listing_score is not None:
        combined = listing_score
    else:
        combined = url_score or 0.0

    combined = round(combined, 2)
    label = _score_to_label(combined)

    risk_score_id = str(uuid.uuid4())

    # ── Build explanations ────────────────────────────────────────────────
    explanations: list[Explanation] = []
    order = 0

    if ml_result:
        for factor in ml_result.factors:
            explanations.append(_ml_factor_to_explanation(factor, order, risk_score_id))
            order += 1

    if url_result:
        for factor in url_result.factors:
            explanations.append(_url_factor_to_explanation(factor, order, risk_score_id))
            order += 1

    # ── Persist ───────────────────────────────────────────────────────────
    risk_score = RiskScore(
        id=risk_score_id,
        analysis_id=analysis.id,
        listing_score=listing_score,
        url_score=url_score,
        combined_score=combined,
        risk_label=label,
    )
    db.add(risk_score)
    db.flush()  # Get the ID before adding children

    for exp in explanations:
        db.add(exp)

    db.commit()
    db.refresh(risk_score)
    logger.info(
        f"Saved risk score {risk_score_id}: {combined:.1f} ({label.value}) "
        f"for analysis {analysis.id}"
    )
    return risk_score
