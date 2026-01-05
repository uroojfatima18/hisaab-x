from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    userId: Optional[str] = None
    username: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserSignup(UserLogin):
    email: str