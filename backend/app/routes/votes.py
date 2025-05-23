from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.vote import Vote
from app.models.models import Bet
from app.oauth2 import get_current_user

router = APIRouter(prefix="/votes", tags=["Votes"])

@router.post("/{bet_id}/{vote_type}")
def vote_on_bet(
    bet_id: int,
    vote_type: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Body(None)  # optional body placeholder
):
    if vote_type not in [1, -1, 0]:
        raise HTTPException(status_code=400, detail="Invalid vote type")

    existing = db.query(Vote).filter_by(user_id=current_user.id, bet_id=bet_id).first()

    if existing:
        if vote_type == 0:
            db.delete(existing)
            db.commit()
            return {"message": "Vote removed"}
        elif existing.vote_type == vote_type:
            return {"message": "Vote unchanged"}
        else:
            existing.vote_type = vote_type
            db.commit()
            return {"message": "Vote switched"}
    elif vote_type != 0:
        new_vote = Vote(user_id=current_user.id, bet_id=bet_id, vote_type=vote_type)
        db.add(new_vote)
        db.commit()
        return {"message": "Vote recorded"}
    else:
        return {"message": "No existing vote to remove"}

@router.get("/count/{bet_id}")
def get_vote_counts(bet_id: int, db: Session = Depends(get_db)):
    tail_count = db.query(Vote).filter_by(bet_id=bet_id, vote_type=1).count()
    fade_count = db.query(Vote).filter_by(bet_id=bet_id, vote_type=-1).count()
    return {"tail": tail_count, "fade": fade_count}

@router.get("/voters/{bet_id}/{vote_type}")
def get_voters(bet_id: int, vote_type: int, db: Session = Depends(get_db)):
    votes = db.query(Vote).filter_by(bet_id=bet_id, vote_type=vote_type).all()
    usernames = [vote.user.username for vote in votes]
    return {"voters": usernames}

@router.get("/user-votes", response_model=dict)
def get_user_votes(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    votes = db.query(Vote).filter_by(user_id=current_user.id).all()
    return {vote.bet_id: vote.vote_type for vote in votes}
