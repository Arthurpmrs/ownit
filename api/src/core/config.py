from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='../.env', env_file_encoding='utf-8', extra='ignore'
    )

    DATABASE_URL: str
    ENV: Literal['dev', 'test', 'prod']
    LLM_BASE_URL: str = 'https://api.deepseek.com/v1'
    LLM_MODEL: str = 'deepseek-v4-lite'
    LLM_API_KEY: str
    LLM_MAX_TOKENS: int = 2048
    LLM_TEMPERATURE: float = 0.7


@lru_cache()
def get_settings() -> Settings:
    return Settings()  # type: ignore
