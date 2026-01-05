from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import engine, Base
from api.v1 import auth, me, user, settings, transactions, budgets


# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="HissabX API", version="1.0.0")

# Add CORS middleware to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth.router, prefix="/api/auth")
app.include_router(user.router, prefix="/api/user")
app.include_router(settings.router, prefix="/api/settings")
app.include_router(transactions.router, prefix="/api/transactions")
app.include_router(budgets.router, prefix="/api/budgets")


# Add the /api/auth/me endpoint to the auth router
# Import the get_current_user_info function from me.py
from api.v1.me import get_current_user_info
from auth.deps import get_current_user
from models.database import User as UserModel
from sqlalchemy.orm import Session
from config.database import get_db
from fastapi import Depends

# Add the route directly to the app
app.add_api_route("/api/auth/me", get_current_user_info, methods=["GET"],
                 dependencies=[Depends(get_current_user)],
                 response_model=dict)


@app.get("/")
def read_root():
    return {"message": "HissabX FastAPI Backend"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}