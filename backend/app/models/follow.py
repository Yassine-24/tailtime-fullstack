from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.database.base import Base

class Follow(Base):
    __tablename__ = "follows"
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    following_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    __table_args__ = (UniqueConstraint("follower_id", "following_id", name="_follower_following_uc"),)
