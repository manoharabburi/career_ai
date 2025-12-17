
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from config import settings


# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

class AuthService:
    """Service for authentication-related operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt (truncates to 72 bytes if needed)"""
        if not password:
            raise ValueError("Password cannot be empty")
        # Bcrypt has a 72-byte limit; truncate password if needed
        password_bytes = password.encode('utf-8')[:72]
        return pwd_context.hash(password_bytes.decode('utf-8', errors='ignore'))
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash (truncates to 72 bytes if needed)"""
        if not plain_password:
            return False
        # Apply same truncation as hash_password
        password_bytes = plain_password.encode('utf-8')[:72]
        return pwd_context.verify(password_bytes.decode('utf-8', errors='ignore'), hashed_password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=getattr(settings, "jwt_expiration_hours", 24))
        
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(
            to_encode,
            getattr(settings, "jwt_secret_key", "change-me-in-production"),
            algorithm=getattr(settings, "jwt_algorithm", "HS256")
        )
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create a JWT refresh token with longer expiration"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=getattr(settings, "refresh_token_expiration_days", 7))
        to_encode.update({"exp": expire, "type": "refresh"})
        
        encoded_jwt = jwt.encode(
            to_encode,
            getattr(settings, "jwt_secret_key", "change-me-in-production"),
            algorithm=getattr(settings, "jwt_algorithm", "HS256")
        )
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify a JWT token and return the payload"""
        try:
            payload = jwt.decode(
                token,
                getattr(settings, "jwt_secret_key", "change-me-in-production"),
                algorithms=[getattr(settings, "jwt_algorithm", "HS256")]
            )
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def get_token_user_id(payload: dict) -> Optional[str]:
        """Extract user_id from token payload"""
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return user_id
