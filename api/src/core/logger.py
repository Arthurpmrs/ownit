import logging
import sys

from src.core.config import get_settings


def setup_logger():
    settings = get_settings()
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
        handlers=[logging.StreamHandler(sys.stdout)],
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
