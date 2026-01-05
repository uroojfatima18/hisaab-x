from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.user import UserCreate
from schemas.auth import UserLogin
from models.database import User as UserModel, UserSettings as UserSettingsModel
from auth.auth import verify_password, get_password_hash, create_access_token
from utils.password import verify_password as verify_password_util
from utils.tokens import create_access_token as create_token_util


router = APIRouter(tags=["auth"])


@router.post("/signup", response_model=dict)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    existing_username = db.query(UserModel).filter(UserModel.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Check if email already exists
    existing_email = db.query(UserModel).filter(UserModel.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)

    # Generate avatar URL
    avatar_url = f"https://api.dicebear.com/7.x/initials/svg?seed={user_data.username}"

    # Create user
    db_user = UserModel(
        username=user_data.username,
        email=user_data.email,
        password=hashed_password,
        avatarUrl=avatar_url
    )
    db.add(db_user)
    db.flush()  # Get the user ID without committing

    # Create associated settings
    user_settings = UserSettingsModel(
        userId=db_user.id,
        currency="USD",
        symbol="$",
        setupComplete=False,
        initialBalance=0
    )
    db.add(user_settings)
    db.commit()
    db.refresh(db_user)
    db.refresh(user_settings)  # Refresh to get the generated ID

    # Create and return token
    token_data = {"userId": db_user.id, "username": db_user.username}
    access_token = create_token_util(data=token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "avatarUrl": db_user.avatarUrl,
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


@router.post("/login", response_model=dict)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user by username
    user = db.query(UserModel).filter(UserModel.username == user_data.username).first()
    if not user or not verify_password_util(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )

    # Create and return token
    token_data = {"userId": user.id, "username": user.username}
    access_token = create_token_util(data=token_data)

    # Fetch user settings
    user_settings = db.query(UserSettingsModel).filter(UserSettingsModel.userId == user.id).first()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatarUrl": user.avatarUrl,
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


@router.post("/logout")
async def logout():
    # In a real implementation, you might want to add the token to a blacklist
    # For now, we just return a success response
    return {"success": True}