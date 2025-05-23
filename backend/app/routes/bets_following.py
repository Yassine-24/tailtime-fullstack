from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db  # type: ignore
from app.oauth2 import get_current_user  # type: ignore
from app.models.models import Bet  # type: ignore
from app.models.follow import Follow  # type: ignore
from app.models.user import User  # type: ignore

router = APIRouter()

@router.get("/bets/following")
def get_following_bets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get the list of users the current user is following
    following = db.query(Follow).filter(Follow.follower_id == current_user.id).all()
    following_ids = [f.following_id for f in following]

    # Get bets posted by those users
    bets = db.query(Bet).filter(Bet.user_id.in_(following_ids)).order_by(Bet.created_at.desc()).all()

    return [
        {
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
            "tail_count": len([v for v in bet.votes if v.vote_type == 1]),
            "fade_count": len([v for v in bet.votes if v.vote_type == -1]),
        }
        for bet in bets
    ]
