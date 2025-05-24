from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db, Base
from app.models import user  # Ensure this imports your User model
from app.oauth2 import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/reset")
def reset_db(
    db: Session = Depends(get_db),
    current_user: user.User = Depends(get_current_user)
):
    if current_user.username != "sinoxs":
        raise HTTPException(status_code=403, detail="Forbidden")

    Base.metadata.drop_all(bind=db.get_bind())
    Base.metadata.create_all(bind=db.get_bind())
    return {"message": "Database has been reset"}
