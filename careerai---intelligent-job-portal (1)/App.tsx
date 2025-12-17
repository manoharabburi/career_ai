
import { useState, useEffect } from 'react';
import { User, PageView, Job, AnalysisResult, UserRole } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import JobCard from './components/JobCard';
import JobSearchPage from './components/JobSearchPage';
import JobDetailsPage from './components/JobDetailsPage';
// import ResumeUpload from './components/ResumeUpload';
// import AIFeedback from './components/AIFeedback';
import ChatInterface from './components/ChatInterface';
import LoginPage from './components/LoginPage';
import EmployerDashboard from './components/EmployerDashboard';
import AdminDashboard from './components/AdminDashboard';
import PostJob from './components/PostJob';
import { createJob, fetchJobs, fetchEmployerJobs, fetchStudentApplications } from './services/api';
import SignupPage from './components/SignupPage';
import ApplicantsView from './components/ApplicantsView';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import ApplyJob from './components/ApplyJob';
import ApplicationHistoryPage from './components/ApplicationHistoryPage';
import JobRecommendationsPage from './components/JobRecommendationsPage';
import ResumeAnalysisPage from './components/ResumeAnalysisPage';
import AIInterviewPage from './components/AIInterviewPage';
import { analyzeResume } from './services/geminiService';
import { CheckCircle, Users, Shield, Sparkles } from 'lucide-react';

