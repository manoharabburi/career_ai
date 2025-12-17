import React, { useState, useEffect } from 'react';
import { MOCK_STUDENT_APPLICATIONS } from '../constants';
import { Calendar, Search, Briefcase, CheckCircle, Clock, ArrowUpRight, Loader, Award } from 'lucide-react';
import { fetchStudentApplications, StudentApplication, getStudentInterviewHistory } from '../services/api';

const ApplicationHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load applications
        const appData = await fetchStudentApplications();
        const mapped = appData.map((app: StudentApplication) => ({
          id: app.id,
          title: app.job_title,
          company: app.company_name,
          appliedDate: app.applied_date,
          status: app.status,
          logoUrl: 'https://picsum.photos/seed/' + app.company_name + '/100/100'
        }));
        setApplications(mapped.length > 0 ? mapped : MOCK_STUDENT_APPLICATIONS);

        // Load interview results
        const interviewData = await getStudentInterviewHistory();
        const interviewMap = new Map();
        interviewData.forEach((interview: any) => {
          interviewMap.set(interview.application_id, interview);
        });
        setInterviews(interviewMap);
      } catch (e) {
        console.warn('Failed to load data:', e);
        setApplications(MOCK_STUDENT_APPLICATIONS);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Reviewing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Interview': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Rejected': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Offer': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const stats = {
    total: applications.length,
    interview: applications.filter(a => a.status === 'Interview').length,
    reviewing: applications.filter(a => a.status === 'Reviewing').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-slate-600">Loading applications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header & Stats */}
      <div className="flex flex-col gap-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Application History</h1>
           <p className="text-slate-500">Track and manage your job applications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                   <Briefcase className="w-6 h-6" />
               </div>
               <div>
                   <p className="text-sm text-slate-500 font-medium">Total Applied</p>
                   <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
               </div>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                   <Clock className="w-6 h-6" />
               </div>
               <div>
                   <p className="text-sm text-slate-500 font-medium">In Review</p>
                   <h3 className="text-2xl font-bold text-slate-900">{stats.reviewing}</h3>
               </div>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                   <CheckCircle className="w-6 h-6" />
               </div>
               <div>
                   <p className="text-sm text-slate-500 font-medium">Interviews</p>
                   <h3 className="text-2xl font-bold text-slate-900">{stats.interview}</h3>
               </div>
           </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
                type="text" 
                placeholder="Search by company or role..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
         </div>
         <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
             {['All', 'Reviewing', 'Interview', 'Rejected', 'Offer'].map(status => (
                 <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                        statusFilter === status 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                 >
                    {status}
                 </button>
             ))}
         </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         {filteredApplications.length > 0 ? (
            <div className="space-y-3">
              {filteredApplications.map((app) => {
                const interview = interviews.get(app.id);
                return (
                  <div key={app.id} className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <img src={app.logoUrl} alt={app.company} className="w-12 h-12 rounded object-cover bg-white shadow-sm border border-slate-100 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{app.title}</h3>
                          <p className="text-sm text-slate-500">{app.company}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {app.appliedDate}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      {interview && (
                        <div className="flex flex-col items-end gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 flex-shrink-0">
                          <div className="flex items-center gap-1 text-blue-700">
                            <Award className="w-4 h-4" />
                            <span className="text-sm font-semibold">Interview Done</span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-900">{interview.overall_score}</p>
                            <p className="text-xs text-blue-600">{interview.readiness_level}</p>
                            <p className="text-xs text-blue-600 mt-1">{interview.hiring_recommendation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
         ) : (
             <div className="text-center py-20 px-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No applications found</h3>
                <p className="text-slate-500 mt-1">
                   {searchTerm || statusFilter !== 'All' 
                     ? "Try adjusting your filters or search terms." 
                     : "Start applying to jobs to build your history!"}
                </p>
             </div>
         )}
      </div>
    </div>
  );
};

export default ApplicationHistoryPage;
