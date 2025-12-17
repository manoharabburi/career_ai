from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from database import get_db
from models import (
    JobApplication, Job, User, Resume,
    ApplicationStatus, UserRole
)
from routers.users import get_current_user
from schemas import (
    JobApplicationCreate, JobApplicationResponse,
    ApplicantResponse, JobApplicationListResponse,
    UpdateApplicationStatusRequest
)

router = APIRouter()

@router.post("", response_model=JobApplicationResponse)
async def apply_for_job(
    application: JobApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Apply for a job
    
    **Request body:**
    - job_id: Job to apply for
    - resume_id: Optional resume to attach (uses primary if not specified)
    """
    
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can apply for jobs"
        )
    
    # Check if job exists
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if not job.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job is no longer accepting applications"
        )
    
    # Check if already applied
    existing_app = db.query(JobApplication).filter(
        JobApplication.job_id == application.job_id,
        JobApplication.user_id == current_user.id
    ).first()
    
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already applied to this job"
        )
    
    # Get resume
    resume_id = application.resume_id
    if not resume_id:
        # Use primary resume
        primary_resume = db.query(Resume).filter(
            Resume.user_id == current_user.id,
            Resume.is_primary == True
        ).first()
        
        if primary_resume:
            resume_id = primary_resume.id
    
    # Parse AI analysis if present
    ai_data = None
    if application.ai_analysis:
        try:
            import json
            ai_data = json.loads(application.ai_analysis)
        except:
            pass

    # Create application
    new_application = JobApplication(
        job_id=application.job_id,
        user_id=current_user.id,
        resume_id=resume_id,
        status=ApplicationStatus.PENDING,
        applied_date=datetime.utcnow(),
        cover_letter=application.cover_letter,
        ai_analysis=ai_data
    )
    
    db.add(new_application)
    
    # Update job applicant count
    job.applicant_count += 1
    db.add(job)
    
    db.commit()
    db.refresh(new_application)
    
    return new_application

@router.get("", response_model=list[JobApplicationResponse])
async def get_my_applications(
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all applications for current user
    
    **Query parameters:**
    - status: Filter by status (PENDING, REVIEWING, ACCEPTED, REJECTED)
    """
    
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can view their applications"
        )
    
    query = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    )
    
    if status:
        query = query.filter(JobApplication.status == status)
    
    applications = query.order_by(JobApplication.applied_date.desc()).all()
    
    # Manually populate job details
    result = []
    for app in applications:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        res = JobApplicationResponse(
            id=app.id,
            job_id=app.job_id,
            user_id=app.user_id,
            status=app.status,
            applied_date=app.applied_date,
            match_score=app.match_score,
            resume_id=app.resume_id,
            cover_letter=app.cover_letter,
            job_title=job.title if job else "Unknown Job",
            company_name=job.company_name if job else "Unknown Company",
            logo_url=job.logo_url if job else None
        )
        result.append(res)
        
    return result

@router.get("/{application_id}", response_model=JobApplicationResponse)
async def get_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific application"""
    
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check access: student can view own application, employer can view applications to their jobs
    job = db.query(Job).filter(Job.id == application.job_id).first()
    
    if (application.user_id != current_user.id and 
        (current_user.role != UserRole.EMPLOYER or job.posted_by != current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access this application"
        )
    
    return application

@router.get("/job/{job_id}/applicants", response_model=JobApplicationListResponse)
async def get_job_applicants(
    job_id: str,
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all applicants for a specific job (employer only)
    
    **Query parameters:**
    - status: Filter by application status
    """
    
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can view applicants"
        )
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.posted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only view applicants for your own jobs"
        )
    
    try:
        query = db.query(JobApplication).filter(
            JobApplication.job_id == job_id
        )
        
        if status:
            query = query.filter(JobApplication.status == status)
        
        applications = query.order_by(JobApplication.applied_date.desc()).all()
        print(f"DEBUG: Found {len(applications)} applications for job {job_id}")
        
        # Build applicant responses
        applicants = []
        for app in applications:
            print(f"DEBUG: Processing app {app.id}, user {app.user_id}, status {app.status}")
            user = db.query(User).filter(User.id == app.user_id).first()
            if user:
                print(f"DEBUG: User found: {user.first_name} {user.last_name}")
                applicants.append(ApplicantResponse(
                    id=app.id,
                    name=f"{user.first_name} {user.last_name}",
                    email=user.email,
                    avatar_url=user.avatar_url,
                    applied_date=app.applied_date,
                    status=app.status,
                    match_score=app.match_score
                ))
            else:
                print(f"DEBUG: User {app.user_id} not found!")
        
        print("DEBUG: Returning response")
        return JobApplicationListResponse(
            job_id=job_id,
            job_title=job.title,
            total_applicants=len(applicants),
            applicants=applicants
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"ERROR in get_job_applicants: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{application_id}/status")
async def update_application_status(
    application_id: str,
    request: UpdateApplicationStatusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update application status (employer only)
    
    **Request body:**
    - status: New status (REVIEWING, ACCEPTED, REJECTED)
    - notes: Optional employer notes
    """
    
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can update application status"
        )
    
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    job = db.query(Job).filter(Job.id == application.job_id).first()
    
    if job.posted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update applications for your own jobs"
        )
    
    application.status = request.status
    
    if request.notes:
        application.employer_notes = request.notes
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return {
        "message": "Application status updated successfully",
        "application": application
    }

@router.delete("/{application_id}")
async def withdraw_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Withdraw a job application (student only - own applications)"""
    
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only withdraw your own applications"
        )
    
    # Update job applicant count
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if job and job.applicant_count > 0:
        job.applicant_count -= 1
        db.add(job)
    
    db.delete(application)
    db.commit()
    
    return {"message": "Application withdrawn successfully"}
