from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import os
import shutil
from pathlib import Path

from database import get_db
from models import Resume, User, ResumeAnalysis
from routers.users import get_current_user

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    is_primary: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a resume file
    
    **Request:**
    - file: PDF or DOCX resume file
    - is_primary: Set as primary resume (default: false)
    
    **Supported formats:** PDF, DOCX, DOC
    """
    
    if current_user.role.value != "STUDENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can upload resumes"
        )
    
    # Validate file type
    allowed_types = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are allowed"
        )
    
    # Save file
    file_path = UPLOAD_DIR / f"{current_user.id}_{file.filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )
    
    # Create resume record
    resume = Resume(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=str(file_path),
        file_size=os.path.getsize(file_path),
        file_type=file.content_type,
        is_primary=is_primary,
        uploaded_at=datetime.utcnow()
    )
    
    # If this is primary, unset previous primary
    if is_primary:
        db.query(Resume).filter(
            Resume.user_id == current_user.id,
            Resume.is_primary == True
        ).update({Resume.is_primary: False})
    
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    return {
        "message": "Resume uploaded successfully",
        "resume_id": resume.id,
        "file_name": resume.file_name,
        "is_primary": resume.is_primary
    }

@router.get("")
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all resumes for current user"""
    
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).order_by(Resume.uploaded_at.desc()).all()
    
    return {
        "resumes": resumes,
        "total": len(resumes)
    }

@router.get("/{resume_id}")
async def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific resume"""
    
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check access: user can view their own resumes, employers can view in context of applications
    if resume.user_id != current_user.id and current_user.role.value != "EMPLOYER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access this resume"
        )
    
    return resume

@router.get("/{resume_id}/download")
async def download_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download a resume file"""
    
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check access
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot download this resume"
        )
    
    if not os.path.exists(resume.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file not found on server"
        )
    
    return FileResponse(
        resume.file_path,
        filename=resume.file_name,
        media_type=resume.file_type
    )

@router.put("/{resume_id}")
async def update_resume(
    resume_id: str,
    is_primary: bool = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update resume metadata"""
    
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update this resume"
        )
    
    if is_primary is not None:
        resume.is_primary = is_primary
        
        # If setting as primary, unset others
        if is_primary:
            db.query(Resume).filter(
                Resume.user_id == current_user.id,
                Resume.is_primary == True,
                Resume.id != resume_id
            ).update({Resume.is_primary: False})
    
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    return resume

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resume"""
    
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete this resume"
        )
    
    # Delete file
    try:
        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)
    except Exception as e:
        # Log error but continue with database deletion
        pass
    
    # Delete analyses related to this resume
    db.query(ResumeAnalysis).filter(
        ResumeAnalysis.resume_id == resume_id
    ).delete()
    
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}
