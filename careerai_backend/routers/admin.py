from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime, timedelta

from database import get_db
from models import (
    User, Job, JobApplication, Resume,
    UserRole, UserStatus, ApplicationStatus, JobType
)
from routers.users import get_current_user
from schemas import (
    UserStatsResponse, JobStatsResponse,
    AnalyticsResponse, UserResponse,
    AdminApplicationsListResponse, AdminApplicationItem
)

router = APIRouter()

# Admin check dependency
async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure current user is an admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/users/stats", response_model=UserStatsResponse)
async def get_user_statistics(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user statistics (admin only)"""
    
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_employers = db.query(User).filter(User.role == UserRole.EMPLOYER).count()
    total_admins = db.query(User).filter(User.role == UserRole.ADMIN).count()
    active_users = db.query(User).filter(User.status == UserStatus.ACTIVE).count()
    pending_users = db.query(User).filter(User.status == UserStatus.PENDING).count()
    
    return UserStatsResponse(
        total_users=total_users,
        total_students=total_students,
        total_employers=total_employers,
        total_admins=total_admins,
        active_users=active_users,
        pending_users=pending_users
    )

@router.get("/jobs/stats", response_model=JobStatsResponse)
async def get_job_statistics(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get job posting statistics (admin only)"""
    
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.is_active == True).count()
    total_applications = db.query(JobApplication).count()
    
    # Calculate average applicants per job
    avg_applicants = db.query(func.avg(Job.applicant_count)).scalar() or 0.0
    
    # Get most popular locations
    location_stats = db.query(
        Job.location,
        func.count(Job.id).label('count')
    ).group_by(Job.location).order_by(desc('count')).limit(5).all()
    
    most_popular_locations = [
        {"location": loc, "count": count}
        for loc, count in location_stats
    ]
    
    # Get most popular job types
    type_stats = db.query(
        Job.job_type,
        func.count(Job.id).label('count')
    ).group_by(Job.job_type).order_by(desc('count')).all()
    
    most_popular_job_types = [
        {"type": jt.value, "count": count}
        for jt, count in type_stats
    ]
    
    return JobStatsResponse(
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        total_applications=total_applications,
        avg_applicants_per_job=float(avg_applicants),
        most_popular_locations=most_popular_locations,
        most_popular_job_types=most_popular_job_types
    )

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics (admin only)"""
    
    # Get user stats
    user_stats = await get_user_statistics(admin, db)
    
    # Get job stats
    job_stats = await get_job_statistics(admin, db)
    
    # Calculate recent activity (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    recent_signups = db.query(User).filter(
        User.created_at >= thirty_days_ago
    ).count()
    
    recent_job_postings = db.query(Job).filter(
        Job.posted_date >= thirty_days_ago
    ).count()
    
    # Calculate application conversion rate (applications to acceptances)
    total_apps = db.query(JobApplication).count()
    accepted_apps = db.query(JobApplication).filter(
        JobApplication.status == ApplicationStatus.ACCEPTED
    ).count()
    
    conversion_rate = (accepted_apps / total_apps * 100) if total_apps > 0 else 0.0
    
    return AnalyticsResponse(
        user_stats=user_stats,
        job_stats=job_stats,
        recent_signups=recent_signups,
        recent_job_postings=recent_job_postings,
        avg_application_conversion_rate=conversion_rate
    )

@router.get("/applications", response_model=AdminApplicationsListResponse)
async def admin_list_applications(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all job applications system-wide (admin only) with applicant and job details"""

    query = db.query(JobApplication)
    if status:
        query = query.filter(JobApplication.status == status)

    total = query.count()
    skip = (page - 1) * page_size
    apps = query.order_by(JobApplication.applied_date.desc()).offset(skip).limit(page_size).all()

    items: list[AdminApplicationItem] = []
    for app in apps:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        user = db.query(User).filter(User.id == app.user_id).first()
        employer_name = None
        if job:
            employer = db.query(User).filter(User.id == job.posted_by).first()
            employer_name = f"{employer.first_name} {employer.last_name}" if employer else None
        items.append(AdminApplicationItem(
            id=app.id,
            job_id=app.job_id,
            job_title=job.title if job else "",
            employer_id=job.posted_by if job else "",
            employer_name=employer_name,
            user_id=app.user_id,
            applicant_name=(f"{user.first_name} {user.last_name}" if user else ""),
            applicant_email=(user.email if user else ""),
            status=app.status,
            applied_date=app.applied_date,
            match_score=app.match_score,
        ))

    return AdminApplicationsListResponse(
        total=total,
        page=page,
        page_size=page_size,
        applications=items
    )

@router.get("/users", response_model=list[UserResponse])
async def list_all_users(
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all users with filtering (admin only)
    
    **Query parameters:**
    - role: Filter by role (STUDENT, EMPLOYER, ADMIN)
    - status: Filter by status (ACTIVE, PENDING, SUSPENDED)
    - skip: Number of records to skip
    - limit: Number of records to return
    """
    
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    if status:
        query = query.filter(User.status == status)
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return users

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    new_status: UserStatus,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update user account status (admin only)
    
    **Path parameters:**
    - user_id: User to update
    
    **Request body:**
    - new_status: ACTIVE, PENDING, or SUSPENDED
    """
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.status = new_status
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"User status updated to {new_status.value}",
        "user": user
    }

@router.delete("/users/{user_id}")
async def delete_user_admin(
    user_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete any user account (admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting other admins
    if user.role == UserRole.ADMIN and user.id != admin.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete other admin accounts"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.delete("/jobs/{job_id}")
async def delete_job_admin(
    job_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete any job posting (admin only)"""
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Delete associated applications
    db.query(JobApplication).filter(JobApplication.job_id == job_id).delete()
    
    db.delete(job)
    db.commit()
    
    return {"message": "Job deleted successfully"}

@router.get("/pending-approvals")
async def get_pending_approvals(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all pending employer approvals (admin only)"""
    
    pending_employers = db.query(User).filter(
        User.role == UserRole.EMPLOYER,
        User.status == UserStatus.PENDING
    ).order_by(User.created_at.desc()).all()
    
    return {
        "total": len(pending_employers),
        "employers": pending_employers
    }

@router.post("/approve-employer/{user_id}")
async def approve_employer(
    user_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Approve a pending employer account (admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not an employer"
        )
    
    user.status = UserStatus.ACTIVE
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Employer account approved",
        "user": user
    }
