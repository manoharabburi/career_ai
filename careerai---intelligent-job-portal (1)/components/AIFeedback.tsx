
import React from 'react';
import { AnalysisResult } from '../types';
import { Check, X, BookOpen, Lightbulb, Target } from 'lucide-react';
import SkillGapChart from './SkillGapChart';

interface AIFeedbackProps {
  result: AnalysisResult;
}

const AIFeedback: React.FC<AIFeedbackProps> = ({ result }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {result.analyzedRole && (
         <div className="bg-indigo-900 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg">
             <div className="p-2 bg-white/20 rounded-lg">
                <Target className="w-5 h-5 text-indigo-100" />
             </div>
             <div>
                 <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Analysis Context</p>
                 <h3 className="font-bold text-lg">{result.analyzedRole}</h3>
             </div>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score and Chart */}
        <div className="md:col-span-1">
          <SkillGapChart 
            score={result.matchScore} 
            strengths={result.strengths} 
            missingSkills={result.missingSkills} 
          />
        </div>

        {/* Text Analysis */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl">
             <div className="flex items-start gap-3">
               <Lightbulb className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
               <div>
                 <h3 className="font-semibold text-indigo-900 mb-1">AI Recommendation</h3>
                 <p className="text-indigo-800 text-sm leading-relaxed">{result.recommendation}</p>
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-xl border border-slate-200">
               <h4 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
                 <div className="p-1 bg-green-100 rounded-full"><Check className="w-4 h-4" /></div>
                 Strengths
               </h4>
               <ul className="space-y-2">
                 {result.strengths.map((s, i) => (
                   <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                     <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></span>
                     {s}
                   </li>
                 ))}
               </ul>
             </div>

             <div className="bg-white p-5 rounded-xl border border-slate-200">
               <h4 className="flex items-center gap-2 font-semibold text-red-600 mb-3">
                 <div className="p-1 bg-red-100 rounded-full"><X className="w-4 h-4" /></div>
                 Gap Analysis
               </h4>
               <ul className="space-y-2">
                 {result.missingSkills.map((s, i) => (
                   <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                     <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></span>
                     {s}
                   </li>
                 ))}
               </ul>
             </div>
           </div>

           <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
              <h4 className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                 <BookOpen className="w-5 h-5 text-slate-500" />
                 Suggested Career Path
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {result.careerPathAdvice}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeedback;
