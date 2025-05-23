from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db  # type: ignore
from app.models.user import User  # type: ignore
from app.models.follow import Follow  # type: ignore
from app.schemas.follow import FollowRequest  # ✅
from app.oauth2 import get_current_user  # type: ignore

router = APIRouter()

@router.post("/follow")
def follow_user(payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    username_to_follow = payload.get("username")

    user_to_follow = db.query(User).filter(User.username == username_to_follow).first()
    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User not found")

    if user_to_follow.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself.")

    # Prevent duplicates
    existing_follow = db.query(Follow).filter_by(follower_id=current_user.id, following_id=user_to_follow.id).first()
    if existing_follow:
        raise HTTPException(status_code=400, detail="Already following this user.")

    follow = Follow(follower_id=current_user.id, following_id=user_to_follow.id)
    db.add(follow)
    db.commit()
    return {"message": "Followed successfully"}

@router.post("/follow/unfollow")
def unfollow_user(
    follow_data: FollowRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user = db.query(User).filter(User.username == follow_data.username).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User to unfollow not found")
    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot unfollow yourself")

    existing = db.query(Follow).filter_by(follower_id=current_user.id, following_id=target_user.id).first()
    if not existing:
        raise HTTPException(status_code=400, detail="You are not following this user")

    db.delete(existing)
    db.commit()
    return {"detail": "Unfollowed successfully"}
