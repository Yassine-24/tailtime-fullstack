# backend/app/utils/reset_db.py

import os
from app.database.session import SessionLocal
from app.models import user, models, comment, vote, follow  # import all model modules

def soft_reset_db():
    # Prevent accidental production wipe
    if os.getenv("ENV") != "development":
        print("Soft reset only allowed in development environment.")
        return

    db = SessionLocal()
    try:
        print("Resetting database...")
        db.query(comment.Comment).delete()
        db.query(vote.Vote).delete()
        db.query(follow.Follow).delete()
        db.query(models.Bet).delete()
        db.query(user.User).delete()
        db.commit()
        print("Database reset successfully.")
    except Exception as e:
        print(f"Error during reset: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    soft_reset_db()
