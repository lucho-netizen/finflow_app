from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app import models, schemas, database

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.post("/", response_model=schemas.GoalOut)
async def create_goal(goal: schemas.GoalCreate, db: AsyncSession = Depends(database.get_db)):
    new_goal = models.Goal(
        user_id=1,  # ⚠️ reemplazar con usuario autenticado en producción
        goal_name=goal.goal_name,
        target_amount=goal.target_amount,
        deadline=goal.deadline
    )
    db.add(new_goal)
    await db.commit()
    await db.refresh(new_goal)
    return new_goal

@router.get("/", response_model=list[schemas.GoalOut])
async def list_goals(db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.Goal))
    return result.scalars().all()
