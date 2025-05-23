from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.comment import Comment
from app.models.models import Bet
from app.oauth2 import get_current_user
from app.schemas.schemas import CommentCreate, CommentOut
from typing import List

router = APIRouter(prefix="/comments", tags=["Comments"])

@router.post("/{bet_id}")
def create_comment(bet_id: int, comment: CommentCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    bet = db.query(Bet).filter(Bet.id == bet_id).first()
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")

    new_comment = Comment(
        content=comment.content,
        user_id=current_user.id,
        bet_id=bet_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return {"message": "Comment posted"}

@router.get("/{bet_id}", response_model=List[CommentOut])
def get_comments(bet_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.bet_id == bet_id).order_by(Comment.created_at.desc()).all()

    return [
        CommentOut(
            id=comment.id,
            content=comment.content,
            created_at=comment.created_at,
            username=comment.user.username
        )
        for comment in comments
    ]
