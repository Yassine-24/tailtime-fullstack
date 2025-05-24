from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database.session import get_db
from app.models import models
from app.models.vote import Vote
from app.models.follow import Follow  # ✅ import Follow model
from app.oauth2 import get_current_user
from app.schemas.schemas import BetOut
from app.models.comment import Comment
from app.models.user import User
import shutil
import uuid
import os
from typing import List
from fastapi import Request
from app.models.models import Bet

router = APIRouter(prefix="/bets", tags=["Bets"])

@router.post("/")
async def create_bet(
    request: Request,  # ✅ Add request to access base URL
    content: str = Form(...),
    hashtag: str = Form(...),
    bet_type: str = Form(...),
    sport: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    image_url = None
    if image:
        filename = f"{uuid.uuid4()}_{image.filename}"
        file_path = f"static/{filename}"
        os.makedirs("static", exist_ok=True)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # ✅ Use full URL to make it accessible on frontend
        image_url = f"{request.base_url}static/{filename}"

    new_bet = models.Bet(
        content=content,
        image_url=image_url,
        hashtag=hashtag,
        bet_type=bet_type,
        sport=sport,
        user_id=current_user.id
    )
    db.add(new_bet)
    db.commit()
    db.refresh(new_bet)

    return {
        "id": new_bet.id,
        "content": new_bet.content,
        "image_url": new_bet.image_url,
        "hashtag": new_bet.hashtag,
        "bet_type": new_bet.bet_type,
        "sport": new_bet.sport
    }

@router.get("/following")
def get_following_bets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    following = db.query(Follow).filter(Follow.follower_id == current_user.id).all()
    following_ids = [f.following_id for f in following]
    bets = db.query(models.Bet).options(joinedload(models.Bet.user)).filter(models.Bet.user_id.in_(following_ids)).order_by(models.Bet.created_at.desc()).all()

    result = []
    for bet in bets:
        tail_count = db.query(Vote).filter_by(bet_id=bet.id, vote_type=1).count()
        fade_count = db.query(Vote).filter_by(bet_id=bet.id, vote_type=-1).count()
        comment_count = db.query(Comment).filter_by(bet_id=bet.id).count()
        result.append({
            "id": bet.id,
            "content": bet.content,
            "image_url": bet.image_url,
            "created_at": bet.created_at.isoformat(),
            "user": {
                "id": bet.user.id,
                "username": bet.user.username,
                "profile_image_url": bet.user.profile_image_url
            },
            "hashtag": getattr(bet, 'hashtag', None),
            "bet_type": getattr(bet, 'bet_type', 'Chalk Talk'),
            "sport": getattr(bet, 'sport', None),
            "tail_count": tail_count,
            "fade_count": fade_count,
            "comment_count": comment_count
        })

    return result

@router.get("/", response_model=List[BetOut])
def get_bets(db: Session = Depends(get_db)):
    bets = db.query(models.Bet).options(joinedload(models.Bet.user)).all()
    bet_data = []

    for bet in bets:
        tail_count = db.query(Vote).filter_by(bet_id=bet.id, vote_type=1).count()
        fade_count = db.query(Vote).filter_by(bet_id=bet.id, vote_type=-1).count()
        comment_count = db.query(Comment).filter_by(bet_id=bet.id).count()

        bet_data.append({
            "id": bet.id,
            "content": bet.content,
            "image_url": bet.image_url,
            "created_at": bet.created_at.isoformat(),
            "user": {
                "id": bet.user.id,
                "username": bet.user.username,
                "profile_image_url": bet.user.profile_image_url
            },
            "hashtag": getattr(bet, 'hashtag', None),
            "bet_type": getattr(bet, 'bet_type', 'Chalk Talk'),
            "sport": getattr(bet, 'sport', None),
            "tail_count": tail_count,
            "fade_count": fade_count,
            "comment_count": comment_count
        })

    return bet_data

@router.get("/{bet_id}", response_model=BetOut)
def get_single_bet(bet_id: int, db: Session = Depends(get_db)):
    bet = db.query(models.Bet).filter(models.Bet.id == bet_id).first()
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")

    tail_count = db.query(Vote).filter_by(bet_id=bet.id, vote_type=1).count()
    fade_count = db.query(Vote).filter_by(bet_id=bet.id, vote_type=-1).count()

    return {
        "id": bet.id,
        "content": bet.content,
        "image_url": bet.image_url,
        "created_at": bet.created_at.isoformat(),
        "user": {
            "id": bet.user.id,
            "username": bet.user.username,
            "profile_image_url": bet.user.profile_image_url
        },
        "hashtag": getattr(bet, 'hashtag', None),
        "bet_type": getattr(bet, 'bet_type', None),
        "sport": getattr(bet, 'sport', None),
        "tail_count": tail_count,
        "fade_count": fade_count
    }

@router.delete("/{bet_id}", status_code=204)
def delete_bet(
    bet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bet = db.query(Bet).filter(Bet.id == bet_id).first()
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")
    if bet.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.query(Comment).filter(Comment.bet_id == bet_id).delete()
    db.query(Vote).filter(Vote.bet_id == bet_id).delete()
    db.delete(bet)
    db.commit()
    return