from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base
from app.models.user import User
from app.models.models import Bet  # Your Bet model is inside models.py

class Comment(Base):
    __tablename__ = "comments"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bet_id = Column(Integer, ForeignKey("bets.id"), nullable=False)

    user = relationship("User")
    bet = relationship("Bet")
