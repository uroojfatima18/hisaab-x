from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base
from datetime import datetime
import uuid


def generate_cuid():
    """Generate a simple unique ID similar to cuid"""
    return str(uuid.uuid4()).replace("-", "")[:25]


class User(Base):
    __tablename__ = "User"  # Prisma uses PascalCase table names

    id = Column(String, primary_key=True, index=True, default=generate_cuid)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    avatarUrl = Column(String, nullable=True)
    createdAt = Column(DateTime, default=func.now(), nullable=False)
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")


class UserSettings(Base):
    __tablename__ = "UserSettings"  # Prisma uses PascalCase table names

    id = Column(String, primary_key=True, index=True, default=generate_cuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), unique=True, nullable=False)
    currency = Column(String, default="USD", nullable=False)
    symbol = Column(String, default="$", nullable=False)
    setupComplete = Column(Boolean, default=False, nullable=False)
    initialBalance = Column(Integer, default=0, nullable=False)

    # Relationship
    user = relationship("User", back_populates="settings")


class Transaction(Base):
    __tablename__ = "Transaction"  # Prisma uses PascalCase table names

    id = Column(String, primary_key=True, index=True, default=generate_cuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    type = Column(String, nullable=False)  # 'income' or 'expense'
    category = Column(String, nullable=False)
    description = Column(String, nullable=False)
    amountPaisa = Column(Integer, nullable=False)  # Amount in paisa (smallest currency unit)
    createdAt = Column(DateTime, default=func.now(), nullable=False)
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship
    user = relationship("User", back_populates="transactions")


class Budget(Base):
    __tablename__ = "Budget"  # Prisma uses PascalCase table names

    id = Column(String, primary_key=True, index=True, default=generate_cuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String, nullable=False)
    limit = Column(Integer, nullable=False)
    yearlyLimit = Column(Integer, nullable=True)

    # Relationship
    user = relationship("User", back_populates="budgets")