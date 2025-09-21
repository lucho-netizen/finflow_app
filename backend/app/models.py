from sqlalchemy import Column, Date, Integer, Numeric, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from sqlalchemy.dialects.postgresql import ARRAY


Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column("passwords_keys", String, nullable=False)

    first_name = Column(String(100))
    last_name = Column(String(100))
    avatar_url = Column(Text)
    timezone = Column(String(50), default="America/Bogota")
    failed_logins = Column(Integer, default=0)
    last_failed_login = Column(DateTime)
    password_changed_at = Column(DateTime)
    refresh_token = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    # relaciones
    transactions = relationship("Transaction", back_populates="user")

    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    motivations = relationship("Motivation", back_populates="user", cascade="all, delete-orphan")
    motivation_logs = relationship("MotivationLog", back_populates="user", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String(50), nullable=False)
    
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)  # 👈 renombrado
    description = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)
    currency = Column(String(3), default="COP")
    tags = Column(ARRAY(Text))
    status = Column(String(20), default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")  # 👈 queda más natural




class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_name = Column(String, nullable=False)
    target_amount = Column(Numeric(12, 2), nullable=False)
    deadline = Column(Date, nullable=False)
    current_progress = Column(Numeric(12, 2), default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="goals")


class Motivation(Base):
    __tablename__ = "motivations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="motivations")



class MotivationLog(Base):
    __tablename__ = "motivation_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    motivation_id = Column(Integer, ForeignKey("motivations.id"), nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="motivation_logs")
    motivation = relationship("Motivation")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)  # "income" o "expense"
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")  # 👈 consistente



class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount_limit = Column(Float, nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="budgets")  # 👈 renombrado


class TransactionLog(Base):
    __tablename__ = "transactions_log"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, nullable=False)
    old_amount = Column(Float)
    old_type = Column(String(50))
    old_category_id = Column(Integer)
    old_description = Column(Text)
    old_date = Column(DateTime)
    new_amount = Column(Float)
    new_type = Column(String(50))
    new_category_id = Column(Integer)
    new_description = Column(Text)
    new_date = Column(DateTime)
    action = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
