from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base
from app.models.user import User

class Bet(Base):
    __tablename__ = "bets"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    hashtag = Column(String, nullable=True)
    bet_type = Column(String, nullable=False, default="Chalk Talk")  # 🆕 added here
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    sport = Column(String, nullable=True)  # 🆕 added here

    user = relationship("User", back_populates="bets")
