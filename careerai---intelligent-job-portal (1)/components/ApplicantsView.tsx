
import React, { useEffect, useState } from 'react';
import { ArrowLeft, MoreHorizontal, Download, Mail, Filter, Trash2, ChevronDown, ArrowUpDown, CheckCircle, X, Award } from 'lucide-react';
import { Applicant } from '../types';
import { fetchJobApplicants, getApplicantsWithInterviews } from '../services/api';

interface ApplicantsViewProps {
  onBack: () => void;
  jobId: string;
}

const ApplicantsView: React.FC<ApplicantsViewProps> = ({ onBack, jobId }) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [interviews, setInterviews] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Applicant['status'] | 'All'>('All');
  const [sortOption, setSortOption] = useState<string>('match');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemoveApplicant = (id: string) => {
    if (window.confirm('Are you sure you want to remove this applicant? This action cannot be undone.')) {
      setApplicants(prev => prev.filter(app => app.id !== id));
      showToast('Applicant removed successfully', 'info');
    }
  };

  const handleStatusUpdate = (id: string, newStatus: Applicant['status']) => {
    setApplicants(prev => prev.map(app =>
      app.id === id ? { ...app, status: newStatus } : app
    ));
    showToast(`Status updated to ${newStatus}`);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchJobApplicants(jobId);
        const interviewData = await getApplicantsWithInterviews(jobId);

        if (!mounted) return;

        // Create interview map
        const interviewMap = new Map();
        interviewData.forEach((interview: any) => {
          interviewMap.set(interview.application_id, interview);
        });
        setInterviews(interviewMap);

        if (items && items.length > 0) {
          // Map API -> UI Applicant
          const mapped: Applicant[] = items.map(a => ({
            id: a.id,
            name: a.name,
            email: a.email,
            avatarUrl: a.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=random`,
            appliedDate: a.applied_date,
            matchScore: a.match_score || 0,
            status: (a.status as Applicant['status']) || 'New',
          }));
          setApplicants(mapped);
        } else {
          // Fallback to demo data when no API data
          const demoApplicants: Applicant[] = [
            {
              id: '1',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@email.com',
              avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1',
              appliedDate: '2 days ago',
              matchScore: 92,
              status: 'New',
            },
            {
              id: '2',
              name: 'Michael Chen',
              email: 'michael.chen@email.com',
              avatarUrl: 'https://ui-avatars.com/api/?name=Michael+Chen&background=8b5cf6',
              appliedDate: '3 days ago',
              matchScore: 88,
              status: 'Reviewing',
            },
            {
              id: '3',
              name: 'Emily Rodriguez',
              email: 'emily.r@email.com',
              avatarUrl: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=ec4899',
              appliedDate: '5 days ago',
              matchScore: 85,
              status: 'Interview',
            },
            {
              id: '4',
              name: 'David Kim',
              email: 'david.kim@email.com',
              avatarUrl: 'https://ui-avatars.com/api/?name=David+Kim&background=10b981',
              appliedDate: '1 week ago',
              matchScore: 78,
              status: 'Reviewing',
            },
            {
              id: '5',
              name: 'Jessica Martinez',
              email: 'jessica.m@email.com',
              avatarUrl: 'https://ui-avatars.com/api/?name=Jessica+Martinez&background=f59e0b',
              appliedDate: '1 week ago',
              matchScore: 82,
              status: 'New',
            },
            {
              id: '6',
              name: 'Ryan Thompson',
              email: 'ryan.thompson@email.com',
              avatarUrl: 'https://ui-avatars.com/api/?name=Ryan+Thompson&background=3b82f6',
              appliedDate: '2 weeks ago',
              matchScore: 75,
              status: 'Interview',
            },
            {
              id: '7',
              name: 'Amanda Lee',
              email: 'amanda.lee@email.com',
              avatarUrl: 'https://ui-avatars.com/api/?name=Amanda+Lee&background=ef4444',
              appliedDate: '2 weeks ago',
              matchScore: 68,
              status: 'Rejected',
            },
            {
              id: '8',
              name: 'Christopher Brown',
              email: 'chris.brown@email.com',
              avatarUrl: 'https://ui-avatars.com/api/?name=Christopher+Brown&background=14b8a6',
              appliedDate: '3 weeks ago',
              matchScore: 90,
              status: 'Interview',
            },
          ];
          setApplicants(demoApplicants);
        }
      } catch (e: any) {
        // Log detailed error
        console.error('Applicants fetch failed:', e);
        setError(e.message || 'Failed to load applicants');

        // On error, show demo data instead of error message
        console.warn('Using demo data fallback');
        const demoApplicants: Applicant[] = [
          {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1',
            appliedDate: '2 days ago',
            matchScore: 92,
            status: 'New',
          },
          {
            id: '2',
            name: 'Michael Chen',
            email: 'michael.chen@email.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Michael+Chen&background=8b5cf6',
            appliedDate: '3 days ago',
            matchScore: 88,
            status: 'Reviewing',
          },
          {
            id: '3',
            name: 'Emily Rodriguez',
            email: 'emily.r@email.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=ec4899',
            appliedDate: '5 days ago',
            matchScore: 85,
            status: 'Interview',
          },
          {
            id: '4',
            name: 'David Kim',
            email: 'david.kim@email.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=David+Kim&background=10b981',
            appliedDate: '1 week ago',
            matchScore: 78,
            status: 'Reviewing',
          },
          {
            id: '5',
            name: 'Jessica Martinez',
            email: 'jessica.m@email.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Jessica+Martinez&background=f59e0b',
            appliedDate: '1 week ago',
            matchScore: 82,
            status: 'New',
          },
          {
            id: '6',
            name: 'Ryan Thompson',
            email: 'ryan.thompson@email.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Ryan+Thompson&background=3b82f6',
            appliedDate: '2 weeks ago',
            matchScore: 75,
            status: 'Interview',
          },
          {
            id: '7',
            name: 'Amanda Lee',
            email: 'amanda.lee@email.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Amanda+Lee&background=ef4444',
            appliedDate: '2 weeks ago',
            matchScore: 68,
            status: 'Rejected',
          },
          {
            id: '8',
            name: 'Christopher Brown',
            email: 'chris.brown@email.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Christopher+Brown&background=14b8a6',
            appliedDate: '3 weeks ago',
            matchScore: 90,
            status: 'Interview',
          },
        ];
        setApplicants(demoApplicants);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [jobId]);

  // Calculate counts for the dropdown
  const counts = {
    All: applicants.length,
    New: applicants.filter(a => a.status === 'New').length,
    Reviewing: applicants.filter(a => a.status === 'Reviewing').length,
    Interview: applicants.filter(a => a.status === 'Interview').length,
    Rejected: applicants.filter(a => a.status === 'Rejected').length,
  };

  const filteredApplicants = applicants.filter(app =>
    statusFilter === 'All' ? true : app.status === statusFilter
  );

  const getStatusWeight = (status: string) => {
    switch (status) {
      case 'New': return 0;
      case 'Reviewing': return 1;
      case 'Interview': return 2;
      case 'Rejected': return 3;
      default: return 4;
    }
  };

  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    if (sortOption === 'match') {
      return b.matchScore - a.matchScore;
    } else if (sortOption === 'status') {
      return getStatusWeight(a.status) - getStatusWeight(b.status);
    } else if (sortOption === 'date') {
      // Simple string comparison for mock dates, ideally use timestamps
      return a.appliedDate.localeCompare(b.appliedDate);
    }
    return 0;
  });

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'Reviewing': return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'Interview': return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
      case 'Rejected': return 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 relative">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
          <p className="text-slate-500">Managing <span className="font-semibold text-slate-700">{applicants.length} candidate{applicants.length !== 1 ? 's' : ''}</span></p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              aria-label="Sort applicants"
            >
              <option value="match">Sort: Match Score</option>
              <option value="status">Sort: Status</option>
              <option value="date">Sort: Date Applied</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Applicant['status'] | 'All')}
              className="pl-9 pr-8 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              aria-label="Filter applicants by status"
            >
              <option value="All">All Status ({counts.All})</option>
              <option value="New">New ({counts.New})</option>
              <option value="Reviewing">Reviewing ({counts.Reviewing})</option>
              <option value="Interview">Interview ({counts.Interview})</option>
              <option value="Rejected">Rejected ({counts.Rejected})</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && (
          <div className="p-6 text-center text-slate-500">Loading applicants…</div>
        )}
        {error && !loading && (
          <div className="p-6 text-center text-red-600">{error}</div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Candidate</th>
              <th className="px-6 py-4">Applied</th>
              <th className="px-6 py-4">AI Match Score</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedApplicants.length > 0 ? (
              sortedApplicants.map((app) => {
                const interview = interviews.get(app.id);
                return (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={app.avatarUrl} alt={app.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-medium text-slate-900">{app.name}</p>
                          <p className="text-sm text-slate-500">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{app.appliedDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[80px] h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${app.matchScore > 80 ? 'bg-green-500' : app.matchScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${app.matchScore}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{app.matchScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative inline-block group">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusUpdate(app.id, e.target.value as Applicant['status'])}
                            className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-all ${getStatusColorClass(app.status)}`}
                            aria-label={`Change status for ${app.name}`}
                          >
                            <option value="New">New</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Interview">Interview</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />
                        </div>
                        {interview && (
                          <div className="bg-blue-50 px-2 py-1 rounded text-xs font-semibold text-blue-700 flex items-center gap-1 whitespace-nowrap">
                            <Award className="w-3 h-3" />
                            {interview.overall_score}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Email Candidate">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="More Options">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveApplicant(app.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Remove Applicant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No applicants found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 animate-in slide-in-from-bottom-4 fade-in duration-300 z-50">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-slate-400" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsView;
