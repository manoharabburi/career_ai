from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:Vishnu%40123@localhost:5432/Resume"
    
    # JWT
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    refresh_token_expiration_days: int = 7
    
    # Server
    debug: bool = True
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"
    
    # Admin seed credentials (optional)
    admin_email: Optional[str] = None
    admin_password: Optional[str] = None
    
    # API Keys
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
