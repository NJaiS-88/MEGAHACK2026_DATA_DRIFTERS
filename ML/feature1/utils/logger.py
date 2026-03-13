import logging
import sys
from typing import Optional


def setup_logger(level: int = logging.INFO, name: Optional[str] = None) -> logging.Logger:
    """
    Configure and return a logger with stream handler.

    This is idempotent: repeated calls will not add duplicate handlers.
    """
    logger_name = name or "ml.feature1"
    logger = logging.getLogger(logger_name)
    if logger.handlers:
        return logger

    logger.setLevel(level)
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger

