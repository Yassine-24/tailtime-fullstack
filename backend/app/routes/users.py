from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db  # type: ignore
from app.schemas.schemas import UserOut  # type: ignore
from app.models.user import User  # type: ignore
from app.models.vote import Vote
from app.models.models import Bet
from app.models.follow import Follow  # added for follow feature
from app.oauth2 import get_current_user  # type: ignore
from fastapi import Request

import shutil
import uuid
import os

router = APIRouter()

UPLOAD_DIR = "static/profile_pics"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/users/upload-profile-pic")
def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None  # ✅ Add this
):
    ext = os.path.splitext(file.filename)[-1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    public_url = f"{request.base_url}static/profile_pics/{filename}"
    current_user.profile_image_url = public_url
    db.commit()

    return {"profile_image_url": current_user.profile_image_url}


@router.get("/users/me", response_model=UserOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.get("/users/{username}")
def get_user_profile(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    bets = db.query(Bet).filter(Bet.user_id == user.id).all()
    user_votes = db.query(Vote).filter(Vote.user_id == user.id).all()

    tailed_bets = []
    faded_bets = []

    for vote in user_votes:
        bet = db.query(Bet).filter(Bet.id == vote.bet_id).first()
        if bet:
            bet_data = {
                "id": bet.id,
                "content": bet.content,
                "image_url": bet.image_url,
                "hashtag": bet.hashtag,
                "bet_type": bet.bet_type,
                "created_at": bet.created_at,
                "user": {
                    "id": bet.user.id,
                    "username": bet.user.username,
                    "profile_image_url": bet.user.profile_image_url,
                },
                "vote_type": vote.vote_type,
            }
            if vote.vote_type == 1:
                tailed_bets.append(bet_data)
            elif vote.vote_type == -1:
                faded_bets.append(bet_data)

    total_tails = sum(db.query(Vote).filter_by(bet_id=bet.id, vote_type=1).count() for bet in bets)
    total_fades = sum(db.query(Vote).filter_by(bet_id=bet.id, vote_type=-1).count() for bet in bets)

    is_following = db.query(Follow).filter_by(
        follower_id=current_user.id,
        following_id=user.id
    ).first() is not None

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "created_at": user.created_at,
            "profile_image_url": user.profile_image_url,
            "total_tails": total_tails,
            "total_fades": total_fades,
            "is_following": is_following
        },
        "bets": [
            {
                "id": bet.id,
                "content": bet.content,
                "image_url": bet.image_url,
                "hashtag": bet.hashtag,
                "bet_type": bet.bet_type,
                "created_at": bet.created_at,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "profile_image_url": user.profile_image_url
                }
            }
            for bet in bets
        ],
        "votes": {
            "tailed": tailed_bets,
            "faded": faded_bets
        }
    }

# ✅ Get followers
@router.get("/users/{username}/followers")
def get_followers(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    follower_links = db.query(Follow).filter_by(following_id=user.id).all()
    follower_ids = [f.follower_id for f in follower_links]

    followers = db.query(User).filter(User.id.in_(follower_ids)).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "profile_image_url": u.profile_image_url
        }
        for u in followers
    ]

# ✅ Get following
@router.get("/users/{username}/following")
def get_following(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    following_links = db.query(Follow).filter_by(follower_id=user.id).all()
    following_ids = [f.following_id for f in following_links]

    following_users = db.query(User).filter(User.id.in_(following_ids)).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "profile_image_url": u.profile_image_url
        }
        for u in following_users
    ]