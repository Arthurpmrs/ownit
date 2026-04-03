from fastapi import FastAPI

from src.core.logger import setup_logger
from src.features.goal.routes import router as goal_router

setup_logger()

app = FastAPI()

app.include_router(goal_router)
