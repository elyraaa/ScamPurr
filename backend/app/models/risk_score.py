import uuid
import enum
from sqlalchemy import (
    Column, String, Float, DateTime, ForeignKey,
    Enum, Text, Boolean, Integer, func,
)
from sqlalchemy.orm import relationship
from app.database import Base


class RiskLabel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(
        String, ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False, unique=True,
    )
    listing_score = Column(Float, nullable=True)   # 0–100; null if URL-only
    url_score = Column(Float, nullable=True)        # 0–100; null if listing-only
    combined_score = Column(Float, nullable=False)  # 0–100 final score
    risk_label = Column(Enum(RiskLabel), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    analysis = relationship("Analysis", back_populates="risk_score")
    explanations = relationship(
        "Explanation",
        back_populates="risk_score",
        cascade="all, delete-orphan",
        order_by="Explanation.order",
    )


class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    risk_score_id = Column(
        String, ForeignKey("risk_scores.id", ondelete="CASCADE"), nullable=False
    )
    factor = Column(String(120), nullable=False)       # Short name, e.g. "Suspicious Payment Method"
    weight = Column(Float, nullable=False)              # 0.0–1.0 contribution to score
    description = Column(Text, nullable=False)          # Human-readable explanation
    is_red_flag = Column(Boolean, default=True)        # False = green flag (trust signal)
    category = Column(String(60), nullable=False)       # "language" | "payment" | "price" | "domain" | "ssl" | "reputation"
    order = Column(Integer, default=0)                  # Display order (highest weight first)

    risk_score = relationship("RiskScore", back_populates="explanations")
