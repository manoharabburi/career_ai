import { Job, User, UserRole, UserStatus } from "../types";

// @ts-ignore
const baseUrl = (import.meta as any)?.env?.VITE_API_URL || ""; // empty => use relative with Vite proxy

// Prevent infinite loading when backend is down by using a timeout
async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...(init || {}), signal: controller.signal });
    return res;
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw e;
  } finally {
    clearTimeout(id);
  }
}

// Map backend job response to frontend Job type
function mapJob(apiJob: any): Job {
  return {
    id: apiJob.id,
    title: apiJob.title,
    company: apiJob.company_name,
    location: apiJob.location,
    type: apiJob.job_type,
    salaryRange: apiJob.salary_range || "",
    description: apiJob.description,
    requirements: apiJob.requirements || [],
    postedDate: apiJob.posted_date || "",
    logoUrl: apiJob.logo_url || "",
    coverUrl: apiJob.cover_url || undefined,
    applicantCount: apiJob.applicant_count || 0,
    companyDescription: apiJob.company_description || undefined,
  };
}

export async function fetchJobs(): Promise<Job[]> {
  const url = `${baseUrl}/api/jobs`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
    return jobs.map(mapJob);
  } catch (err) {
    console.warn("Falling back to mock jobs due to API error:", err);
    throw err;
  }
}

export interface CreateJobPayload {
  title: string;
  description: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | string;
  salaryRange?: string;
  companyDescription?: string;
  requirements?: string[];
}

export async function createJob(payload: CreateJobPayload, token?: string): Promise<Job> {
  const url = `${baseUrl}/api/jobs`;
  const requirements = payload.requirements || [];
  const body = {
    title: payload.title,
    description: payload.description,
    location: payload.location,
    job_type: payload.type, // backend enum matches strings like "Full-time"
    salary_range: payload.salaryRange || undefined,
    company_name: 'Your Company',
    company_description: payload.companyDescription || undefined,
    logo_url: undefined,
    cover_url: undefined,
    requirements,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const bearer = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') || '' : '');
  if (bearer) headers['Authorization'] = `Bearer ${bearer}`;

  const res = await fetchWithTimeout(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    throw new Error(`Failed to create job: ${res.status}`);
  }
  const data = await res.json();
  return mapJob(data);
}

// ================= AUTH =================
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetchWithTimeout(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }, 10000);
  if (!res.ok) {
    // Try to extract server-provided error detail for better UX
    let detail = `Login failed: ${res.status}`;
    try {
      const err = await res.json();
      if (err && err.detail) {
        if (Array.isArray(err.detail)) {
          detail = err.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof err.detail === 'object') {
          detail = JSON.stringify(err.detail);
        } else {
          detail = String(err.detail);
        }
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail);
  }
  return await res.json();
}

export function setAuthTokens(access: string, refresh: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
}

export function getAccessToken(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
}

