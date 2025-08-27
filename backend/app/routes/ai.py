from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import random
from app import models, database

router = APIRouter(prefix="/ai", tags=["AI"])

@router.get("/motivation/{user_id}", response_model=dict)
async def get_motivation(user_id: int, db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(
        select(models.MotivationLog.motivation_id).where(models.MotivationLog.user_id == user_id)
    )
    used_ids = {row[0] for row in result.all()}

    result = await db.execute(select(models.Motivation).where(~models.Motivation.id.in_(used_ids)))
    available = result.scalars().all()

    if not available:
        result = await db.execute(select(models.Motivation))
        available = result.scalars().all()

    if not available:
        raise HTTPException(status_code=404, detail="No hay frases motivacionales")

    chosen = random.choice(available)
    new_log = models.MotivationLog(user_id=user_id, motivation_id=chosen.id)
    db.add(new_log)
    await db.commit()

    return {"motivation": chosen.text, "sent_at": datetime.utcnow()}
    