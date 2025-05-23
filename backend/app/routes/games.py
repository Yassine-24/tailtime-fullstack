from fastapi import APIRouter
from datetime import datetime, timedelta

router = APIRouter(prefix="/games", tags=["Games"])

# Dummy live and upcoming games
@router.get("/active")
def get_active_games():
    now = datetime.now()
    return [
        {
            "league": "NBA",
            "home": "Heat",
            "away": "Celtics",
            "start_time": (now + timedelta(hours=1)).strftime("%I:%M %p")
        },
        {
            "league": "NFL",
            "home": "Dolphins",
            "away": "Bills",
            "start_time": (now + timedelta(hours=2)).strftime("%I:%M %p")
        },
        {
            "league": "MLB",
            "home": "Yankees",
            "away": "Red Sox",
            "start_time": (now + timedelta(hours=3)).strftime("%I:%M %p")
        }
    ]