export async function fetchJob(jobId: string): Promise<Job> {
  const res = await fetchWithTimeout(`${baseUrl}/api/jobs/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch job');
  return res.json();
}

export async function fetchProfile(token?: string): Promise<User> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetchWithTimeout(`${baseUrl}/api/users/profile`, {
    headers: { 'Authorization': `Bearer ${t}` }
  }, 10000);
  if (!res.ok) throw new Error(`Profile failed: ${res.status}`);
  const data = await res.json();
  return mapBackendUserToFrontend(data);
}

// ================= SIGNUP =================
export interface SignupPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'STUDENT' | 'EMPLOYER';
  phone?: string;
  location?: string;
}

export async function signup(payload: SignupPayload): Promise<LoginResponse> {
  const res = await fetchWithTimeout(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 10000);
  if (!res.ok) {
    // Show backend error detail (e.g., "Email already registered")
    let detail = `Signup failed: ${res.status}`;
    try {
      const err = await res.json();
      if (err && err.detail) {
        if (Array.isArray(err.detail)) {
          // FastAPI validation errors
          detail = err.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof err.detail === 'object') {
          detail = JSON.stringify(err.detail);
        } else {
          detail = String(err.detail);
        }
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail);
  }
  return await res.json();
}

// ================= EMPLOYER =================
export async function fetchEmployerJobs(token?: string): Promise<Job[]> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetchWithTimeout(`${baseUrl}/api/jobs/employer/my-jobs`, {
    headers: { 'Authorization': `Bearer ${t}` }
  }, 10000);
  if (!res.ok) throw new Error(`Employer jobs failed: ${res.status}`);
  const data = await res.json();
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs.map(mapJob);
}

// ================= EMPLOYER: Applicants =================
export interface ApplicantItem {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  applied_date: string;
  status: string;
  match_score?: number | null;
}

export async function fetchJobApplicants(jobId: string, token?: string): Promise<ApplicantItem[]> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetchWithTimeout(`${baseUrl}/api/applications/job/${encodeURIComponent(jobId)}/applicants`, {
    headers: { 'Authorization': `Bearer ${t}` }
  }, 10000);
  if (!res.ok) {
    let detail = `Applicants fetch failed: ${res.status}`;
    try {
      const err = await res.json();
      if (err && err.detail) detail = String(err.detail);
    } catch { }
    throw new Error(detail);
  }
  const data = await res.json();
  // Backend returns structure: { job_id, job_title, total_applicants, applicants: [...] }
  const items = Array.isArray(data?.applicants) ? data.applicants : [];

  return items.map((a: any) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    avatar_url: a.avatar_url || null,
    applied_date: String(a.applied_date || ''),
    status: String(a.status || 'New'),
    match_score: typeof a.match_score === 'number' ? a.match_score : null,
  }));
}

// ================= ADMIN =================
export async function adminListUsers(params: { role?: UserRole; status?: UserStatus; skip?: number; limit?: number } = {}, token?: string): Promise<User[]> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const qs = new URLSearchParams();
  if (params.role) qs.set('role', params.role);
  if (params.status) qs.set('status', params.status);
  if (params.skip != null) qs.set('skip', String(params.skip));
  if (params.limit != null) qs.set('limit', String(params.limit));
  const res = await fetch(`${baseUrl}/api/admin/users?${qs.toString()}`, {
    headers: { 'Authorization': `Bearer ${t}` }
  });
  if (!res.ok) throw new Error(`Admin list users failed: ${res.status}`);
  const items = await res.json();
  return items.map(mapBackendUserToFrontend);
}

export async function adminUpdateUserStatus(userId: string, newStatus: UserStatus, token?: string): Promise<void> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetch(`${baseUrl}/api/admin/users/${userId}/status?new_status=${encodeURIComponent(newStatus)}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${t}` }
  });
  if (!res.ok) throw new Error(`Update status failed: ${res.status}`);
}

export async function adminDeleteUser(userId: string, token?: string): Promise<void> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetch(`${baseUrl}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${t}` }
  });
  if (!res.ok) throw new Error(`Delete user failed: ${res.status}`);
}

// ================= STUDENT: Applications =================
export interface StudentApplication {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  status: string;
  applied_date: string;
  cover_letter?: string;
  resume_id?: string;
}

export async function fetchStudentApplications(token?: string): Promise<StudentApplication[]> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetchWithTimeout(`${baseUrl}/api/applications`, {
    headers: { 'Authorization': `Bearer ${t}` }
  }, 10000);
  if (!res.ok) throw new Error(`Applications fetch failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export interface CreateApplicationPayload {
  job_id: string;
  cover_letter?: string;
  resume_id?: string;
  ai_analysis?: any; // Recruitment analysis JSON
}

export async function createApplication(payload: CreateApplicationPayload, token?: string): Promise<StudentApplication> {
  /* logic to upload resume */
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetchWithTimeout(`${baseUrl}/api/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${t}`
    },
    body: JSON.stringify(payload)
  }, 10000);
  if (!res.ok) {
    let detail = `Application submission failed: ${res.status}`;
    try {
      const err = await res.json();
      if (err && err.detail) {
        if (Array.isArray(err.detail)) {
          detail = err.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof err.detail === 'object') {
          detail = JSON.stringify(err.detail);
        } else {
          detail = String(err.detail);
        }
      }
    } catch { }
    throw new Error(detail);
  }
  return await res.json();
}

// ================= STUDENT: Resume Upload =================
export interface ResumeUploadResponse {
  id: string;
  filename: string;
  file_path: string;
  uploaded_at: string;
}

export async function uploadResume(file: File, token?: string): Promise<ResumeUploadResponse> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetchWithTimeout(`${baseUrl}/api/resumes/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${t}` },
    body: formData
  }, 30000);
  if (!res.ok) throw new Error(`Resume upload failed: ${res.status}`);
  const data = await res.json();
  // Map backend response (resume_id) to frontend interface (id)
  return {
    id: data.resume_id || data.id,
    filename: data.file_name || data.filename,
    file_path: data.file_path || '',
    uploaded_at: data.uploaded_at || new Date().toISOString()
  };
}

export async function fetchMyResumes(token?: string): Promise<ResumeUploadResponse[]> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetchWithTimeout(`${baseUrl}/api/resumes`, {
    headers: { 'Authorization': `Bearer ${t}` }
  }, 10000);
  if (!res.ok) throw new Error(`Resumes fetch failed: ${res.status}`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : (Array.isArray(data?.resumes) ? data.resumes : []);
  return list.map((r: any) => ({
    id: r.id || r.resume_id,
    filename: r.file_name || r.filename,
    file_path: r.file_path || '',
    uploaded_at: r.uploaded_at
  }));
}

// ================= ADMIN: Analytics & Stats =================
export interface AdminUserStats {
  total_users: number;
  students: number;
  employers: number;
  admins: number;
  active_users: number;
  pending_users: number;
}

export async function adminGetUserStats(token?: string): Promise<AdminUserStats> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetchWithTimeout(`${baseUrl}/api/admin/users/stats`, {
    headers: { 'Authorization': `Bearer ${t}` }
  }, 10000);
  if (!res.ok) throw new Error(`User stats failed: ${res.status}`);
  return await res.json();
}

