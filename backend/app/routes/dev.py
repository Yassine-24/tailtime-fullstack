from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import models

router = APIRouter(prefix="/dev", tags=["Development"])

@router.post("/reset-db")
def reset_db(db: Session = Depends(get_db)):
    # WARNING: This deletes all data!
    db.query(models.Comment).delete()
    db.query(models.Vote).delete()
    db.query(models.Bet).delete()
    db.query(models.User).filter(models.User.username != "sinoxs").delete()
    db.commit()
    return {"message": "Database reset (except sinoxs user)."}