// Landing Page Component (Internal)
const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="relative min-h-screen bg-white overflow-hidden font-sans selection:bg-orange-100 selection:text-orange-900">

    {/* Background Decorations: Soft Pastel Gradient (Peach + Lavender + Blue) */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div className="absolute top-[-5%] right-[-10%] w-[700px] h-[700px] bg-orange-100/50 rounded-full blur-3xl opacity-80 mix-blend-multiply animate-pulse"></div>
      <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-3xl opacity-80 mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] left-[30%] w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl opacity-80 mix-blend-multiply"></div>
      {/* Subtle grid pattern for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-32 pb-16">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

        {/* Centered Text Content */}
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-orange-100 rounded-full shadow-sm mx-auto">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">AI-Powered Recruitment</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Find the career <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">
              you deserve.
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-slate-900 text-white text-lg font-medium rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 hover:-translate-y-1"
            >
              Get Started
            </button>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white/50 backdrop-blur-md text-slate-700 border border-slate-200 text-lg font-medium rounded-2xl hover:bg-white transition-all shadow-sm hover:shadow-md"
            >
              Post a Job
            </button>
          </div>

          <div className="pt-12 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-800"><div className="w-6 h-6 bg-slate-800 rounded-full"></div> TechFlow</div>
            <div className="flex items-center gap-2 font-bold text-lg text-slate-800"><div className="w-6 h-6 bg-slate-800 rounded-md"></div> Nexus</div>
            <div className="flex items-center gap-2 font-bold text-lg text-slate-800"><div className="w-6 h-6 bg-slate-800 rounded-sm rotate-45"></div> StartUp</div>
            <div className="flex items-center gap-2 font-bold text-lg text-slate-800"><div className="w-6 h-6 bg-slate-800 rounded-tr-xl"></div> GlobalCorp</div>
          </div>
        </div>
      </div>

      {/* Clean Features Strip */}
      <div className="mt-32">
        <p className="text-center text-slate-400 font-medium text-sm uppercase tracking-widest mb-10">Why leading companies choose us</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Users, color: "text-blue-500", bg: "bg-blue-50", title: "Smart Matching", desc: "No more endless scrolling. Our AI connects you with roles that actually fit your profile." },
            { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", title: "Resume Screening", desc: "Get instant, actionable feedback on your CV to pass Applicant Tracking Systems." },
            { icon: Shield, color: "text-purple-500", bg: "bg-purple-50", title: "Verified Employers", desc: "Apply with confidence to verified companies looking for talent like you." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-50">
              <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-6`}>
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Apply Job Success View
const ApplySuccess = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
      <CheckCircle className="w-10 h-10 text-green-600" />
    </div>
    <h2 className="text-3xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
    <p className="text-slate-500 mb-8 max-w-md text-lg">
      Your profile and resume have been sent to the employer. Good luck!
    </p>
    <button
      onClick={onBack}
      className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
    >
      Back to Jobs
    </button>
  </div>
);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<PageView>(PageView.LANDING);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<File | null>(null);
  const [isAIApplyMode, setIsAIApplyMode] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [navStack, setNavStack] = useState<PageView[]>([]);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Set<string>>(new Set());

  // All jobs visible to candidates (fetched from backend)
  const allJobs = [...jobs, ...postedJobs];

  // Helper to determine the default dashboard for a role
  const getDashboardForRole = (role: UserRole) => {
    switch (role) {
      case UserRole.STUDENT: return PageView.STUDENT_DASHBOARD;
      case UserRole.EMPLOYER: return PageView.EMPLOYER_DASHBOARD;
      case UserRole.ADMIN: return PageView.ADMIN_DASHBOARD;
      default: return PageView.LANDING;
    }
  };

  // Auth success from LoginPage / Signup
  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setNavStack([PageView.LANDING]);
    const target = getDashboardForRole(u.role);
    window.history.pushState({ page: target }, '');
    setCurrentPage(target);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage(PageView.LANDING);
    setNavStack([]);
    window.history.pushState({ page: PageView.LANDING }, '');
    setAnalysisResult(null);
    setSelectedJob(null);
    setUploadedResume(null);
    setIsAIApplyMode(false);
    setEditingJob(null);
  };

  const navigateTo = (page: PageView) => {
    if (page === currentPage) return;
    setNavStack(prev => [...prev, currentPage]);
    window.history.pushState({ page }, '');
    setCurrentPage(page);
  };

  const handleBackNavigation = (fallback?: PageView) => {
    if (navStack.length > 0) {
      window.history.back();
      return;
    }
    if (fallback) setCurrentPage(fallback);
  };

  const handleNavigation = (page: PageView) => {
    // Clear job context when navigating to main sections that shouldn't be tied to a specific job
    if ([PageView.RESUME_ANALYSIS, PageView.JOB_SEARCH, PageView.STUDENT_DASHBOARD].includes(page)) {
      setSelectedJob(null);
      setIsAIApplyMode(false);
      // Optional: Clear analysis result if navigating to analysis page to start fresh
      if (page === PageView.RESUME_ANALYSIS) setAnalysisResult(null);
    }
    navigateTo(page);
  };

  // Routing Guard
  useEffect(() => {
    window.history.replaceState({ page: PageView.LANDING }, '');
    const onPopState = (event: PopStateEvent) => {
      const statePage = (event.state as { page?: PageView } | null)?.page;
      if (statePage) {
        setNavStack(prev => prev.slice(0, Math.max(prev.length - 1, 0)));
        setCurrentPage(statePage);
      } else {
        setCurrentPage(PageView.LANDING);
        setNavStack([]);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Routing Guard
  useEffect(() => {
    // 1. If not logged in, ensure we are on public pages (Landing, Login, Signup)
    if (!user) {
      const isPublic = [PageView.LANDING, PageView.LOGIN, PageView.SIGNUP].includes(currentPage);
      if (!isPublic) {
        window.history.pushState({ page: PageView.LANDING }, '');
        setCurrentPage(PageView.LANDING);
        setNavStack([]);
      }
      return;
    }

    // 2. If logged in, redirect away from Landing/Login
    if (currentPage === PageView.LANDING || currentPage === PageView.LOGIN) {
      const target = getDashboardForRole(user.role);
      window.history.pushState({ page: target }, '');
      setCurrentPage(target);
      return;
    }

    // 3. Role-based permission check
    const allowedPages: Record<UserRole, PageView[]> = {
      [UserRole.STUDENT]: [
        PageView.STUDENT_DASHBOARD, PageView.JOB_SEARCH, PageView.JOB_DETAILS,
        PageView.APPLY_JOB, PageView.APPLICATION_HISTORY, PageView.RESUME_ANALYSIS,
        PageView.CAREER_CHAT, PageView.PROFILE, PageView.SETTINGS, PageView.JOB_RECOMMENDATIONS,
        PageView.AI_INTERVIEW
      ],
      [UserRole.EMPLOYER]: [
        PageView.EMPLOYER_DASHBOARD, PageView.POST_JOB, PageView.VIEW_APPLICANTS,
        PageView.PROFILE, PageView.SETTINGS
      ],
      [UserRole.ADMIN]: [
        PageView.ADMIN_DASHBOARD, PageView.ADMIN_USERS, PageView.SETTINGS, PageView.PROFILE
      ]
    };

    if (!allowedPages[user.role].includes(currentPage)) {
      // If user tries to access unauthorized page, send them back to their dashboard
      console.warn(`Access denied for ${user.role} to page ${currentPage}`);
      const target = getDashboardForRole(user.role);
      window.history.pushState({ page: target }, '');
      setCurrentPage(target);
    }
  }, [user, currentPage]);

  // Reset application state when page changes or job changes
  useEffect(() => {
    if (currentPage !== PageView.APPLY_JOB && currentPage !== PageView.RESUME_ANALYSIS) {
      setApplicationSubmitted(false);
      // Only clear AI mode if completely leaving the flow
      if (currentPage !== PageView.JOB_DETAILS) {
        setIsAIApplyMode(false);
      }
    }
    // Close mobile sidebar on navigation
    setShowMobileSidebar(false);
  }, [currentPage]);

  // Fetch public jobs for students
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchJobs();
        setJobs(data);
      } catch (e) {
        console.warn('Failed to fetch jobs from backend', e);
      }
    };
    // Load on first mount and whenever entering student-related pages
    if (!user || user.role === UserRole.STUDENT) {
      load();
    }
  }, [user]);

  // Fetch employer jobs when employer logs in
  useEffect(() => {
    const loadEmployer = async () => {
      try {
        const data = await fetchEmployerJobs();
        setEmployerJobs(data);
      } catch (e) {
        console.warn('Failed to fetch employer jobs', e);
      }
    };
    if (user?.role === UserRole.EMPLOYER) {
      loadEmployer();
    } else {
      setEmployerJobs([]);
    }
  }, [user]);

  // Fetch student applications
  useEffect(() => {
    const loadApps = async () => {
      try {
        const apps = await fetchStudentApplications();
        const appSet = new Set(apps.map((a: any) => a.job_id));
        setMyApplications(appSet);
      } catch (e) {
        console.warn("Failed to fetch applications", e);
      }
    };
    if (user?.role === UserRole.STUDENT) {
      loadApps();
    } else {
      setMyApplications(new Set());
    }
  }, [user, applicationSubmitted]); // Refresh when new application submitted


  const handleResumeUpload = async (base64: string, mimeType: string, _fileName: string, file: File, targetRole?: string) => {
    setUploadedResume(file);
    setIsAnalyzing(true);
    // If we have a selected job, analyze against that job.
    // Otherwise do general analysis or target role analysis.
    const description = selectedJob ? selectedJob.description + " " + selectedJob.requirements.join(", ") : undefined;

    const result = await analyzeResume(base64, mimeType, description, targetRole);
    setAnalysisResult(result);
    setIsAnalyzing(false);

    if (isAIApplyMode) {
      navigateTo(PageView.APPLY_JOB);
    }
  };

  // Render logic based on PageView
  const renderContent = () => {
    // Basic fallback if effect hasn't fired yet
    if (!user && currentPage !== PageView.LOGIN && currentPage !== PageView.SIGNUP) return <LandingPage onGetStarted={() => navigateTo(PageView.LOGIN)} />;

    switch (currentPage) {
      case PageView.LOGIN:
        return <LoginPage onLoginSuccess={handleAuthSuccess} onNavigateToSignup={() => navigateTo(PageView.SIGNUP)} />;

      case PageView.SIGNUP:
        return <SignupPage onSignupSuccess={handleAuthSuccess} onNavigateLogin={() => navigateTo(PageView.LOGIN)} />;

      case PageView.STUDENT_DASHBOARD:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name.split(' ')[0]}!</h1>
              <p className="text-slate-500">You have 3 new job matches today.</p>
            </header>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Recommended Jobs</h2>
                <button
                  onClick={() => navigateTo(PageView.JOB_RECOMMENDATIONS)}
                  className="text-indigo-600 text-sm font-medium hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {allJobs.slice(0, 2).map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => {
                      setSelectedJob(job);
                      navigateTo(PageView.JOB_DETAILS);
                    }}
                    onApplyWithAI={() => {
                      setSelectedJob(job);
                      setIsAIApplyMode(true);
                      navigateTo(PageView.RESUME_ANALYSIS);
                    }}
                  />
                ))}
              </div>
            </section>
          </div>
        );

      case PageView.EMPLOYER_DASHBOARD:
        return (
          <EmployerDashboard
            onNavigate={handleNavigation}
            jobs={employerJobs}
            onEditJob={(job) => {
              setEditingJob(job);
              navigateTo(PageView.POST_JOB);
            }}
            onViewApplicants={(job: Job) => {
              setSelectedJob(job);
              // Small delay to ensure state updates before navigation
              setTimeout(() => navigateTo(PageView.VIEW_APPLICANTS), 0);
            }}
          />
        );

      case PageView.ADMIN_DASHBOARD:
        return <AdminDashboard initialView="overview" />;

      case PageView.ADMIN_USERS:
        return <AdminDashboard initialView="users" />;

      case PageView.POST_JOB:
        return (
          <PostJob
            initialData={editingJob}
            onCancel={() => {
              setEditingJob(null);
              handleBackNavigation(PageView.EMPLOYER_DASHBOARD);
            }}
            onPost={async (jobData) => {
              if (!editingJob && jobData) {
                // Parse requirements - handle both single line and multi-line formats
                let reqArray: string[] = [];
                if (jobData.requirements) {
                  const delimiter = jobData.requirements.includes('\n') ? '\n' : ',';
                  reqArray = jobData.requirements
                    .split(delimiter)
                    .map(r => r.trim())
                    .filter(r => r && r.length > 0);
                }

                // Create job via backend
                const created = await createJob({
                  title: jobData.title,
                  description: jobData.description,
                  location: jobData.location,
                  type: jobData.type,
                  salaryRange: jobData.salaryRange,
                  companyDescription: jobData.companyDescription,
                  requirements: reqArray
                });
                setPostedJobs(prev => [created, ...prev]);
                // refresh employer list
                try {
                  const data = await fetchEmployerJobs();
                  setEmployerJobs(data);
                } catch { }
                alert('Job Posted Successfully!');
              }
              setEditingJob(null);
              handleBackNavigation(PageView.EMPLOYER_DASHBOARD);
            }}
          />
        );

      case PageView.VIEW_APPLICANTS:
        if (!selectedJob) {
          // If accessing directly from sidebar, try to default to the first job
          if (employerJobs && employerJobs.length > 0) {
            // Must delay to allow rendering to complete before state update causes re-render loop
            setTimeout(() => setSelectedJob(employerJobs[0]), 0);
            return <div className="p-8 text-center text-slate-500">Loading your job applicants...</div>;
          }

          return (
            <div className="p-12 text-center animate-in fade-in zoom-in">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Jobs Found</h3>
              <p className="text-slate-500 mb-6">Post a job first to see applicants.</p>
              <button
                onClick={() => navigateTo(PageView.POST_JOB)}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
              >
                Post a Job
              </button>
            </div>
          );
        }
        return <ApplicantsView jobId={selectedJob.id} onBack={() => handleBackNavigation(PageView.EMPLOYER_DASHBOARD)} />;

      case PageView.PROFILE:
        return user ? <ProfilePage user={user} /> : null;

      case PageView.SETTINGS:
        return <SettingsPage />;

      case PageView.JOB_SEARCH:
        return (
          <JobSearchPage
            onSelectJob={(job) => {
              setSelectedJob(job);
              setTimeout(() => navigateTo(PageView.JOB_DETAILS), 0);
            }}
            onApplyWithAI={(job) => {
              setSelectedJob(job);
              setIsAIApplyMode(true);
              setTimeout(() => navigateTo(PageView.RESUME_ANALYSIS), 0);
            }}
          />
        );

      case PageView.JOB_RECOMMENDATIONS:
        if (!user) return null;
        return (
          <JobRecommendationsPage
            user={user}
            onSelectJob={(job) => {
              setSelectedJob(job);
              navigateTo(PageView.JOB_DETAILS);
            }}
            onApplyWithAI={(job) => {
              setSelectedJob(job);
              setIsAIApplyMode(true);
              navigateTo(PageView.RESUME_ANALYSIS);
            }}
          />
        );

      case PageView.JOB_DETAILS:
        if (!selectedJob) return null;
        return (
          <JobDetailsPage
            job={selectedJob}
            isApplied={myApplications.has(selectedJob.id)}
            onBack={() => handleBackNavigation(PageView.JOB_SEARCH)}
            onApply={() => navigateTo(PageView.APPLY_JOB)}
            onApplyWithAI={() => {
              setIsAIApplyMode(true);
              navigateTo(PageView.RESUME_ANALYSIS);
            }}
            onCheckFit={() => navigateTo(PageView.RESUME_ANALYSIS)}
          />
        );

      case PageView.APPLY_JOB:
        if (!selectedJob) return null;
        if (applicationSubmitted) {
          return <ApplySuccess onBack={() => { setApplicationSubmitted(false); handleBackNavigation(PageView.JOB_SEARCH); }} />;
        }
        return (
          <ApplyJob
            job={selectedJob}
            user={user}
            isApplied={myApplications.has(selectedJob.id)}
            onCancel={() => {
              handleBackNavigation(PageView.JOB_DETAILS);
              setIsAIApplyMode(false);
            }}
            onSuccess={() => {
              setApplicationSubmitted(true);
              setIsAIApplyMode(false);
            }}
            initialResume={isAIApplyMode ? uploadedResume : null}
            analysisData={isAIApplyMode ? analysisResult : null}
          />
        );

      case PageView.APPLICATION_HISTORY:
        return <ApplicationHistoryPage />;

      case PageView.RESUME_ANALYSIS:
        return (
          <ResumeAnalysisPage
            onUpload={handleResumeUpload}
            analysisResult={analysisResult}
            isAnalyzing={isAnalyzing}
            onReset={() => setAnalysisResult(null)}
            jobTitle={selectedJob?.title}
            isApplyMode={isAIApplyMode}
            onCancelApply={() => {
              setIsAIApplyMode(false);
              handleBackNavigation(PageView.JOB_DETAILS);
            }}
          />
        );

      case PageView.CAREER_CHAT:
        return (
          <div className="h-full animate-in fade-in slide-in-from-bottom-4">
            {user && <ChatInterface user={user} />}
          </div>
        );

      case PageView.AI_INTERVIEW:
        return (
          <div className="h-full animate-in fade-in slide-in-from-bottom-4">
            <AIInterviewPage
              selectedJob={selectedJob}
              onBack={() => handleNavigation(PageView.JOB_SEARCH)}
              onSelectJob={(job) => setSelectedJob(job)}
            />
          </div>
        );

      default:
        // Default catch-all
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
      />

      <div className="flex max-w-7xl mx-auto relative">
        {user && currentPage !== PageView.LANDING && currentPage !== PageView.LOGIN && (
          <>
            {/* Desktop Sidebar */}
            <Sidebar currentPage={currentPage} onNavigate={handleNavigation} role={user.role} />

            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
              <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowMobileSidebar(false)}>
                <div className="absolute left-0 top-0 h-full w-64 bg-white z-50 animate-in slide-in-from-left-full duration-200" onClick={e => e.stopPropagation()}>
                  {/* Clone Sidebar logic for mobile, or better yet, reuse Sidebar with a className prop in future */}
                  <Sidebar currentPage={currentPage} onNavigate={handleNavigation} role={user.role} />
                </div>
              </div>
            )}
          </>
        )}

        <main className={`flex-1 p-4 md:p-8 overflow-x-hidden ${!user ? 'w-full' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
