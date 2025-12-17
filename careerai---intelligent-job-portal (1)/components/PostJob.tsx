
import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { ArrowLeft, Save, Plus } from 'lucide-react';

interface PostJobProps {
  onCancel: () => void;
  onPost: (jobData?: { title: string; type: string; location: string; salaryRange: string; description: string; requirements: string; companyDescription: string }) => void;
  initialData?: Job | null;
}

const PostJob: React.FC<PostJobProps> = ({ onCancel, onPost, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Full-time',
    location: '',
    salaryRange: '',
    description: '',
    requirements: '',
    companyDescription: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        type: initialData.type,
        location: initialData.location,
        salaryRange: initialData.salaryRange,
        description: initialData.description,
        requirements: initialData.requirements.join(', '),
        companyDescription: initialData.companyDescription || ''
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isEditing = !!initialData;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Job Posting' : 'Post a New Job'}</h2>
          <p className="text-sm text-slate-500">{isEditing ? 'Update the details below to modify your job posting.' : 'Fill in the details to reach thousands of candidates.'}</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Engineer" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                title="Employment Type"
                aria-label="Employment Type"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Remote / New York" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" 
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Salary Range</label>
             <input 
               type="text" 
               name="salaryRange"
               value={formData.salaryRange}
               onChange={handleChange}
               placeholder="e.g. $120k - $150k" 
               className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6} 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-y" 
              placeholder="Describe the role responsibilities..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Requirements (comma separated)</label>
            <input 
              type="text" 
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="React, TypeScript, 3+ years experience..." 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Description <span className="text-slate-400 font-normal">(Optional)</span></label>
            <textarea 
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              rows={3} 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-y" 
              placeholder="Briefly describe your company culture..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              onClick={onCancel}
              className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onPost(isEditing ? undefined : formData)}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-all"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isEditing ? 'Save Changes' : 'Post Job'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
