from sqlalchemy import Column, Date, Integer, Numeric, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column("passwords_keys", String)

    # Relación con movimientos
    transactions = relationship("Transaction", back_populates="user")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    motivations = relationship("Motivation", back_populates="user", cascade="all, delete-orphan")
    motivation_logs = relationship("MotivationLog", back_populates="user", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    type = Column(String, nullable=False)  # ideally Enum
    category = Column(String)
    description = Column(String)
    date = Column(DateTime)
    created_at = Column(DateTime)

    user = relationship("User", back_populates="transactions")



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
