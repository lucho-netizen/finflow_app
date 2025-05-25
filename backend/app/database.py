from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = f"postgresql+asyncpg://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"

# Motor asíncrono para la base de datos
engine = create_async_engine(DB_URL, echo=True)

# Sesión asíncrona creada para ser usada en dependencias
AsyncSessionLocal = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

# Dependencia para usar en FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
