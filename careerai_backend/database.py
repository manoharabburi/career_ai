from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
from config import settings
import logging

logger = logging.getLogger(__name__)

def _make_engine(url: str):
    return create_engine(
        url,
        echo=getattr(settings, 'debug', False),
        pool_pre_ping=True,
        pool_recycle=3600,
    )

# Create database engine with graceful fallback to SQLite if Postgres fails
primary_url = settings.database_url
engine = _make_engine(primary_url)

# Proactively test connection; if it fails, fallback to SQLite for local dev
try:
    with engine.connect() as conn:
        # Use exec_driver_sql or text() to be compatible with SQLAlchemy 2.0
        conn.exec_driver_sql("SELECT 1")
        logger.info("Connected to database successfully")
except Exception as e:
    logger.warning("Primary database connection failed (%s). Falling back to SQLite ('careerai_fallback.db').", str(e))
    fallback_url = "sqlite:///careerai_fallback.db"
    engine = _make_engine(fallback_url)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
