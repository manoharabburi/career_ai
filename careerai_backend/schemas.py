from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from models import UserRole, JobType, ApplicationStatus, UserStatus

# ===================== AUTH SCHEMAS =====================

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    role: UserRole = UserRole.STUDENT
    phone: Optional[str] = None
    location: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# ===================== USER SCHEMAS =====================

class StudentProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    university: Optional[str] = None
    major: Optional[str] = None
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class EmployerProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    location: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    role: UserRole
    status: UserStatus
    created_at: datetime
    
    # Student fields
    university: Optional[str] = None
    major: Optional[str] = None
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    
    class Config:
        from_attributes = True

# ===================== JOB SCHEMAS =====================

class JobCreate(BaseModel):
    title: str
    description: str
    location: str
    job_type: JobType
    salary_range: Optional[str] = None
    company_name: str
    company_description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    requirements: Optional[List[str]] = None

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[JobType] = None
    salary_range: Optional[str] = None
    company_description: Optional[str] = None
    requirements: Optional[List[str]] = None

class JobResponse(BaseModel):
    id: str
    title: str
    description: str
    location: str
    job_type: JobType
    salary_range: Optional[str]
    company_name: str
    company_description: Optional[str]
    logo_url: Optional[str]
    cover_url: Optional[str]
    requirements: Optional[List[str]]
    applicant_count: int
    posted_date: datetime
    is_active: bool
    posted_by: str
    
    class Config:
        from_attributes = True

class JobListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    jobs: List[JobResponse]

# ===================== RESUME SCHEMAS =====================

class ResumeExtractedData(BaseModel):
    skills: Optional[List[str]] = None
    experience: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    contact: Optional[dict] = None

class ResumeResponse(BaseModel):
    id: str
    file_name: str
    file_size: int
    file_type: str
    uploaded_at: datetime
    is_primary: bool
    extracted_skills: Optional[List[str]] = None
    extracted_experience: Optional[List[dict]] = None
    extracted_education: Optional[List[dict]] = None
    
    class Config:
        from_attributes = True

class ResumeListResponse(BaseModel):
    resumes: List[ResumeResponse]
    total: int

# ===================== RESUME ANALYSIS SCHEMAS =====================

class ResumeAnalysisResponse(BaseModel):
    id: str
    overall_score: float
    match_score: Optional[float] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    career_path_advice: Optional[str] = None
    analyzed_at: datetime
    
    class Config:
        from_attributes = True

class JobMatchAnalysisResponse(BaseModel):
    job_id: str
    job_title: str
    match_score: float
    strengths: List[str]
    weaknesses: List[str]
    missing_skills: List[str]
    recommendations: List[str]

# ===================== APPLICATION SCHEMAS =====================

class JobApplicationCreate(BaseModel):
    job_id: str
    resume_id: Optional[str] = None
    cover_letter: Optional[str] = None
    ai_analysis: Optional[str] = None

class JobApplicationResponse(BaseModel):
    id: str
    job_id: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    logo_url: Optional[str] = None
    user_id: str
    status: ApplicationStatus
    applied_date: datetime
    match_score: Optional[float] = None
    resume_id: Optional[str] = None
    cover_letter: Optional[str] = None
    
    class Config:
        from_attributes = True

class ApplicantResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar_url: Optional[str]
    applied_date: datetime
    status: ApplicationStatus
    match_score: Optional[float] = None

class JobApplicationListResponse(BaseModel):
    job_id: str
    job_title: str
    total_applicants: int
    applicants: List[ApplicantResponse]

class UpdateApplicationStatusRequest(BaseModel):
    status: ApplicationStatus
    notes: Optional[str] = None

# ===================== ADMIN APPLICATION VIEW SCHEMAS =====================

class AdminApplicationItem(BaseModel):
    id: str
    job_id: str
    job_title: str
    employer_id: str
    employer_name: Optional[str] = None
    user_id: str
    applicant_name: str
    applicant_email: str
    status: ApplicationStatus
    applied_date: datetime
    match_score: Optional[float] = None

class AdminApplicationsListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    applications: List[AdminApplicationItem]

# ===================== CAREER RECOMMENDATION SCHEMAS =====================

class CareerRecommendationResponse(BaseModel):
    title: str
    description: str
    match_percentage: float
    required_skills: List[str]
    missing_skills: List[str]
    learning_path: List[str]
    average_salary: Optional[str]
    job_market_outlook: str
    time_to_proficiency: str

class CareerRoadmapResponse(BaseModel):
    current_role: str
    target_role: str
    estimated_timeline: str
    milestones: List[dict]  # [{"month": 1, "goal": "Learn X"}]
    required_skills_to_learn: List[str]
    resources: List[dict]  # [{"name": "Course Name", "platform": "Udemy", "duration": "10 weeks"}]

class SkillImprovementResponse(BaseModel):
    skill: str
    current_level: str
    next_level: str
    estimated_time: str
    resources: List[dict]
    jobs_requiring_skill: int

# ===================== ADMIN SCHEMAS =====================

class UserStatsResponse(BaseModel):
    total_users: int
    total_students: int
    total_employers: int
    total_admins: int
    active_users: int
    pending_users: int

class JobStatsResponse(BaseModel):
    total_jobs: int
    active_jobs: int
    total_applications: int
    avg_applicants_per_job: float
    most_popular_locations: List[dict]
    most_popular_job_types: List[dict]

class AnalyticsResponse(BaseModel):
    user_stats: UserStatsResponse
    job_stats: JobStatsResponse
    recent_signups: int  # Last 30 days
    recent_job_postings: int  # Last 30 days
    avg_application_conversion_rate: float

# ===================== PAGINATION SCHEMAS =====================

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool
