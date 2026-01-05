from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.settings import SettingsUpdate
from models.database import User as UserModel, UserSettings as UserSettingsModel
from auth.deps import get_current_user


router = APIRouter(tags=["settings"])


@router.get("/", response_model=dict)
async def get_settings(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user settings
    user_settings = db.query(UserSettingsModel).filter(
        UserSettingsModel.userId == current_user.id
    ).first()

    if not user_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User settings not found"
        )

    return {
        "settings": {
            "id": user_settings.id,
            "userId": user_settings.userId,
            "currency": user_settings.currency,
            "symbol": user_settings.symbol,
            "setupComplete": user_settings.setupComplete,
            "initialBalance": user_settings.initialBalance
        }
    }


@router.put("/", response_model=dict)
async def update_settings(
    settings_data: SettingsUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user settings
    user_settings = db.query(UserSettingsModel).filter(
        UserSettingsModel.userId == current_user.id
    ).first()

    if not user_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User settings not found"
        )

    # Update settings fields if provided
    if settings_data.currency is not None:
        user_settings.currency = settings_data.currency
    if settings_data.symbol is not None:
        user_settings.symbol = settings_data.symbol
    if settings_data.setupComplete is not None:
        user_settings.setupComplete = settings_data.setupComplete
    if settings_data.initialBalance is not None:
        user_settings.initialBalance = settings_data.initialBalance

    db.commit()
    db.refresh(user_settings)

    return {
        "settings": {
            "id": user_settings.id,
            "userId": user_settings.userId,
            "currency": user_settings.currency,
            "symbol": user_settings.symbol,
            "setupComplete": user_settings.setupComplete,
            "initialBalance": user_settings.initialBalance
        }
    }