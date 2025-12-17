from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from config import settings
from database import get_db, engine, Base
from routers import auth, users, jobs, resumes, applications, analysis, admin, interviews

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables (gracefully handle if DB is unavailable)
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully")
except Exception as e:
    logger.warning(f"Could not initialize database: {e}. API will run without persistence.")

# Initialize FastAPI app
app = FastAPI(
    title="CareerAI - Intelligent Job Portal",
    description="AI-powered job matching and career development platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS
# settings.allowed_origins may be a comma-separated string from .env; normalize to list
default_allowed = [
    "http://localhost:3000",
    "http://localhost:5173",
]

if hasattr(settings, "allowed_origins") and settings.allowed_origins:
    if isinstance(settings.allowed_origins, str):
        allowed_origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]
    elif isinstance(settings.allowed_origins, (list, tuple)):
        allowed_origins = list(settings.allowed_origins)
    else:
        allowed_origins = default_allowed
else:
    allowed_origins = default_allowed

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Total-Pages"]
)

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "body": exc.body if hasattr(exc, 'body') else None
        },
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "CareerAI Backend"
    }

# Include routers
app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Authentication"]
)

app.include_router(
    users.router,
    prefix="/api/users",
    tags=["Users"]
)

app.include_router(
    jobs.router,
    prefix="/api/jobs",
    tags=["Jobs"]
)

app.include_router(
    resumes.router,
    prefix="/api/resumes",
    tags=["Resumes"]
)

app.include_router(
    applications.router,
    prefix="/api/applications",
    tags=["Applications"]
)

app.include_router(
    analysis.router,
    prefix="/api/analysis",
    tags=["AI Analysis"]
)

app.include_router(
    admin.router,
    prefix="/api/admin",
    tags=["Admin"]
)

app.include_router(
    interviews.router,
    prefix="/api/interviews",
    tags=["AI Interviews"]
)

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to CareerAI - Intelligent Job Portal API",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=getattr(settings, "debug", False),
        log_level="info"
    )
