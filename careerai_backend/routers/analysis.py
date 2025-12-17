from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
import json

from database import get_db
from models import Resume, ResumeAnalysis, Job, User, UserRole
from routers.users import get_current_user
from schemas import (
    ResumeAnalysisResponse, JobMatchAnalysisResponse,
    CareerRecommendationResponse, CareerRoadmapResponse,
    SkillImprovementResponse
)

router = APIRouter()

# Mock AI analysis functions (replace with actual AI service integration)

def analyze_resume_content(resume_text: str) -> dict:
    """Analyze resume and extract key information"""
    # This would call actual AI service (OpenAI, Gemini, etc.)
    return {
        "overall_score": 7.5,
        "strengths": [
            "Strong technical skills in Python and JavaScript",
            "Relevant project experience",
            "Good education background"
        ],
        "weaknesses": [
            "Limited professional work experience",
            "Could add more quantifiable achievements"
        ],
        "recommendations": [
            "Add metrics to project descriptions",
            "Include soft skills in summary",
            "Consider adding certifications"
        ]
    }

def calculate_job_match(resume: Resume, job: Job) -> dict:
    """Calculate how well resume matches job requirements"""
    # This would use AI to match skills, experience, etc.
    return {
        "match_score": 8.2,
        "strengths": [
            "Excellent match for required programming languages",
            "Relevant project experience aligns with job description"
        ],
        "weaknesses": [
            "Limited experience with specific frameworks mentioned"
        ],
        "missing_skills": [
            "Docker",
            "Kubernetes",
            "CI/CD pipelines"
        ],
        "recommendations": [
            "Highlight transferable skills from projects",
            "Mention willingness to learn new technologies",
            "Complete online courses in missing skills"
        ]
    }

def generate_career_recommendations(user: User, top_n: int = 5) -> List[dict]:
    """Generate career path recommendations based on user profile"""
    # This would use AI to analyze skills and suggest career paths
    return [
        {
            "title": "Full Stack Developer",
            "description": "Build end-to-end web applications using modern frameworks",
            "match_percentage": 85.0,
            "required_skills": ["React", "Node.js", "Database Design", "API Development"],
            "missing_skills": ["Docker", "AWS"],
            "learning_path": ["Advanced React Patterns", "Cloud Architecture", "DevOps Fundamentals"],
            "average_salary": "$90,000 - $130,000",
            "job_market_outlook": "Excellent - High demand across all industries",
            "time_to_proficiency": "3-6 months with focused learning"
        }
    ]

def create_career_roadmap(current_role: str, target_role: str, user: User) -> dict:
    """Create a personalized career development roadmap"""
    # This would use AI to create step-by-step plan
    return {
        "current_role": current_role,
        "target_role": target_role,
        "estimated_timeline": "12-18 months",
        "milestones": [
            {"month": 3, "goal": "Complete advanced Python certification"},
            {"month": 6, "goal": "Build portfolio project with full-stack technologies"},
            {"month": 9, "goal": "Contribute to open-source projects"},
            {"month": 12, "goal": "Apply for senior developer positions"}
        ],
        "required_skills_to_learn": ["Advanced React", "System Design", "Leadership"],
        "resources": [
            {"name": "Advanced Web Development", "platform": "Udemy", "duration": "10 weeks"},
            {"name": "System Design Interview", "platform": "Coursera", "duration": "8 weeks"}
        ]
    }

# Endpoints

@router.post("/resume/{resume_id}/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze a resume and provide feedback
    
    **Path parameters:**
    - resume_id: Resume to analyze
    """
    
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot analyze other users' resumes"
        )
    
    # Perform AI analysis
    analysis_result = analyze_resume_content(resume.extracted_text or "")
    
    # Create analysis record
    analysis = ResumeAnalysis(
        resume_id=resume_id,
        overall_score=analysis_result["overall_score"],
        strengths=analysis_result["strengths"],
        weaknesses=analysis_result["weaknesses"],
        recommendations=analysis_result["recommendations"],
        analyzed_at=datetime.utcnow()
    )
    
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    return analysis

@router.post("/resume/{resume_id}/match-job/{job_id}", response_model=JobMatchAnalysisResponse)
async def match_resume_to_job(
    resume_id: str,
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate how well a resume matches a specific job
    
    **Path parameters:**
    - resume_id: Resume to analyze
    - job_id: Job to match against
    """
    
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot analyze other users' resumes"
        )
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Perform job matching analysis
    match_result = calculate_job_match(resume, job)
    
    # Save analysis
    analysis = ResumeAnalysis(
        resume_id=resume_id,
        job_id=job_id,
        match_score=match_result["match_score"],
        strengths=match_result["strengths"],
        weaknesses=match_result["weaknesses"],
        missing_skills=match_result["missing_skills"],
        recommendations=match_result["recommendations"],
        analyzed_at=datetime.utcnow()
    )
    
    db.add(analysis)
    db.commit()
    
    return JobMatchAnalysisResponse(
        job_id=job_id,
        job_title=job.title,
        match_score=match_result["match_score"],
        strengths=match_result["strengths"],
        weaknesses=match_result["weaknesses"],
        missing_skills=match_result["missing_skills"],
        recommendations=match_result["recommendations"]
    )

@router.get("/career-recommendations", response_model=List[CareerRecommendationResponse])
async def get_career_recommendations(
    top_n: int = Query(5, ge=1, le=10),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized career path recommendations
    
    **Query parameters:**
    - top_n: Number of recommendations to return (default: 5, max: 10)
    """
    
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can get career recommendations"
        )
    
    recommendations = generate_career_recommendations(current_user, top_n)
    
    return [CareerRecommendationResponse(**rec) for rec in recommendations]

@router.post("/career-roadmap", response_model=CareerRoadmapResponse)
async def create_roadmap(
    current_role: str,
    target_role: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a personalized career development roadmap
    
    **Request body:**
    - current_role: Current job role/position
    - target_role: Desired target role
    """
    
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create career roadmaps"
        )
    
    roadmap = create_career_roadmap(current_role, target_role, current_user)
    
    return CareerRoadmapResponse(**roadmap)

@router.get("/skill-gaps")
async def analyze_skill_gaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze skill gaps based on job market demands
    """
    
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can analyze skill gaps"
        )
    
    # Get user's current skills
    user_skills = current_user.skills or []
    
    # This would analyze market trends and compare with user skills
    gap_analysis = {
        "current_skills": user_skills,
        "in_demand_skills": [
            "Python", "React", "Docker", "Kubernetes", "AWS",
            "Machine Learning", "System Design", "API Development"
        ],
        "missing_skills": [
            "Docker", "Kubernetes", "AWS"
        ],
        "skill_improvement_recommendations": [
            {
                "skill": "Docker",
                "current_level": "Beginner",
                "next_level": "Intermediate",
                "estimated_time": "2-3 months",
                "resources": [
                    {"name": "Docker Mastery", "platform": "Udemy", "duration": "6 weeks"}
                ],
                "jobs_requiring_skill": 1250
            }
        ]
    }
    
    return gap_analysis

@router.get("/resume/{resume_id}/history")
async def get_analysis_history(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all analyses for a resume"""
    
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access analysis history for other users' resumes"
        )
    
    analyses = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.resume_id == resume_id
    ).order_by(ResumeAnalysis.analyzed_at.desc()).all()
    
    return {
        "resume_id": resume_id,
        "total_analyses": len(analyses),
        "analyses": analyses
    }
