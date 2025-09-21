from app.schemas import CategoryCreate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Category
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/")
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    categories = result.scalars().all()
    return categories



# --- POST ---
@router.post("/")
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    if data.type not in ["income", "expense"]:
        raise HTTPException(status_code=400, detail="Invalid type (must be 'income' or 'expense')")

    category = Category(
        name=data.name,
        type=data.type,
        created_at=datetime.utcnow()
    )

    db.add(category)
    try:
        await db.commit()
        await db.refresh(category)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Category already exists")

    return {
        "id": category.id,
        "name": category.name,
        "type": category.type,
        "message": "Category created successfully"
    }