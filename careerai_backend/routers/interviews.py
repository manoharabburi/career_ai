"""
Interview results API router
Handles storing and retrieving AI interview evaluation results
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from typing import List, Optional

from database import get_db
from models import InterviewResult, JobApplication, User, Job, UserRole
from routers.users import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/interviews", tags=["interviews"])

# ============= Pydantic Models =============

class QuestionScoreSchema(BaseModel):
    questionId: int
    score: float
    feedback: str

class QuestionWiseAnalysisSchema(BaseModel):
    questionId: int
    performance: str
    keyTakeaways: str

class SaveInterviewResultRequest(BaseModel):
    application_id: str
    job_title: str
    questions: List[dict]  # Array of interview questions
    answers: List[dict]  # Array of answers {questionId, answer}
    technical_score: float
    communication_score: float
    confidence_level: str
    overall_score: float
    strengths_observed: List[str]
    weaknesses_observed: List[str]
    skills_to_improve: List[str]
    readiness_level: str
    question_wise_analysis: List[dict]
    question_scores: List[dict]
    hiring_recommendation: str
    detailed_feedback: str

class InterviewResultResponse(BaseModel):
    id: str
    application_id: str
    interview_date: datetime
    job_title: str
    technical_score: float
    communication_score: float
    confidence_level: str
    overall_score: float
    strengths_observed: List[str]
    weaknesses_observed: List[str]
    skills_to_improve: List[str]
    readiness_level: str
    hiring_recommendation: str
    
    class Config:
        from_attributes = True

# ============= API Endpoints =============

@router.post("/save", response_model=InterviewResultResponse)
async def save_interview_result(
    request: SaveInterviewResultRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save AI interview evaluation results
    Accessible to students taking interviews
    """
    try:
        # Verify the application exists and belongs to current user
        application = db.query(JobApplication).filter(
            JobApplication.id == request.application_id,
            JobApplication.user_id == current_user.id
        ).first()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Create interview result
        interview_result = InterviewResult(
            id=str(uuid.uuid4()),
            application_id=request.application_id,
            interview_date=datetime.utcnow(),
            job_title=request.job_title,
            questions=request.questions,
            answers=request.answers,
            technical_score=request.technical_score,
            communication_score=request.communication_score,
            confidence_level=request.confidence_level,
            overall_score=request.overall_score,
            strengths_observed=request.strengths_observed,
            weaknesses_observed=request.weaknesses_observed,
            skills_to_improve=request.skills_to_improve,
            readiness_level=request.readiness_level,
            question_wise_analysis=request.question_wise_analysis,
            question_scores=request.question_scores,
            hiring_recommendation=request.hiring_recommendation,
            detailed_feedback=request.detailed_feedback
        )
        
        db.add(interview_result)
        db.commit()
        db.refresh(interview_result)
        
        return interview_result
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save interview result: {str(e)}"
        )

@router.get("/{application_id}", response_model=InterviewResultResponse)
async def get_interview_result(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get interview results for a specific application
    Accessible to student who took interview or employer who posted the job
    """
    try:
        # Get the application
        application = db.query(JobApplication).filter(
            JobApplication.id == application_id
        ).first()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check authorization (student or employer)
        is_applicant = application.user_id == current_user.id
        is_employer = (
            db.query(Job).filter(
                Job.id == application.job_id,
                Job.posted_by == current_user.id
            ).first() is not None
        )
        is_admin = current_user.role == UserRole.ADMIN
        
        if not (is_applicant or is_employer or is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this interview"
            )
        
        # Get interview result
        interview_result = db.query(InterviewResult).filter(
            InterviewResult.application_id == application_id
        ).first()
        
        if not interview_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview result not found for this application"
            )
        
        return interview_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve interview result: {str(e)}"
        )

@router.get("/applicant/{job_id}", response_model=List[InterviewResultResponse])
async def get_applicants_with_interviews(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all applicants with their interview results for a job
    Only accessible to the employer who posted the job
    """
    try:
        # Verify current user is the employer
        job = db.query(Job).filter(Job.id == job_id).first()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        if job.posted_by != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view applicants for this job"
            )
        
        # Get all applications for this job with interview results
        applications = db.query(JobApplication).filter(
            JobApplication.job_id == job_id
        ).all()
        
        interview_results = []
        for app in applications:
            interview = db.query(InterviewResult).filter(
                InterviewResult.application_id == app.id
            ).first()
            if interview:
                interview_results.append(interview)
        
        return interview_results
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve applicants: {str(e)}"
        )

@router.get("/student/{student_id}/history", response_model=List[InterviewResultResponse])
async def get_student_interview_history(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all interviews taken by a student
    Only accessible to the student themselves or admin
    """
    try:
        # Check authorization
        if student_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this student's history"
            )
        
        # Get all applications for this student with interview results
        applications = db.query(JobApplication).filter(
            JobApplication.user_id == student_id
        ).all()
        
        interview_results = []
        for app in applications:
            interview = db.query(InterviewResult).filter(
                InterviewResult.application_id == app.id
            ).first()
            if interview:
                interview_results.append(interview)
        
        return interview_results
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve interview history: {str(e)}"
        )

@router.delete("/{interview_id}")
async def delete_interview_result(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an interview result
    Only accessible to student who took it or admin
    """
    try:
        interview = db.query(InterviewResult).filter(
            InterviewResult.id == interview_id
        ).first()
        
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview result not found"
            )
        
        # Check authorization
        application = db.query(JobApplication).filter(
            JobApplication.id == interview.application_id
        ).first()
        
        if application.user_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this interview"
            )
        
        db.delete(interview)
        db.commit()
        
        return {"message": "Interview result deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete interview result: {str(e)}"
        )
