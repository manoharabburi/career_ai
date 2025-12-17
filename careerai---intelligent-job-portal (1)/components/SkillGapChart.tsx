import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface SkillGapChartProps {
  score: number;
  strengths: string[];
  missingSkills: string[];
}

const SkillGapChart: React.FC<SkillGapChartProps> = ({ score, strengths, missingSkills }) => {
  // Synthesize data for the chart based on props
  const data = [
    { subject: 'Technical', A: score, fullMark: 100 },
    { subject: 'Experience', A: Math.min(score + 10, 100), fullMark: 100 },
    { subject: 'Soft Skills', A: 85, fullMark: 100 },
    { subject: 'Relevance', A: score - 5, fullMark: 100 },
    { subject: 'Education', A: 90, fullMark: 100 },
  ];

  const strengthsCount = strengths.length;
  const gapsCount = missingSkills.length;

  return (
    <div className="w-full h-80 bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center">
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Match Analysis</h4>
      <div className="relative w-full h-full">
         <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Your Profile"
              dataKey="A"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.5}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-bold text-indigo-700 drop-shadow-sm">{score}%</span>
          <span className="text-xs text-slate-500">{strengthsCount} strengths · {gapsCount} gaps</span>
        </div>
      </div>
    </div>
  );
};

export default SkillGapChart;