from pydantic import BaseModel
from typing import Optional


class BudgetBase(BaseModel):
    category: str
    limit: int
    yearlyLimit: Optional[int] = None


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    limit: Optional[int] = None
    yearlyLimit: Optional[int] = None


class Budget(BudgetBase):
    id: str
    userId: str

    class Config:
        from_attributes = True