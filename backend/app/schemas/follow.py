from pydantic import BaseModel

class FollowRequest(BaseModel):
    username: str
