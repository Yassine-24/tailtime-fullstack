from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import engine
from app.database.base import Base
from app.routes import auth, bets  # 👈 new routes folder
from fastapi.staticfiles import StaticFiles
from app.routes import votes
from app.routes import users
from app.routes import games  
from app.routes import comments
from app.routes import follow 
from app.routes.bets_following import router as following_router 

# Create DB tables
from app.models import user  # 👈 keeps user model registered
Base.metadata.create_all(bind=engine)

# Init FastAPI
app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS setup for frontend
origins = [
    "http://localhost:5173",             # for local dev
    "https://tailtime.netlify.app"       # ✅ add your Netlify frontend
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route groups
app.include_router(auth.router)
app.include_router(bets.router)
app.include_router(votes.router)
app.include_router(users.router)
app.include_router(games.router)
app.include_router(comments.router)
app.include_router(follow.router)
app.include_router(following_router)

@app.get("/")
def read_root():
    return {"message": "TailTime Backend Running"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
