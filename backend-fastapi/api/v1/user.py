from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.user import UserUpdate
from models.database import User as UserModel, UserSettings as UserSettingsModel
from auth.deps import get_current_user


router = APIRouter(tags=["user"])


@router.get("/", response_model=dict)
async def get_user(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user settings
    user_settings = db.query(UserSettingsModel).filter(
        UserSettingsModel.userId == current_user.id
    ).first()

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


@router.put("/", response_model=dict)
async def update_user(
    user_data: UserUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update user fields if provided
    if user_data.avatarUrl is not None:
        current_user.avatarUrl = user_data.avatarUrl
    if user_data.email is not None:
        # Check if email is already taken by another user
        existing_user = db.query(UserModel).filter(
            UserModel.email == user_data.email,
            UserModel.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered by another user"
            )
        current_user.email = user_data.email

    db.commit()
    db.refresh(current_user)

    # Fetch user settings
    user_settings = db.query(UserSettingsModel).filter(
        UserSettingsModel.userId == current_user.id
    ).first()

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


@router.delete("/")
async def delete_user(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Delete the user (this will cascade delete related records due to foreign key constraints)
    db.delete(current_user)
    db.commit()

    return {"success": True}