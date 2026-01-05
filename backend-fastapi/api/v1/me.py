from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.database import get_db
from models.database import User as UserModel, UserSettings as UserSettingsModel
from auth.deps import get_current_user


router = APIRouter(tags=["me"])


@router.get("/", response_model=dict)
async def get_current_user_info(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user settings
    user_settings = db.query(UserSettingsModel).filter(UserSettingsModel.userId == current_user.id).first()

    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "avatarUrl": current_user.avatarUrl,
            "settings": {
                "id": user_settings.id,
                "userId": user_settings.userId,
                "currency": user_settings.currency,
                "symbol": user_settings.symbol,
                "setupComplete": user_settings.setupComplete,
                "initialBalance": user_settings.initialBalance
            }
        }
    }