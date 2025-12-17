
import React from 'react';
import { Job } from '../types';
import { ArrowLeft, Building, Sparkles, Brain, MapPin, Globe, Clock, DollarSign, Building2, Users, CheckCircle } from 'lucide-react';

interface JobDetailsPageProps {
    job: Job;
    isApplied?: boolean;
    onBack: () => void;
    onApply: () => void;
    onApplyWithAI: () => void;
    onCheckFit: () => void;
}

const JobDetailsPage: React.FC<JobDetailsPageProps> = ({
    job,
    isApplied = false,
    onBack,
    onApply,
    onApplyWithAI,
    onCheckFit
}) => {
    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-2 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to jobs
            </button>

            {/* Header Section - Full Width with Logo */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 rounded-xl border border-slate-100 shadow-sm bg-white p-2 flex-shrink-0 flex items-center justify-center">
                            <img src={job.logoUrl} className="max-w-full max-h-full object-contain" alt={`${job.company} logo`} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5"><Building className="w-4 h-4 text-indigo-500" /> {job.company}</span>
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-500" /> {job.location}</span>
                                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide border border-indigo-100">{job.type}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-left md:text-right flex flex-row md:flex-col gap-4 md:gap-1 items-center md:items-end w-full md:w-auto border-t md:border-0 border-slate-100 pt-4 md:pt-0 pl-2 md:pl-0">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold text-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            {job.salaryRange}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Clock className="w-4 h-4" />
                            Posted {job.postedDate}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Job Description (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">About the Role</h3>
                        <div className="prose prose-slate prose-lg max-w-none text-slate-600 mb-8 leading-relaxed">
                            <p>{job.description}</p>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Requirements</h3>
                        <ul className="space-y-3 mb-10">
                            {job.requirements.map((r, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></span>
                                    <span className="font-medium">{r}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Company Description Section */}
                        <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">About {job.company}</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                                {job.companyDescription || `${job.company} is a leading innovator in their field, committed to excellence and driving change through technology. We prioritize employee growth and a balanced work culture.`}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={onApply}
                                    disabled={isApplied}
                                    className={`flex-1 py-4 font-bold rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 ${isApplied
                                        ? 'bg-green-100 text-green-700 shadow-none cursor-not-allowed border border-green-200'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isApplied ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Applied
                                        </>
                                    ) : (
                                        'Apply Now'
                                    )}
                                </button>
                                <button
                                    onClick={onApplyWithAI}
                                    disabled={isApplied}
                                    title="Analyze your resume and auto-fill the application"
                                    className={`flex-1 py-4 font-bold rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 group ${isApplied
                                        ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-purple-100 hover:shadow-purple-200 hover:-translate-y-0.5'
                                        }`}
                                >
                                    <Sparkles className={`w-5 h-5 ${!isApplied && 'group-hover:animate-pulse'}`} />
                                    Apply with AI Analysis
                                </button>
                            </div>
                            <button
                                onClick={onCheckFit}
                                className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex justify-center items-center gap-2"
                            >
                                <Brain className="w-5 h-5 text-slate-500" />
                                Check Fit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Company Quick Info (1/3 width) */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-500" /> Company Overview
                        </h4>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                                <span className="text-slate-500 font-medium">Industry</span>
                                <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">Technology</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                                <span className="text-slate-500 font-medium">Employees</span>
                                <span className="font-semibold text-slate-900 flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5 text-slate-400" /> 100-500
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                                <span className="text-slate-500 font-medium">Headquarters</span>
                                <span className="font-semibold text-slate-900">{job.location.split(',')[0]}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2">
                                <span className="text-slate-500 font-medium">Website</span>
                                <a href="#" className="text-indigo-600 hover:underline font-medium">
                                    {job.company.toLowerCase().replace(/\s/g, '')}.com
                                </a>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <button className="w-full py-2.5 bg-slate-50 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-sm">
                                View Company Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailsPage;
