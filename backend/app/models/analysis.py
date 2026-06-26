import uuid
import enum
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.database import Base


class AnalysisType(str, enum.Enum):
    LISTING = "listing"
    URL = "url"
    COMBINED = "combined"


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(AnalysisType), nullable=False)
    # Listing text input (for listing and combined analyses)
    input_text = Column(Text, nullable=True)
    # URL input (for URL and combined analyses)
    input_url = Column(String(2048), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="analyses")
    risk_score = relationship(
        "RiskScore",
        back_populates="analysis",
        uselist=False,
        cascade="all, delete-orphan",
    )
