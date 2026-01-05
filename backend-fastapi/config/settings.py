from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://username:password@localhost/dbname")
    jwt_secret: str = os.getenv("JWT_SECRET", "fallback-secret-change-in-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"

settings = Settings()