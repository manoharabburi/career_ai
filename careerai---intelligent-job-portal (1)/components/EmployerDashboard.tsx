
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Briefcase, 
  TrendingUp, 
  MoreHorizontal, 
  MapPin, 
  Clock, 
  Edit,
  Eye,
  MessageSquare,
  Download,
  BarChart3,
  Target,
  Award,
  Filter,
  Calendar,
  DollarSign,
  Star,
  Loader
} from 'lucide-react';
import { PageView, Job } from '../types';
import { fetchEmployerDashboardStats, EmployerDashboardStats } from '../services/api';

interface EmployerDashboardProps {
  onNavigate: (page: PageView) => void;
  onEditJob: (job: Job) => void;
  onViewApplicants: (job: Job) => void;
  jobs?: Job[];
}

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onNavigate, onEditJob, onViewApplicants, jobs }) => {
  const displayJobs = jobs || [];
  const [stats, setStats] = useState<EmployerDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const data = await fetchEmployerDashboardStats();
        setStats(data);
      } catch (e) {
        console.warn('Failed to load employer stats:', e);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [jobs]);
  
  // Mock data for additional features
  const [recentApplications] = useState([
    { id: 1, candidate: 'Sarah Johnson', job: 'Senior React Developer', time: '2 mins ago', status: 'new' },
    { id: 2, candidate: 'Michael Chen', job: 'Product Manager', time: '15 mins ago', status: 'reviewed' },
    { id: 3, candidate: 'Emily Davis', job: 'UX Designer', time: '1 hour ago', status: 'new' },
    { id: 4, candidate: 'James Wilson', job: 'Senior React Developer', time: '3 hours ago', status: 'shortlisted' },
  ]);
  
  const [jobPerformance] = useState([
    { job: 'Senior React Developer', views: 324, applications: 28, conversion: 8.6 },
    { job: 'Product Manager', views: 289, applications: 15, conversion: 5.2 },
    { job: 'UX Designer', views: 256, applications: 19, conversion: 7.4 },
  ]);
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employer Dashboard</h1>
          <p className="text-slate-500">Manage your job postings and track candidate applications</p>
        </div>
        <button 
          onClick={() => onNavigate(PageView.POST_JOB)}
          className="px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Post New Job

        </button>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-blue-900 text-sm font-semibold mb-1">Active Jobs</p>
              <h3 className="text-4xl font-bold text-blue-900">{loadingStats ? <Loader className="w-8 h-8 animate-spin" /> : (stats?.active_jobs || displayJobs.length)}</h3>
            </div>
            <div className="p-2 bg-blue-200 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <p className="text-xs text-blue-700">Total: {stats?.total_jobs || displayJobs.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-2xl border border-green-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-green-900 text-sm font-semibold mb-1">Total Applicants</p>
              <h3 className="text-4xl font-bold text-green-900">{loadingStats ? <Loader className="w-8 h-8 animate-spin" /> : (stats?.total_applicants || 0)}</h3>
            </div>
            <div className="p-2 bg-green-200 rounded-lg">
              <Users className="w-5 h-5 text-green-700" />
            </div>
          </div>
          <p className="text-xs text-green-700">{stats?.new_applicants || 0} new this week</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-purple-900 text-sm font-semibold mb-1">Profile Views</p>
              <h3 className="text-4xl font-bold text-purple-900">1.2k</h3>
            </div>
            <div className="p-2 bg-purple-200 rounded-lg">
              <Eye className="w-5 h-5 text-purple-700" />
            </div>
          </div>
          <p className="text-xs text-purple-700">+15% from last month</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-orange-900 text-sm font-semibold mb-1">Avg. Response Time</p>
              <h3 className="text-4xl font-bold text-orange-900">2.3</h3>
            </div>
            <div className="p-2 bg-orange-200 rounded-lg">
              <Clock className="w-5 h-5 text-orange-700" />
            </div>
          </div>
          <p className="text-xs text-orange-700">days to review</p>
        </div>
      </div>

      {/* Analytics & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Performance Analytics */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Job Performance Analytics</h3>
              <p className="text-sm text-slate-500">Views vs Applications conversion rate</p>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors" title="Export Report">
              <Download className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          
          <div className="space-y-4">
            {jobPerformance.map((item, index) => (
              <div key={index} className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{item.job}</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    item.conversion >= 8 ? 'bg-green-100 text-green-700' :
                    item.conversion >= 6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.conversion}% conversion
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-slate-500">Views</p>
                      <p className="text-lg font-bold text-slate-900">{item.views}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-slate-500">Applications</p>
                      <p className="text-lg font-bold text-slate-900">{item.applications}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-slate-500">Growth</p>
                      <p className="text-lg font-bold text-green-600">+{Math.round(item.conversion * 2)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BarChart3 className="w-4 h-4" />
              <span>Average conversion rate: <strong className="text-slate-900">7.1%</strong></span>
            </div>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
              View Full Report
            </button>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Applications</h3>
              <p className="text-sm text-slate-500">Latest candidate submissions</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div key={app.id} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{app.candidate}</p>
                    <p className="text-xs text-slate-500 truncate">{app.job}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                    app.status === 'new' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'reviewed' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {app.time}
                  </span>
                  <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    Review →
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            View All Applications
          </button>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group">
            <MessageSquare className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-slate-900">Message Candidates</p>
            <p className="text-xs text-slate-500 mt-1">Bulk communication</p>
          </button>
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all group">
            <Download className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-slate-900">Export Applicants</p>
            <p className="text-xs text-slate-500 mt-1">Download CSV</p>
          </button>
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group">
            <Calendar className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-slate-900">Schedule Interviews</p>
            <p className="text-xs text-slate-500 mt-1">Calendar integration</p>
          </button>
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all group">
            <Award className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-slate-900">Premium Boost</p>
            <p className="text-xs text-slate-500 mt-1">Promote jobs</p>
          </button>
        </div>
      </div>

      {/* Applicant Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hiring Pipeline</h3>
            <p className="text-sm text-slate-500">Track candidates through your hiring process</p>
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
            Customize Stages
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-blue-900">New</p>
              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-900">12</span>
              </div>
            </div>
            <p className="text-xs text-blue-700">Awaiting review</p>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-yellow-900">Screening</p>
              <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-yellow-900">8</span>
              </div>
            </div>
            <p className="text-xs text-yellow-700">Under review</p>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-purple-900">Interview</p>
              <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-900">5</span>
              </div>
            </div>
            <p className="text-xs text-purple-700">Scheduled</p>
          </div>
          
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-orange-900">Offer</p>
              <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-orange-900">2</span>
              </div>
            </div>
            <p className="text-xs text-orange-700">Pending decision</p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-green-900">Hired</p>
              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-900">4</span>
              </div>
            </div>
            <p className="text-xs text-green-700">This month</p>
          </div>
        </div>
      </div>

      {/* Job Postings Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-lg">Your Posted Jobs</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {displayJobs.map((job) => (
            <div key={job.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide">Active</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        {job.type}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Posted {job.postedDate}
                    </div>
                </div>
              </div>
              
              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className="flex items-center gap-1.5 text-slate-900">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span className="text-xl font-bold">{job.applicantCount || 0}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Applicants</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => onEditJob(job)}
                        className="px-3 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all text-sm shadow-sm flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={() => onViewApplicants(job)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all text-sm shadow-sm"
                    >
                        Manage Candidates
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="More actions" aria-label="More actions">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {displayJobs.length === 0 && (
            <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No jobs posted yet</h3>
                <p className="text-slate-500 mt-1 mb-6">Create your first job posting to start finding candidates.</p>
                <button 
                  onClick={() => onNavigate(PageView.POST_JOB)}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                >
                  Post a Job
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
