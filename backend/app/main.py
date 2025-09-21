from fastapi import FastAPI
from app import models
from app.database import engine
from app.auth.router import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.transaction import router as transactions
from app.routes import goals
from app.routes import categories  # ✅ importa el módulo, no el objeto

from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(transactions)
app.include_router(categories.router)  # ✅ usa el router
app.include_router(goals.router)

@app.get("/")
def root():
    return {"msg": "Finflow backend is alive! 🔥"}
