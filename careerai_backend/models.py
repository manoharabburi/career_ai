from datetime import datetime
from enum import Enum as PyEnum
import uuid
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Float, Boolean, JSON, Table
from sqlalchemy.orm import relationship
from database import Base

# Enums
class UserRole(str, PyEnum):
    STUDENT = "STUDENT"
    EMPLOYER = "EMPLOYER"
    ADMIN = "ADMIN"

class JobType(str, PyEnum):
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    CONTRACT = "Contract"
    REMOTE = "Remote"
    INTERNSHIP = "Internship"

class ApplicationStatus(str, PyEnum):
    PENDING = "PENDING"
    APPLIED = "APPLIED"
    REVIEWING = "REVIEWING"
    INTERVIEW = "INTERVIEW"
    REJECTED = "REJECTED"
    OFFER = "OFFER"
    ACCEPTED = "ACCEPTED"

class UserStatus(str, PyEnum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    PENDING = "Pending"
    SUSPENDED = "Suspended"

# Association table for job skills
job_skills = Table(
    'job_skills',
    Base.metadata,
    Column('job_id', String, ForeignKey('jobs.id')),
    Column('skill', String)
)

# User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Student-specific fields
    university = Column(String, nullable=True)
    major = Column(String, nullable=True)
    graduation_year = Column(String, nullable=True)
    gpa = Column(String, nullable=True)
    skills = Column(JSON, default=[], nullable=True)  # Array of skills
    certifications = Column(JSON, default=[], nullable=True)  # Array of certifications
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    
    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    posted_jobs = relationship("Job", back_populates="employer", cascade="all, delete-orphan")

# Job Model
class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False, index=True)
    job_type = Column(Enum(JobType), nullable=False)
    salary_range = Column(String, nullable=True)
    company_name = Column(String, nullable=False, index=True)
    company_description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    requirements = Column(JSON, default=[], nullable=True)  # Array of required skills
    applicant_count = Column(Integer, default=0)
    posted_by = Column(String, ForeignKey("users.id"), nullable=False)
    posted_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    employer = relationship("User", back_populates="posted_jobs")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")

# Resume Model
class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    file_type = Column(String, nullable=False)  # pdf, docx, etc.
    
    # Extracted information
    extracted_text = Column(Text, nullable=True)
    extracted_skills = Column(JSON, default=[], nullable=True)
    extracted_experience = Column(JSON, default=[], nullable=True)
    extracted_education = Column(JSON, default=[], nullable=True)
    extracted_contact = Column(JSON, nullable=True)
    
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_primary = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan")

# Resume Analysis Model
class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=False)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=True)  # Optional - for job-specific analysis
    
    # Analysis results
    overall_score = Column(Float, nullable=False)  # 0-100
    match_score = Column(Float, nullable=True)  # 0-100 (for job matching)
    strengths = Column(JSON, default=[], nullable=True)
    weaknesses = Column(JSON, default=[], nullable=True)
    missing_skills = Column(JSON, default=[], nullable=True)
    recommendations = Column(JSON, default=[], nullable=True)
    career_path_advice = Column(Text, nullable=True)
    
    analyzed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    analysis_version = Column(String, default="1.0")  # For tracking model versions
    
    # Relationships
    resume = relationship("Resume", back_populates="analyses")

# Job Application Model
class JobApplication(Base):
    __tablename__ = "job_applications"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.APPLIED, nullable=False)
    applied_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Optional resume used for this application
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=True)
    
    # Employer notes
    employer_notes = Column(Text, nullable=True)
    match_score = Column(Float, nullable=True)  # AI-generated match score
    
    # Interview details
    interview_date = Column(DateTime, nullable=True)
    interview_notes = Column(Text, nullable=True)
    
    # AI Interview Results
    ai_interview_results = relationship("InterviewResult", back_populates="application", cascade="all, delete-orphan")
    
    # AI Resume Analysis
    ai_analysis = Column(JSON, nullable=True)  # Stores resume analysis result
    cover_letter = Column(Text, nullable=True)
    
    # Relationships
    job = relationship("Job", back_populates="applications")
    user = relationship("User", back_populates="applications")

# Skill Model (for skill database/taxonomy)
class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False, index=True)
    category = Column(String, nullable=True)  # e.g., "Programming Language", "Framework", "Database"
    description = Column(Text, nullable=True)
    proficiency_levels = Column(JSON, default=["Beginner", "Intermediate", "Advanced", "Expert"])
    
    created_at = Column(DateTime, default=datetime.utcnow)

# Career Path Model (for recommendations)
class CareerPath(Base):
    __tablename__ = "career_paths"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)  # e.g., "Frontend Developer"
    description = Column(Text, nullable=True)
    required_skills = Column(JSON, default=[], nullable=True)
    recommended_courses = Column(JSON, default=[], nullable=True)
    average_salary = Column(String, nullable=True)
    job_market_outlook = Column(Text, nullable=True)
    related_positions = Column(JSON, default=[], nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

# AI Interview Result Model
class InterviewResult(Base):
    __tablename__ = "interview_results"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String, ForeignKey("job_applications.id"), nullable=False)
    
    # Interview metadata
    interview_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    job_title = Column(String, nullable=False)
    
    # Interview questions and answers
    questions = Column(JSON, default=[], nullable=False)  # Array of interview questions
    answers = Column(JSON, default=[], nullable=False)  # Array of candidate answers
    
    # Evaluation scores
    technical_score = Column(Float, nullable=False)  # 0-100
    communication_score = Column(Float, nullable=False)  # 0-100
    confidence_level = Column(String, nullable=False)  # Low, Medium, High
    overall_score = Column(Float, nullable=False)  # 0-100
    
    # Comprehensive analysis
    strengths_observed = Column(JSON, default=[], nullable=True)  # Array of strengths
    weaknesses_observed = Column(JSON, default=[], nullable=True)  # Array of weaknesses
    skills_to_improve = Column(JSON, default=[], nullable=True)  # Array of skills to develop
    readiness_level = Column(String, nullable=False)  # Ready, Nearly Ready, Needs Development, Not Ready
    
    # Question-wise analysis
    question_wise_analysis = Column(JSON, default=[], nullable=True)  # Detailed analysis per question
    question_scores = Column(JSON, default=[], nullable=True)  # Score and feedback per question
    
    # Final recommendation and feedback
    hiring_recommendation = Column(String, nullable=False)  # Strong Hire, Hire, Consider, Reject
    detailed_feedback = Column(Text, nullable=True)
    
    # Relationship
    application = relationship("JobApplication", back_populates="ai_interview_results")
