from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional
from datetime import datetime

from database import get_db
from models import Job, User, UserRole, JobApplication, ApplicationStatus
from core_auth import AuthService
from schemas import (
    JobCreate, JobUpdate, JobResponse, JobListResponse
)
from routers.users import get_current_user

router = APIRouter()

@router.post("", response_model=JobResponse)
async def create_job(
    job: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new job posting (employer only)
    
    **Request body:**
    - title: Job title
    - description: Job description
    - location: Job location
    - job_type: Type of job (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP)
    - salary_range: Optional salary range
    - company_name: Company name
    - company_description: Optional company description
    - logo_url: Optional company logo URL
    - cover_url: Optional job cover image URL
    - requirements: Optional list of job requirements
    """
    
    # Check if user is employer
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can post jobs"
        )
    
    new_job = Job(
        title=job.title,
        description=job.description,
        location=job.location,
        job_type=job.job_type,
        salary_range=job.salary_range,
        company_name=job.company_name,
        company_description=job.company_description,
        logo_url=job.logo_url,
        cover_url=job.cover_url,
        requirements=job.requirements or [],
        posted_by=current_user.id,
        posted_date=datetime.utcnow(),
        is_active=True
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    return new_job

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific job by ID"""
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return job

@router.get("", response_model=JobListResponse)
async def list_jobs(
    location: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    is_active: bool = True,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List all jobs with optional filtering
    
    **Query parameters:**
    - location: Filter by location
    - job_type: Filter by job type
    - keyword: Search in title and description
    - is_active: Filter by active status (default: true)
    - skip: Number of records to skip (default: 0)
    - limit: Number of records to return (default: 20, max: 100)
    """
    
    try:
        query = db.query(Job).filter(Job.is_active == is_active)
        
        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        
        if job_type:
            query = query.filter(Job.job_type == job_type)
        
        if keyword:
            query = query.filter(
                or_(
                    Job.title.ilike(f"%{keyword}%"),
                    Job.description.ilike(f"%{keyword}%")
                )
            )
        
        total = query.count()
        jobs = query.order_by(Job.posted_date.desc()).offset(skip).limit(limit).all()
        
        return JobListResponse(
            total=total,
            page=(skip // limit) + 1,
            page_size=limit,
            jobs=jobs
        )
    except Exception as e:
        # Return empty list if DB is unavailable
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Error fetching jobs from DB: {e}")
        return JobListResponse(
            total=0,
            page=1,
            page_size=limit,
            jobs=[]
        )

@router.get("/employer/my-jobs")
async def get_employer_jobs(
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all jobs posted by current employer"""
    
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can access their jobs"
        )
    
    total = db.query(Job).filter(Job.posted_by == current_user.id).count()
    jobs = db.query(Job).filter(
        Job.posted_by == current_user.id
    ).order_by(Job.posted_date.desc()).offset(skip).limit(limit).all()
    
    return JobListResponse(
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
        jobs=jobs
    )

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    update: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a job posting (employer only - own jobs)"""
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check ownership
    if job.posted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update your own jobs"
        )
    
    update_data = update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.add(job)
    db.commit()
    db.refresh(job)
    
    return job

@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a job posting (employer only - own jobs)"""
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check ownership
    if job.posted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only delete your own jobs"
        )
    
    db.delete(job)
    db.commit()
    
    return {"message": "Job deleted successfully"}

@router.post("/{job_id}/close")
async def close_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Close a job posting (stop accepting applications)"""
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.posted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only close your own jobs"
        )
    
    job.is_active = False
    db.add(job)
    db.commit()
    db.refresh(job)
    
    return {"message": "Job closed successfully", "job": job}
