from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TransactionBase(BaseModel):
    date: datetime
    type: str  # 'income' or 'expense'
    category: str
    description: str
    amountPaisa: int  # Amount in smallest currency unit (e.g., paisa for rupees)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    date: Optional[datetime] = None
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    amountPaisa: Optional[int] = None


class Transaction(TransactionBase):
    id: str
    userId: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True