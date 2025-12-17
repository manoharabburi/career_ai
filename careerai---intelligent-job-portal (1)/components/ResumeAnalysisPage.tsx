
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import ResumeUpload from './ResumeUpload';
import AIFeedback from './AIFeedback';
import { ArrowLeft, FileText, BarChart, Zap, Target, X, Briefcase, Building2 } from 'lucide-react';

interface ResumeAnalysisPageProps {
  onUpload: (base64: string, mimeType: string, fileName: string, file: File, targetRole?: string) => void;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  onReset: () => void;
  jobTitle?: string;
  isApplyMode?: boolean;
  onCancelApply?: () => void;
}

const SUGGESTIONS = {
  Roles: ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer", "Sales Rep"],
  Industries: ["Technology", "Finance", "Healthcare", "E-commerce", "Marketing"]
};

const ResumeAnalysisPage: React.FC<ResumeAnalysisPageProps> = ({ 
  onUpload, 
  analysisResult, 
  isAnalyzing, 
  onReset,
  jobTitle,
  isApplyMode = false,
  onCancelApply
}) => {
  const [targetRole, setTargetRole] = useState('');

  const handleUploadWrapper = (base64: string, mimeType: string, fileName: string, file: File) => {
      onUpload(base64, mimeType, fileName, file, targetRole);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
             {isApplyMode ? 'Resume Screening' : 'AI Resume Analysis'}
          </h1>
          {jobTitle ? (
             <div className="flex items-center gap-2 mt-2">
                <span className="text-slate-500 text-sm">Targeting:</span>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold border border-indigo-100 flex items-center gap-1.5">
                   <Target className="w-3.5 h-3.5" />
                   {jobTitle}
                </span>
             </div>
          ) : (
             <p className="text-slate-500 mt-1">
                Upload your resume to get instant, actionable feedback powered by Gemini.
             </p>
          )}
        </div>
        {analysisResult && !isApplyMode && (
           <button 
             onClick={() => {
                 setTargetRole('');
                 onReset();
             }}
             className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
           >
             <FileText className="w-4 h-4" /> Analyze Another
           </button>
        )}
      </div>

      {!analysisResult ? (
         <div className="max-w-xl mx-auto mt-8">
            {!isApplyMode && !jobTitle && (
                <div className="mb-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-500" />
                        Target Job Title / Industry <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g. Product Manager, Finance, Tech Industry"
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm pr-10"
                            disabled={isAnalyzing}
                        />
                        {targetRole && !isAnalyzing && (
                            <button 
                                onClick={() => setTargetRole('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                           <Briefcase className="w-3 h-3" /> Popular Roles
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {SUGGESTIONS.Roles.map((role) => (
                            <button
                              key={role}
                              onClick={() => setTargetRole(role)}
                              disabled={isAnalyzing}
                              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                targetRole === role 
                                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200 font-medium' 
                                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                           <Building2 className="w-3 h-3" /> Industries
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {SUGGESTIONS.Industries.map((ind) => (
                            <button
                              key={ind}
                              onClick={() => setTargetRole(ind)}
                              disabled={isAnalyzing}
                              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                targetRole === ind 
                                  ? 'bg-purple-100 text-purple-700 border-purple-200 font-medium' 
                                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                              }`}
                            >
                              {ind}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-4 flex items-start gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Zap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                        <span>Specify a role or industry to tailor the AI analysis. Leaving this blank results in a general evaluation.</span>
                    </p>
                </div>
            )}

            <ResumeUpload onUploadComplete={handleUploadWrapper} isAnalyzing={isAnalyzing} />
            
            {isApplyMode && onCancelApply && (
                <button 
                    onClick={onCancelApply}
                    className="mt-8 mx-auto flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Cancel Application
                </button>
            )}

            {!isApplyMode && (
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-slate-900">ATS Check</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">See how well your resume parses for tracking systems.</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <BarChart className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-slate-900">Skill Gap Analysis</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">Identify missing skills compared to industry standards.</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-slate-900">Actionable Tips</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">Get specific advice on how to improve your CV.</p>
                    </div>
                </div>
            )}
         </div>
      ) : (
         <AIFeedback result={analysisResult} />
      )}
    </div>
  );
};

export default ResumeAnalysisPage;
