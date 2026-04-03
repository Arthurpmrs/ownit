from fastapi import FastAPI

from src.features.goal.routes import router as goal_router

app = FastAPI()

app.include_router(goal_router)
