from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    avatarUrl: Optional[str] = None
    email: Optional[str] = None


class UserSettingsBase(BaseModel):
    currency: str = "USD"
    symbol: str = "$"
    setupComplete: bool = False
    initialBalance: int = 0


class UserSettingsCreate(UserSettingsBase):
    pass


class UserSettingsUpdate(BaseModel):
    currency: Optional[str] = None
    symbol: Optional[str] = None
    setupComplete: Optional[bool] = None
    initialBalance: Optional[int] = None


class UserSettings(UserSettingsBase):
    id: str
    userId: str

    class Config:
        from_attributes = True


class User(UserBase):
    id: str
    avatarUrl: Optional[str] = None
    settings: Optional[UserSettings] = None

    class Config:
        from_attributes = True


class UserInDB(User):
    password: str