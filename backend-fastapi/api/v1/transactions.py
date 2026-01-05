from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from config.database import get_db
from schemas.transaction import TransactionCreate, TransactionUpdate, Transaction
from models.database import User as UserModel, Transaction as TransactionModel
from auth.deps import get_current_user


router = APIRouter(tags=["transactions"])


@router.get("/", response_model=dict)
async def get_transactions(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch all transactions for the current user
    transactions = db.query(TransactionModel).filter(
        TransactionModel.userId == current_user.id
    ).all()

    return {
        "transactions": [
            {
                "id": t.id,
                "userId": t.userId,
                "date": t.date,
                "type": t.type,
                "category": t.category,
                "description": t.description,
                "amountPaisa": t.amountPaisa,
                "createdAt": t.createdAt,
                "updatedAt": t.updatedAt
            }
            for t in transactions
        ]
    }


@router.post("/", response_model=dict)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create a new transaction
    db_transaction = TransactionModel(
        userId=current_user.id,
        date=transaction_data.date,
        type=transaction_data.type,
        category=transaction_data.category,
        description=transaction_data.description,
        amountPaisa=transaction_data.amountPaisa
    )

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    return {
        "transaction": {
            "id": db_transaction.id,
            "userId": db_transaction.userId,
            "date": db_transaction.date,
            "type": db_transaction.type,
            "category": db_transaction.category,
            "description": db_transaction.description,
            "amountPaisa": db_transaction.amountPaisa,
            "createdAt": db_transaction.createdAt,
            "updatedAt": db_transaction.updatedAt
        }
    }


@router.delete("/")
async def delete_all_transactions(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Delete all transactions for the current user
    db.query(TransactionModel).filter(
        TransactionModel.userId == current_user.id
    ).delete()

    db.commit()
    return {"success": True}


@router.get("/{transaction_id}", response_model=dict)
async def get_transaction(
    transaction_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch a specific transaction
    transaction = db.query(TransactionModel).filter(
        TransactionModel.id == transaction_id,
        TransactionModel.userId == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    return {
        "transaction": {
            "id": transaction.id,
            "userId": transaction.userId,
            "date": transaction.date,
            "type": transaction.type,
            "category": transaction.category,
            "description": transaction.description,
            "amountPaisa": transaction.amountPaisa,
            "createdAt": transaction.createdAt,
            "updatedAt": transaction.updatedAt
        }
    }


@router.put("/{transaction_id}", response_model=dict)
async def update_transaction(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch the transaction to update
    transaction = db.query(TransactionModel).filter(
        TransactionModel.id == transaction_id,
        TransactionModel.userId == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    # Update transaction fields if provided
    if transaction_data.date is not None:
        transaction.date = transaction_data.date
    if transaction_data.type is not None:
        transaction.type = transaction_data.type
    if transaction_data.category is not None:
        transaction.category = transaction_data.category
    if transaction_data.description is not None:
        transaction.description = transaction_data.description
    if transaction_data.amountPaisa is not None:
        transaction.amountPaisa = transaction_data.amountPaisa

    db.commit()
    db.refresh(transaction)

    return {
        "transaction": {
            "id": transaction.id,
            "userId": transaction.userId,
            "date": transaction.date,
            "type": transaction.type,
            "category": transaction.category,
            "description": transaction.description,
            "amountPaisa": transaction.amountPaisa,
            "createdAt": transaction.createdAt,
            "updatedAt": transaction.updatedAt
        }
    }


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch the transaction to delete
    transaction = db.query(TransactionModel).filter(
        TransactionModel.id == transaction_id,
        TransactionModel.userId == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    db.delete(transaction)
    db.commit()

    return {"success": True}