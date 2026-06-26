from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.risk_score import RiskLabel
from app.models.analysis import AnalysisType


class ExplanationResponse(BaseModel):
    id: str
    factor: str
    weight: float
    description: str
    is_red_flag: bool
    category: str
    order: int

    model_config = {"from_attributes": True}


class RiskScoreResponse(BaseModel):
    id: str
    analysis_id: str
    listing_score: Optional[float] = None
    url_score: Optional[float] = None
    combined_score: float
    risk_label: RiskLabel
    explanations: List[ExplanationResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoryItemResponse(BaseModel):
    """Compact view for history table."""
    analysis_id: str
    type: AnalysisType
    input_text: Optional[str] = None
    input_url: Optional[str] = None
    combined_score: float
    risk_label: RiskLabel
    created_at: datetime

    model_config = {"from_attributes": True}


class FullAnalysisResponse(BaseModel):
    """Full analysis result including risk score and explanations."""
    analysis_id: str
    type: AnalysisType
    input_text: Optional[str] = None
    input_url: Optional[str] = None
    created_at: datetime
    risk_score: RiskScoreResponse

    model_config = {"from_attributes": True}
