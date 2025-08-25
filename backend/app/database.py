from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

ENV = os.getenv("ENV", "local")

# Host: si estás en local usa localhost, si no usa "db"
DB_HOST = os.getenv("DB_HOST", "localhost") if ENV == "local" else os.getenv("DB_HOST", "db")

# Convierte el puerto en int con fallback
DB_PORT = int(os.getenv("DB_PORT", 5432))

DB_URL = (
    f"postgresql+asyncpg://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{DB_HOST}:{DB_PORT}/{os.getenv('DB_NAME')}"
)

# Motor asíncrono
engine = create_async_engine(DB_URL, echo=True)

# Sesión asíncrona
AsyncSessionLocal = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
