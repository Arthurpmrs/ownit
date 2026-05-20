from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='../.env', env_file_encoding='utf-8', extra='ignore'
    )

    DATABASE_URL: str
    ENV: Literal['dev', 'test', 'prod']


@lru_cache()
def get_settings() -> Settings:
    return Settings()  # type: ignore
