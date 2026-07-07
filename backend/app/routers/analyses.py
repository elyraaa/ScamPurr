import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.deps import get_current_user
from app.models.app_metric import AppMetric
from app.models.user import User
from app.models.analysis import Analysis, AnalysisType
from app.rate_limit import analysis_rate_limit
from app.schemas.analysis import ListingAnalysisRequest, UrlAnalysisRequest
from app.schemas.risk_score import FullAnalysisResponse, HistoryItemResponse, RiskScoreResponse, ExplanationResponse
from app.services.ml_service import analyze_listing
from app.services.url_service import analyze_url
from app.services.scoring_service import build_score_response, compute_and_save_score

logger = logging.getLogger(__name__)
router = APIRouter()

URL_CHECKS_TOTAL_KEY = "url_checks_total"


def _build_full_response(analysis: Analysis) -> FullAnalysisResponse:
    """Build FullAnalysisResponse from ORM Analysis (with risk_score eager loaded)."""
    rs = analysis.risk_score
    return FullAnalysisResponse(
        analysis_id=analysis.id,
        type=analysis.type,
        input_text=analysis.input_text,
        input_url=analysis.input_url,
        created_at=analysis.created_at,
        risk_score=RiskScoreResponse(
            id=rs.id,
            analysis_id=rs.analysis_id,
            listing_score=rs.listing_score,
            url_score=rs.url_score,
            combined_score=rs.combined_score,
            risk_label=rs.risk_label,
            created_at=rs.created_at,
            explanations=[
                ExplanationResponse(
                    id=exp.id,
                    factor=exp.factor,
                    weight=exp.weight,
                    description=exp.description,
                    is_red_flag=exp.is_red_flag,
                    category=exp.category,
                    order=exp.order,
                )
                for exp in sorted(rs.explanations, key=lambda e: e.order)
            ],
        ),
    )


def _increment_metric(db: Session, key: str) -> None:
    metric = db.query(AppMetric).filter(AppMetric.key == key).first()
    if metric:
        metric.value += 1
    else:
        db.add(AppMetric(key=key, value=1))


def _build_guest_response(
    analysis_type: AnalysisType,
    risk_score: RiskScoreResponse,
    input_text: str | None = None,
    input_url: str | None = None,
) -> FullAnalysisResponse:
    return FullAnalysisResponse(
        analysis_id=risk_score.analysis_id,
        type=analysis_type,
        input_text=input_text,
        input_url=input_url,
        created_at=datetime.now(timezone.utc),
        risk_score=risk_score,
    )


@router.post("/listing", response_model=FullAnalysisResponse, dependencies=[Depends(analysis_rate_limit)])
async def analyze_listing_text(
    body: ListingAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Analyze an adoption listing text for scam signals.
    Optionally include a URL to perform a combined analysis.
    """
    try:
        analysis = Analysis(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            type=AnalysisType.LISTING,
            input_text=body.text,
            input_url=body.url,
        )
        db.add(analysis)
        db.commit()

        ml_result = analyze_listing(body.text)

        url_result = None
        if body.url:
            url_result = await analyze_url(body.url)
            _increment_metric(db, URL_CHECKS_TOTAL_KEY)

        compute_and_save_score(db, analysis, ml_result, url_result)
        db.refresh(analysis)

        return _build_full_response(analysis)
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        logger.exception("Listing analysis failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to complete listing analysis",
        )


@router.post("/url", response_model=FullAnalysisResponse, dependencies=[Depends(analysis_rate_limit)])
async def analyze_shelter_url(
    body: UrlAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze a shelter or listing website URL for trust signals."""
    try:
        analysis = Analysis(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            type=AnalysisType.URL,
            input_url=body.url,
        )
        db.add(analysis)
        db.commit()

        url_result = await analyze_url(body.url)
        _increment_metric(db, URL_CHECKS_TOTAL_KEY)
        compute_and_save_score(db, analysis, ml_result=None, url_result=url_result)
        db.refresh(analysis)

        return _build_full_response(analysis)
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        logger.exception("URL analysis failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to complete URL analysis",
        )


@router.post("/guest/listing", response_model=FullAnalysisResponse, dependencies=[Depends(analysis_rate_limit)])
async def analyze_guest_listing_text(
    body: ListingAnalysisRequest,
    db: Session = Depends(get_db),
):
    """Analyze listing text without saving analysis history to a user account."""
    try:
        analysis_id = str(uuid.uuid4())
        analysis_type = AnalysisType.COMBINED if body.url else AnalysisType.LISTING
        ml_result = analyze_listing(body.text)

        url_result = None
        if body.url:
            url_result = await analyze_url(body.url)
            _increment_metric(db, URL_CHECKS_TOTAL_KEY)
            db.commit()

        risk_score = build_score_response(analysis_id, ml_result, url_result)
        return _build_guest_response(
            analysis_type=analysis_type,
            risk_score=risk_score,
            input_text=body.text,
            input_url=body.url,
        )
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        logger.exception("Guest listing analysis failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to complete listing analysis",
        )


@router.post("/guest/url", response_model=FullAnalysisResponse, dependencies=[Depends(analysis_rate_limit)])
async def analyze_guest_shelter_url(
    body: UrlAnalysisRequest,
    db: Session = Depends(get_db),
):
    """Analyze a URL without saving analysis history to a user account."""
    try:
        analysis_id = str(uuid.uuid4())
        url_result = await analyze_url(body.url)
        _increment_metric(db, URL_CHECKS_TOTAL_KEY)
        db.commit()

        risk_score = build_score_response(analysis_id, ml_result=None, url_result=url_result)
        return _build_guest_response(
            analysis_type=AnalysisType.URL,
            risk_score=risk_score,
            input_url=body.url,
        )
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        logger.exception("Guest URL analysis failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to complete URL analysis",
        )


@router.get("/stats")
async def get_analysis_stats(db: Session = Depends(get_db)):
    """Return public aggregate analysis counters."""
    url_checks = db.query(AppMetric).filter(AppMetric.key == URL_CHECKS_TOTAL_KEY).first()
    return {"url_checks_total": url_checks.value if url_checks else 0}


@router.get("/history", response_model=List[HistoryItemResponse])
async def get_analysis_history(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analysis history for the current user (most recent first)."""
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    results = []
    for a in analyses:
        if a.risk_score:
            results.append(HistoryItemResponse(
                analysis_id=a.id,
                type=a.type,
                input_text=a.input_text[:100] + "..." if a.input_text and len(a.input_text) > 100 else a.input_text,
                input_url=a.input_url,
                combined_score=a.risk_score.combined_score,
                risk_label=a.risk_score.risk_label,
                created_at=a.created_at,
            ))
    return results


@router.get("/{analysis_id}", response_model=FullAnalysisResponse)
async def get_analysis_by_id(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a specific analysis result by ID."""
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if not analysis.risk_score:
        raise HTTPException(status_code=500, detail="Risk score not computed for this analysis")

    return _build_full_response(analysis)
