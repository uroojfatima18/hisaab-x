from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from config.database import get_db
from schemas.budget import BudgetCreate, BudgetUpdate, Budget
from models.database import User as UserModel, Budget as BudgetModel
from auth.deps import get_current_user


router = APIRouter(tags=["budgets"])


@router.get("/", response_model=dict)
async def get_budgets(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch all budgets for the current user
    budgets = db.query(BudgetModel).filter(
        BudgetModel.userId == current_user.id
    ).all()

    return {
        "budgets": [
            {
                "id": b.id,
                "userId": b.userId,
                "category": b.category,
                "limit": b.limit,
                "yearlyLimit": b.yearlyLimit
            }
            for b in budgets
        ]
    }


@router.post("/", response_model=dict)
async def create_budget(
    budget_data: BudgetCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if budget with this category already exists for the user
    existing_budget = db.query(BudgetModel).filter(
        BudgetModel.userId == current_user.id,
        BudgetModel.category == budget_data.category
    ).first()

    if existing_budget:
        # Update the existing budget (upsert behavior)
        existing_budget.limit = budget_data.limit
        existing_budget.yearlyLimit = budget_data.yearlyLimit
        db.commit()
        db.refresh(existing_budget)

        return {
            "budget": {
                "id": existing_budget.id,
                "userId": existing_budget.userId,
                "category": existing_budget.category,
                "limit": existing_budget.limit,
                "yearlyLimit": existing_budget.yearlyLimit
            }
        }
    else:
        # Create a new budget
        db_budget = BudgetModel(
            userId=current_user.id,
            category=budget_data.category,
            limit=budget_data.limit,
            yearlyLimit=budget_data.yearlyLimit
        )

        db.add(db_budget)
        db.commit()
        db.refresh(db_budget)

        return {
            "budget": {
                "id": db_budget.id,
                "userId": db_budget.userId,
                "category": db_budget.category,
                "limit": db_budget.limit,
                "yearlyLimit": db_budget.yearlyLimit
            }
        }


@router.delete("/")
async def delete_all_budgets(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Delete all budgets for the current user
    db.query(BudgetModel).filter(
        BudgetModel.userId == current_user.id
    ).delete()

    db.commit()
    return {"success": True}


@router.delete("/{category}")
async def delete_budget(
    category: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Delete the budget by category for the current user
    budget = db.query(BudgetModel).filter(
        BudgetModel.userId == current_user.id,
        BudgetModel.category == category
    ).first()

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )

    db.delete(budget)
    db.commit()

    return {"success": True}