export interface AdminJobStats {
  total_jobs: number;
  active_jobs: number;
  closed_jobs: number;
  total_applications: number;
}

export async function adminGetJobStats(token?: string): Promise<AdminJobStats> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetchWithTimeout(`${baseUrl}/api/admin/jobs/stats`, {
    headers: { 'Authorization': `Bearer ${t}` }
  }, 10000);
  if (!res.ok) throw new Error(`Job stats failed: ${res.status}`);
  return await res.json();
}

export interface AdminAnalytics {
  daily_signups: Array<{ date: string; count: number }>;
  daily_applications: Array<{ date: string; count: number }>;
  daily_job_posts: Array<{ date: string; count: number }>;
  top_skills: Array<{ skill: string; count: number }>;
  popular_locations: Array<{ location: string; count: number }>;
}

export async function adminGetAnalytics(days: number = 30, token?: string): Promise<AdminAnalytics> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetchWithTimeout(`${baseUrl}/api/admin/analytics?days=${days}`, {
    headers: { 'Authorization': `Bearer ${t}` }
  }, 10000);
  if (!res.ok) throw new Error(`Analytics failed: ${res.status}`);
  return await res.json();
}

// ================= EMPLOYER: Dashboard Stats =================
export interface EmployerDashboardStats {
  total_jobs: number;
  active_jobs: number;
  total_applicants: number;
  new_applicants: number;
  recent_applications: Array<{
    id: string;
    applicant_name: string;
    job_title: string;
    applied_date: string;
    status: string;
  }>;
}

export async function fetchEmployerDashboardStats(token?: string): Promise<EmployerDashboardStats> {
  const t = token || getAccessToken();
  if (!t) throw new Error('No access token');
  try {
    // Fetch jobs and aggregate stats
    const jobs = await fetchEmployerJobs(t);
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.type !== 'Closed').length;

    // For now, return mock stats structure; backend can provide dedicated endpoint later
    return {
      total_jobs: totalJobs,
      active_jobs: activeJobs,
      total_applicants: 0,
      new_applicants: 0,
      recent_applications: []
    };
  } catch (e) {
    console.warn('Employer stats fallback', e);
    return {
      total_jobs: 0,
      active_jobs: 0,
      total_applicants: 0,
      new_applicants: 0,
      recent_applications: []
    };
  }
}

// ================= MAPPERS =================
function mapBackendUserToFrontend(u: any): User {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email;
  return {
    id: u.id,
    name,
    role: u.role as UserRole,
    email: u.email,
    avatarUrl: u.avatar_url || 'https://picsum.photos/seed/user/100/100',
    bio: u.bio || undefined,
    title: undefined,
    status: (u.status as UserStatus) || 'Active',
    joinedDate: (u.created_at || '').toString(),
    university: u.university || undefined,
    major: u.major || undefined,
    graduationYear: u.graduation_year || undefined,
    gpa: u.gpa || undefined,
    skills: u.skills || undefined,
    certifications: u.certifications || undefined,
    linkedinUrl: u.linkedin_url || undefined,
    githubUrl: u.github_url || undefined,
    portfolioUrl: u.portfolio_url || undefined,
    phone: u.phone || undefined,
    location: u.location || undefined,
  };
}

// ============= Interview Results API =============

export interface InterviewResultPayload {
  application_id: string;
  job_title: string;
  questions: Array<{ id: number; type: string; question: string }>;
  answers: Array<{ questionId: number; answer: string }>;
  technical_score: number;
  communication_score: number;
  confidence_level: string;
  overall_score: number;
  strengths_observed: string[];
  weaknesses_observed: string[];
  skills_to_improve: string[];
  readiness_level: string;
  question_wise_analysis: Array<{ questionId: number; performance: string; keyTakeaways: string }>;
  question_scores: Array<{ questionId: number; score: number; feedback: string }>;
  hiring_recommendation: string;
  detailed_feedback: string;
}

export async function saveInterviewResult(payload: InterviewResultPayload): Promise<any> {
  const url = `${baseUrl}/api/interviews/save`;
  const token = localStorage.getItem('access_token');

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    }, 30000);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('Failed to save interview result:', err);
    throw err;
  }
}

export async function getInterviewResult(applicationId: string): Promise<any> {
  const url = `${baseUrl}/api/interviews/${applicationId}`;
  const token = localStorage.getItem('access_token');

  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('Failed to fetch interview result:', err);
    return null;
  }
}

export async function getStudentInterviewHistory(): Promise<any[]> {
  const url = `${baseUrl}/api/interviews/student/history`;
  const token = localStorage.getItem('access_token');

  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch interview history:', err);
    return [];
  }
}

export async function getApplicantsWithInterviews(jobId: string): Promise<any[]> {
  const url = `${baseUrl}/api/interviews/applicant/${jobId}`;
  const token = localStorage.getItem('access_token');

  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch applicants with interviews:', err);
    return [];
  }
}
