from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date

# ================= AUTH =================

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ================= TRANSACTION =================

class TransactionBase(BaseModel):
    description: str
    amount: float
    type: str
    category: str
    date: datetime

class TransactionCreate(TransactionBase):
    pass

class TransactionRead(TransactionBase):
    id: int
    created_at: Optional[datetime]

    class Config:
        orm_mode = True

# ================= GOALS =================

class GoalBase(BaseModel):
    goal_name: str
    target_amount: float
    deadline: date

class GoalCreate(GoalBase):
    pass

class GoalOut(GoalBase):
    id: int
    current_progress: float
    created_at: datetime

    class Config:
        orm_mode = True

# ================= MOTIVATIONS =================

class MotivationOut(BaseModel):
    motivation: str
    sent_at: datetime
