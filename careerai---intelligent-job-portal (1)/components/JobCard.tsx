
import React from 'react';
import { Job } from '../types';
import { MapPin, Clock, DollarSign, Building, Sparkles } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: () => void;
  onApplyWithAI?: () => void;
  isCompact?: boolean;
  matchScore?: number;
  aiReason?: string;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick, onApplyWithAI, isCompact = false, matchScore, aiReason }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border overflow-hidden transition-all cursor-pointer flex flex-col group h-full relative ${
        matchScore && matchScore > 85 ? 'border-indigo-200 shadow-md shadow-indigo-50 hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-300' : 'border-slate-200 hover:shadow-lg hover:border-indigo-200'
      }`}
    >
      {matchScore && (
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl z-10 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {matchScore}% Match
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex justify-between items-start">
            <div className="flex gap-4">
            <img 
                src={job.logoUrl} 
                alt={job.company} 
                className="w-12 h-12 rounded-lg object-cover border border-slate-100 shadow-sm bg-white"
            />
            <div>
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-lg leading-tight pr-12">
                {job.title}
                </h3>
                <div className="flex items-center gap-1 text-slate-500 text-sm mt-0.5">
                <Building className="w-3.5 h-3.5" />
                {job.company}
                </div>
            </div>
            </div>
            {!isCompact && !matchScore && (
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">
                {job.type}
            </span>
            )}
        </div>

        {aiReason && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800 leading-relaxed relative">
             <div className="absolute -top-1.5 left-4 w-3 h-3 bg-indigo-50 border-t border-l border-indigo-100 transform rotate-45"></div>
             <span className="font-bold mr-1">AI Insight:</span> {aiReason}
          </div>
        )}

        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            {job.location}
            </div>
            <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-slate-400" />
            {job.salaryRange}
            </div>
            <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            {job.postedDate}
            </div>
        </div>

        {!isCompact && (
            <div className="mt-auto">
            <div className="flex flex-wrap gap-2 mt-2 mb-4 relative z-10">
                {job.requirements.slice(0, 2).map((req, i) => (
                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                    {req}
                </span>
                ))}
                {job.requirements.length > 2 && (
                <div className="relative group/tooltip">
                    <span className="px-2 py-1 bg-slate-50 text-slate-400 text-xs rounded-md cursor-help border border-transparent hover:border-slate-200 transition-colors">
                        +{job.requirements.length - 2} more
                    </span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none">
                        <p className="font-bold mb-1.5 text-slate-200 border-b border-slate-700 pb-1">All Requirements</p>
                        <ul className="space-y-1">
                            {job.requirements.map((req, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                   <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
                                   <span className="text-slate-300 leading-relaxed">{req}</span>
                                </li>
                            ))}
                        </ul>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                </div>
                )}
            </div>
            <div className="flex gap-3">
                <button className={`flex-1 py-2 border rounded-lg font-medium transition-all text-sm ${matchScore ? 'bg-indigo-600 text-white hover:bg-indigo-700 border-transparent shadow-md shadow-indigo-100' : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}>
                    {matchScore ? 'Apply Now' : 'View Details'}
                </button>
                {onApplyWithAI && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onApplyWithAI();
                        }}
                        className="px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-medium hover:from-purple-200 hover:to-indigo-200 transition-all shadow-sm flex items-center justify-center gap-2 group"
                        title="Apply with AI Analysis"
                    >
                        <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform text-indigo-600" />
                        <span className="hidden sm:inline text-xs font-bold">AI Apply</span>
                    </button>
                )}
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
