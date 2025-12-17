import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Camera, Edit2, Save, X, Loader2, Check, Linkedin, Github, Globe, Phone, GraduationCap, Award, Code } from 'lucide-react';

interface ProfilePageProps {
  user: User;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<User>(user);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if user prop updates
  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCancel = () => {
    setFormData(user); // Revert changes
    setIsEditing(false);
    setSuccessMessage(null);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <div className="flex gap-3">
            {isEditing ? (
                <>
                    <button 
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
                    >
                        <X className="w-4 h-4" /> Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </>
            ) : (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 shadow-sm"
                >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
            )}
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
            <Check className="w-5 h-5" /> {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div 
            className={`relative group ${isEditing ? 'cursor-pointer' : ''}`}
            onClick={handleAvatarClick}
            title={isEditing ? "Click to change photo" : ""}
          >
             <img 
                src={formData.avatarUrl} 
                className={`w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm transition-transform ${isEditing ? 'group-hover:scale-105' : ''}`} 
                alt="Profile"
             />
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
               title="Upload profile photo"
               aria-label="Upload profile photo"
                accept="image/*"
             />
             {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                </div>
             )}
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">{formData.name}</h2>
          <p className="text-slate-500 font-medium">{formData.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
                id="fullName"
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleChange}
                disabled={!isEditing}
                title="Full Name"
                placeholder="Your full name"
                aria-label="Full Name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                    !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
                }`} 
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
                id="email"
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange}
                disabled={!isEditing}
                title="Email Address"
                placeholder="name@example.com"
                aria-label="Email Address"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                    !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
                }`} 
            />
          </div>
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-slate-700 mb-1">Professional Headline</label>
             <input 
                type="text" 
                name="title"
                value={formData.title || ''} 
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer" 
                disabled={!isEditing}
              title="Professional Headline"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                    !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
                }`} 
            />
          </div>
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
             <textarea 
                name="bio"
                rows={4} 
                value={formData.bio || ''} 
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none ${
                    !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
                }`} 
                placeholder="Tell us about yourself..."
            ></textarea>
          </div>
        </div>
      </div>

      {/* Education Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">Education</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">University/Institution</label>
            <input 
              type="text" 
              name="university"
              value={formData.university || ''} 
              onChange={handleChange}
              placeholder="e.g. Stanford University" 
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
              }`} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Major/Field of Study</label>
            <input 
              type="text" 
              name="major"
              value={formData.major || ''} 
              onChange={handleChange}
              placeholder="e.g. Computer Science" 
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
              }`} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Graduation Year</label>
            <input 
              type="text" 
              name="graduationYear"
              value={formData.graduationYear || ''} 
              onChange={handleChange}
              placeholder="e.g. 2024" 
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
              }`} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">GPA (Optional)</label>
            <input 
              type="text" 
              name="gpa"
              value={formData.gpa || ''} 
              onChange={handleChange}
              placeholder="e.g. 3.8/4.0" 
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
              }`} 
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <Phone className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone || ''} 
              onChange={handleChange}
              placeholder="+1 (555) 123-4567" 
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
              }`} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input 
              type="text" 
              name="location"
              value={formData.location || ''} 
              onChange={handleChange}
              placeholder="e.g. San Francisco, CA" 
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
              }`} 
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">Social & Professional Links</h3>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-600" /> LinkedIn Profile
            </label>
            <input 
              type="url" 
              name="linkedinUrl"
              value={formData.linkedinUrl || ''} 
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile" 
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
              }`} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-800" /> GitHub Profile
            </label>
            <input 
              type="url" 
              name="githubUrl"
              value={formData.githubUrl || ''} 
              onChange={handleChange}
              placeholder="https://github.com/yourusername" 
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
              }`} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" /> Portfolio Website
            </label>
            <input 
              type="url" 
              name="portfolioUrl"
              value={formData.portfolioUrl || ''} 
              onChange={handleChange}
              placeholder="https://yourportfolio.com" 
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
              }`} 
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <Code className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">Skills</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Your Skills (comma-separated)
          </label>
          <input 
            type="text" 
            name="skills"
            value={formData.skills?.join(', ') || ''} 
            onChange={(e) => {
              const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
              setFormData(prev => ({ ...prev, skills }));
            }}
            placeholder="e.g. React, TypeScript, Python, Machine Learning" 
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
              !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
            }`} 
          />
          {formData.skills && formData.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">Certifications</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Certifications (comma-separated)
          </label>
          <input 
            type="text" 
            name="certifications"
            value={formData.certifications?.join(', ') || ''} 
            onChange={(e) => {
              const certifications = e.target.value.split(',').map(s => s.trim()).filter(s => s);
              setFormData(prev => ({ ...prev, certifications }));
            }}
            placeholder="e.g. AWS Certified Developer, Google Cloud Professional" 
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
              !isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'bg-white border-slate-300 shadow-sm'
            }`} 
          />
          {formData.certifications && formData.certifications.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.certifications.map((cert, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100 flex items-center gap-1">
                  <Award className="w-3 h-3" /> {cert}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;