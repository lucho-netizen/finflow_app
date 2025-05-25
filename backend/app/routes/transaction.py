from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import date

from app.database import get_db
from app.models import Transaction, User
from app.schemas import TransactionCreate, TransactionRead

from app.auth_module import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])
from app.models import Transaction  # no Movement



@router.post("/")
async def create_transaction(
    data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if data.type not in ("income", "expense"):
        raise HTTPException(status_code=400, detail="Invalid type")

    transaction = Transaction(
        description=data.description,
        amount=data.amount,
         type=data.type,
        category=data.category,
        date=data.date,
        user_id=current_user.id
    )

    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)

    return {
        "id": transaction.id,
        "message": "Transaction created successfully"
    }

