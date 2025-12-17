
import React, { useState, useRef, useEffect } from 'react';
import { Job, AnalysisResult, User } from '../types';
import { UploadCloud, X, AlertCircle, Loader2, FileText, Trash2, Sparkles, CheckCircle } from 'lucide-react';
import { analyzeResumeForJob, RecruitmentAnalysisResult } from '../services/geminiService';
import { createApplication, uploadResume } from '../services/api';

interface ApplyJobProps {
  job: Job;
  onCancel: () => void;
  onSuccess: () => void;
  initialResume?: File | null;
  analysisData?: AnalysisResult | null;
  user?: User | null;
  isApplied?: boolean;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
  resume: File | null;
  linkedin: string;
}

const ApplyJob: React.FC<ApplyJobProps> = ({ job, onCancel, onSuccess, initialResume, analysisData, user, isApplied = false }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    coverLetter: '',
    resume: initialResume || null,
    linkedin: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<RecruitmentAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isApplied) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Already Applied!</h2>
        <p className="text-slate-500 mb-8 max-w-md text-lg">
          You have already submitted an application for the <strong>{job.title}</strong> position at {job.company}.
        </p>
        <button
          onClick={onCancel}
          className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Back to Job Details
        </button>
      </div>
    );
  }

  // Auto-generate content if analysis data is present
  useEffect(() => {
    if (analysisData && !formData.coverLetter) {
      const strengths = analysisData.strengths.slice(0, 3).join(', ');
      const generatedLetter = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${job.title} position at ${job.company}.\n\nBased on your job description, I believe my background aligns well with the requirements. My key strengths include ${strengths}, which I would love to bring to your team.\n\nThank you for considering my application.\n\nSincerely,\n${user?.name || '[Your Name]'}`;
      setFormData(prev => ({ ...prev, coverLetter: generatedLetter }));

      // Clear potential errors if auto-fill fixes length requirements
      if (generatedLetter.length >= 50) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.coverLetter;
          return newErrors;
        });
      }
    }
  }, [analysisData, job, formData.coverLetter, user]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'fullName':
        return !value.trim() ? "Full Name is required" : "";
      case 'email':
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email address";
        return "";
      case 'phone':
        return !value.trim() ? "Phone number is required" : "";
      case 'coverLetter':
        if (!value.trim()) return "Cover letter is required";
        if (value.length < 50) return `Cover letter must be at least 50 characters (${value.length}/50)`;
        return "";
      case 'resume':
        return !value ? "Please upload your resume" : "";
      case 'linkedin':
        // Optional field, but if provided, must look like a URL
        if (value && !/^(https?:\/\/)?([\w]+\.)?linkedin\.com\/.+/i.test(value)) {
          return "Please enter a valid LinkedIn profile URL";
        }
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Basic size validation (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, resume: "File size must be less than 5MB" }));
        return;
      }

      setFormData(prev => ({ ...prev, resume: file }));

      // Clear error if valid
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.resume;
        return newErrors;
      });

      // Trigger AI analysis automatically
      setIsAnalyzing(true);
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target?.result) {
            const base64 = (event.target.result as string).split(',')[1];
            const analysis = await analyzeResumeForJob(
              base64,
              file.type,
              job.title,
              job.description,
              job.requirements
            );
            setAiAnalysisResult(analysis);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('AI analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields on submit
    const newErrors: Record<string, string> = {};
    const fieldsToValidate = ['fullName', 'email', 'phone', 'coverLetter', 'linkedin'];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, (formData as any)[field]);
      if (error) newErrors[field] = error;
    });

    const resumeError = validateField('resume', formData.resume);
    if (resumeError) newErrors.resume = resumeError;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload resume first if present
      let resumeId: string | undefined;
      if (formData.resume) {
        const uploadResult = await uploadResume(formData.resume);
        resumeId = uploadResult.id;
      }

      // Submit application with AI analysis
      await createApplication({
        job_id: job.id,
        cover_letter: formData.coverLetter,
        resume_id: resumeId,
        ai_analysis: aiAnalysisResult ? JSON.stringify(aiAnalysisResult) : undefined
      });

      setIsSubmitting(false);
      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to submit application. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      {analysisData && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-indigo-900 text-sm">AI Enhanced Application</h4>
            <p className="text-sm text-indigo-700">We've pre-filled your application based on your profile and skills analysis.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Apply for {job.title}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
              <span className="font-medium text-slate-700">{job.company}</span>
              <span>•</span>
              <span>{job.location}</span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.fullName ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-indigo-500'} focus:ring-2 focus:outline-none transition-all`}
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-indigo-500'} focus:ring-2 focus:outline-none transition-all`}
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-indigo-500'} focus:ring-2 focus:outline-none transition-all`}
                  placeholder="+1 (555) 000-0000"
                  disabled={isSubmitting}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.linkedin ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-indigo-500'} focus:ring-2 focus:outline-none transition-all`}
                  placeholder="https://linkedin.com/in/johndoe"
                  disabled={isSubmitting}
                />
                {errors.linkedin && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.linkedin}</p>}
              </div>
            </div>
          </div>

          {/* Resume Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Resume <span className="text-red-500">*</span></h3>

            {!formData.resume ? (
              <div
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${errors.resume ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-500">PDF, DOCX up to 5MB</p>
                  </div>
                </div>
                {errors.resume && <p className="mt-3 text-sm text-red-600 font-medium flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.resume}</p>}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-indigo-100">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{formData.resume.name}</p>
                    <p className="text-xs text-slate-500">{(formData.resume.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, resume: null }))}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Cover Letter Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Cover Letter <span className="text-red-500">*</span></h3>
            <div>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                onBlur={handleBlur}
                rows={8}
                className={`w-full px-4 py-3 rounded-lg border ${errors.coverLetter ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-indigo-500'} focus:ring-2 focus:outline-none transition-all resize-none`}
                placeholder="Explain why you are the best fit for this role..."
                disabled={isSubmitting}
              ></textarea>
              <div className="flex justify-between items-start mt-1.5">
                <div className="flex-1">
                  {errors.coverLetter && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1">
                      <AlertCircle className="w-3 h-3" /> {errors.coverLetter}
                    </p>
                  )}
                </div>
                <p className={`text-xs transition-colors ${formData.coverLetter.length > 0 && formData.coverLetter.length < 50 ? 'text-amber-600' : formData.coverLetter.length >= 50 ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                  {formData.coverLetter.length} / 50 characters
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyJob;
