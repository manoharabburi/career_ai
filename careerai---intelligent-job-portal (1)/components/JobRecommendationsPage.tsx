
import React, { useEffect, useState } from 'react';
import { Job, User } from '../types';
import { MOCK_JOBS } from '../constants';
import { getJobRecommendations, RecommendedJobData } from '../services/geminiService';
import JobCard from './JobCard';
import { Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface JobRecommendationsPageProps {
  user: User;
  onSelectJob: (job: Job) => void;
  onApplyWithAI?: (job: Job) => void;
  jobs?: Job[];
}

const JobRecommendationsPage: React.FC<JobRecommendationsPageProps> = ({ user, onSelectJob, onApplyWithAI, jobs }) => {
  const displayJobs = jobs || MOCK_JOBS;
  const [recommendations, setRecommendations] = useState<(Job & RecommendedJobData)[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<'score' | 'salary' | 'date'>('score');

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const aiResults = await getJobRecommendations(user, displayJobs);
        
        // Merge AI results with actual job data
        const merged: (Job & RecommendedJobData)[] = [];
        
        aiResults.forEach(res => {
          const job = displayJobs.find(j => j.id === res.jobId);
          if (job) {
            merged.push({ ...job, ...res });
          }
        });

        // If no AI results (e.g. error), fallback to showing all jobs with random low scores for demo
        if (merged.length === 0) {
            const fallback = displayJobs.map(j => ({
                ...j,
                jobId: j.id,
                matchScore: 50 + Math.floor(Math.random() * 30),
                reason: "Potential match based on your role."
            }));
            setRecommendations(fallback);
        } else {
            setRecommendations(merged);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    if (sortOption === 'score') return b.matchScore - a.matchScore;
    if (sortOption === 'salary') {
         // Rough parse for sorting
         const salaryA = parseInt(a.salaryRange.replace(/\D/g, '')) || 0;
         const salaryB = parseInt(b.salaryRange.replace(/\D/g, '')) || 0;
         return salaryB - salaryA;
    }
    // Date sort (simple string compare for mock)
    return a.postedDate.localeCompare(b.postedDate);
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-300" /> 
                AI Career Picks
            </h1>
            <p className="text-indigo-100 max-w-2xl text-lg">
                We've analyzed your profile against thousands of open positions. 
                Here are the roles where you are most likely to succeed.
            </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
         <h2 className="text-xl font-bold text-slate-900">
            Top Recommendations ({recommendations.length})
         </h2>
         
         <div className="flex items-center gap-3">
            <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <select 
                  aria-label="Sort recommendations"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="pl-9 pr-8 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer text-sm font-medium"
                >
                    <option value="score">Match Score</option>
                    <option value="salary">Highest Salary</option>
                    <option value="date">Newest</option>
                </select>
            </div>
            <button className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50" aria-label="Toggle filters">
                <SlidersHorizontal className="w-5 h-5" />
            </button>
         </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-white rounded-xl border border-slate-200 p-6 animate-pulse flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                        </div>
                    </div>
                    <div className="h-20 bg-slate-50 rounded-lg w-full"></div>
                    <div className="mt-auto h-10 bg-slate-100 rounded-lg w-full"></div>
                </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRecommendations.map(job => (
                <JobCard 
                    key={job.id} 
                    job={job} 
                    matchScore={job.matchScore}
                    aiReason={job.reason}
                    onClick={() => onSelectJob(job)} 
                    onApplyWithAI={onApplyWithAI ? () => onApplyWithAI(job) : undefined}
                />
            ))}
        </div>
      )}
    </div>
  );
};

export default JobRecommendationsPage;
