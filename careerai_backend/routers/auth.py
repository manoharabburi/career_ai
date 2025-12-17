from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import timedelta
import uuid
from typing import Optional

from database import get_db
from models import User, UserRole, UserStatus
from core_auth import AuthService
from schemas import (
    SignupRequest, LoginRequest, TokenResponse,
    RefreshTokenRequest, UserResponse
)

router = APIRouter()

@router.post("/signup", response_model=TokenResponse)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user
    
    **Request body:**
    - email: User email
    - password: Password (minimum 8 characters)
    - first_name: First name
    - last_name: Last name
    - role: User role (STUDENT or EMPLOYER)
    - phone: Optional phone number
    - location: Optional location
    """
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        or_(User.email == request.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = AuthService.hash_password(request.password)
    
    new_user = User(
        id=str(uuid.uuid4()),
        email=request.email,
        hashed_password=hashed_password,
        first_name=request.first_name,
        last_name=request.last_name,
        role=request.role,
        phone=request.phone,
        location=request.location,
        status=UserStatus.PENDING if request.role == UserRole.EMPLOYER else UserStatus.ACTIVE
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create tokens
    access_token = AuthService.create_access_token({"sub": new_user.id})
    refresh_token = AuthService.create_refresh_token({"sub": new_user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=int(timedelta(hours=1).total_seconds())
    )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login user and return access and refresh tokens
    
    **Request body:**
    - email: User email
    - password: User password
    """
    
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not AuthService.verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if user.status == UserStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended"
        )
    
    # Create tokens
    access_token = AuthService.create_access_token({"sub": user.id})
    refresh_token = AuthService.create_refresh_token({"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=int(timedelta(hours=1).total_seconds())
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token
    
    **Request body:**
    - refresh_token: Valid refresh token
    """
    
    payload = AuthService.verify_token(request.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user_id = AuthService.get_token_user_id(payload)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create new access token
    access_token = AuthService.create_access_token({"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=request.refresh_token,  # Can reuse same refresh token
        expires_in=int(timedelta(hours=1).total_seconds())
    )

@router.post("/verify-token")
async def verify_token(token: str):
    """
    Verify if a token is valid
    
    **Query parameters:**
    - token: JWT token to verify
    """
    
    payload = AuthService.verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return {
        "valid": True,
        "user_id": payload.get("sub"),
        "expires_at": payload.get("exp")
    }
