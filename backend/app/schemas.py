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
    type: str  # "income" | "expense"
    category_id: int
    date: datetime

class TransactionCreate(TransactionBase):
    pass

class CategoryRead(BaseModel):
    id: int
    name: str
    type: str

    class Config:
        orm_mode = True

class TransactionRead(BaseModel):
    id: int
    description: str
    amount: float
    type: str
    date: datetime
    created_at: Optional[datetime]
    category: CategoryRead

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

# ================= CATEGORY =================

class CategoryBase(BaseModel):
    name: str
    type: str

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# ================= BUDGET =================

class BudgetBase(BaseModel):
    category_id: int
    amount_limit: float
    month: int
    year: int

class BudgetCreate(BudgetBase):
    pass

class BudgetOut(BudgetBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# ================= TRANSACTION LOG =================

class TransactionLogOut(BaseModel):
    id: int
    transaction_id: int
    user_id: int
    old_amount: Optional[float]
    new_amount: Optional[float]
    action: str
    created_at: datetime

    class Config:
        orm_mode = True
