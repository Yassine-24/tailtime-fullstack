from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.models.user import User  # ⬅️ this is required

class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("user_id", "bet_id", name="unique_vote"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bet_id = Column(Integer, ForeignKey("bets.id"))
    vote_type = Column(Integer)  # 1 = tail, -1 = fade

    user = relationship("User")  # ⬅️ now this works!
