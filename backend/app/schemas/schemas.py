from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserForBet(BaseModel):
    id: int
    username: str
    profile_image_url: Optional[str] = None

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    created_at: datetime
    profile_image_url: Optional[str] = None

    class Config:
        from_attributes = True

class BetCreate(BaseModel):
    content: str
    hashtag: str
    bet_type: str
    sport: str  # 🆕 added here

class BetOut(BaseModel):
    id: int
    content: str
    image_url: Optional[str] = None
    hashtag: Optional[str] = None
    bet_type: str
    sport: Optional[str] = None  # 🆕 added here
    created_at: datetime
    user: UserForBet
    tail_count: Optional[int] = 0
    fade_count: Optional[int] = 0
    comment_count: Optional[int] = 0

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str

class CommentOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    username: str

    class Config:
        from_attributes = True
