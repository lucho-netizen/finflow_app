from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, extract
from datetime import datetime



from app.database import get_db
from app.models import Transaction, User
from app.auth_module import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
from app.models import Transaction  # no Movement


@router.get("/")
async def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = datetime.utcnow()
    start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Todas las transacciones del mes actual
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.date >= start)
        .order_by(Transaction.date.desc())
    )
    transactions = result.scalars().all()

    # Conteo total de transacciones del usuario (para saber si es nuevo)
    total_result = await db.execute(
        select(func.count(Transaction.id))
        .where(Transaction.user_id == current_user.id)
    )
    total_count = total_result.scalar()

    ingresos = sum(t.amount for t in transactions if t.type == "income")
    egresos = sum(t.amount for t in transactions if t.type == "expense")
    saldo = ingresos - egresos

    # Agrupado diario para timeline
    res = await db.execute(
        select(
            func.date_trunc("day", Transaction.date).label("day"),
            Transaction.type,
            func.sum(Transaction.amount)
        )
        .where(Transaction.user_id == current_user.id)
        .group_by("day", Transaction.type)
        .order_by("day")
    )
    grouped = res.all()

    timeline = {}
    for day, tipo, total in grouped:
        d = day.strftime("%Y-%m-%d")
        if d not in timeline:
            timeline[d] = {"income": 0, "expense": 0}
        timeline[d][tipo] = total

    # Serializa para frontend
    serialized = [
        {
            "id": t.id,
            "amount": t.amount,
            "type": t.type,
            "category": t.category,
            "description": t.description,
            "date": t.date.isoformat(),
        }
        for t in transactions
    ]

    return {
        "ingresos": ingresos,
        "egresos": egresos,
        "saldo": saldo,
        "timeline": timeline,
        "transactions": serialized,
        "total_transactions": total_count
    }

@router.get("/overview")
async def get_monthly_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(
            extract("month", Transaction.date).label("month"),
            Transaction.type,
            func.sum(Transaction.amount)
        )
        .where(Transaction.user_id == current_user.id)
        .group_by("month", Transaction.type)
        .order_by("month")
    )
    rows = res.all()

    # Inicializa todos los meses con 0
    data = {m: {"income": 0, "expense": 0} for m in range(1, 13)}

    for month, tipo, total in rows:
        data[int(month)][tipo] = total

    result = [
        {
            "month": month,
            "income": values["income"],
            "expense": values["expense"]
        }
        for month, values in data.items()
    ]

    return result


@router.get("/summary")
async def get_balance_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = datetime.utcnow()
    start_this_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    start_last_month = (start_this_month.replace(day=1) - timedelta(days=1)).replace(day=1)

    # Actual
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.date >= start_this_month)
    )
    current_transactions = result.scalars().all()
    ingresos = sum(t.amount for t in current_transactions if t.type == "income")
    egresos = sum(t.amount for t in current_transactions if t.type == "expense")
    total_balance = ingresos - egresos

    # Mes pasado
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.date >= start_last_month)
        .where(Transaction.date < start_this_month)
    )
    previous_transactions = result.scalars().all()
    ingresos_prev = sum(t.amount for t in previous_transactions if t.type == "income")
    egresos_prev = sum(t.amount for t in previous_transactions if t.type == "expense")
    prev_balance = ingresos_prev - egresos_prev

    # Cambio porcentual
    if prev_balance == 0:
        balance_change = 0
    else:
        balance_change = ((total_balance - prev_balance) / abs(prev_balance)) * 100

    return {
        "total_balance": total_balance,
        "balance_change": balance_change
    }
