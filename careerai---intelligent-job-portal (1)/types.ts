
export enum UserRole {
  STUDENT = 'STUDENT',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN'
}

export enum PageView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  STUDENT_DASHBOARD = 'STUDENT_DASHBOARD',
  EMPLOYER_DASHBOARD = 'EMPLOYER_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_USERS = 'ADMIN_USERS',
  JOB_SEARCH = 'JOB_SEARCH',
  JOB_DETAILS = 'JOB_DETAILS',
  JOB_RECOMMENDATIONS = 'JOB_RECOMMENDATIONS',
  APPLY_JOB = 'APPLY_JOB',
  APPLICATION_HISTORY = 'APPLICATION_HISTORY',
  RESUME_ANALYSIS = 'RESUME_ANALYSIS',
  CAREER_CHAT = 'CAREER_CHAT',
  AI_INTERVIEW = 'AI_INTERVIEW',
  PROFILE = 'PROFILE',
  POST_JOB = 'POST_JOB',
  VIEW_APPLICANTS = 'VIEW_APPLICANTS',
  SETTINGS = 'SETTINGS'
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salaryRange: string;
  description: string;
  requirements: string[];
  postedDate: string;
  logoUrl: string;
  coverUrl?: string;
  applicantCount?: number;
  companyDescription?: string;
}

export interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendation: string;
  careerPathAdvice: string;
  analyzedRole?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type UserStatus = 'Active' | 'Inactive' | 'Pending';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl: string;
  bio?: string;
  title?: string;
  status: UserStatus;
  joinedDate: string;
  // Student-specific fields
  university?: string;
  major?: string;
  graduationYear?: string;
  gpa?: string;
  skills?: string[];
  certifications?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  phone?: string;
  location?: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  appliedDate: string;
  matchScore: number;
  status: 'New' | 'Reviewing' | 'Interview' | 'Rejected';
  avatarUrl: string;
  aiAnalysis?: RecruitmentAnalysis;
}

export interface RecruitmentAnalysis {
  skillMatchPercentage: number;
  missingSkills: string[];
  experienceRelevanceScore: number;
  atsCompatibilityScore: number;
  strengths: string[];
  weakAreas: string[];
  verdict: 'Highly Suitable' | 'Suitable' | 'Not Suitable';
  detailedSummary: string;
}

export interface Notification {
  id: string;
  type: 'job_match' | 'application_update' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: PageView;
  data?: any;
}
