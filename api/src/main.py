from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.logger import setup_logger
from src.features.goal.routes import router as goal_router

setup_logger()

app = FastAPI()

allowed_origins = ['http://localhost:3000']

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(goal_router)
