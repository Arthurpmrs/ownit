from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.logger import setup_logger
from src.features.auth.routes import router as auth_router
from src.features.goal import exceptions as goal_exceptions
from src.features.chat.routes import router as chat_router
from src.features.goal.routes import router as goal_router
from src.features.study_session import exceptions as study_session_exceptions
from src.features.study_session.routes import router as study_session_router

setup_logger()

app = FastAPI()

allowed_origins = ['http://localhost:3000']

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=['*'],
    allow_headers=['*'],
    allow_credentials=True,
)

goal_exceptions.register_exception_handlers(app)
study_session_exceptions.register_exception_handlers(app)

app.include_router(auth_router)
app.include_router(goal_router)
app.include_router(study_session_router)
app.include_router(chat_router)
