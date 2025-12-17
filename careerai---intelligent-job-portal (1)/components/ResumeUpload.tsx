import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ResumeUploadProps {
  onUploadComplete: (base64: string, mimeType: string, fileName: string, file: File) => void;
  isAnalyzing: boolean;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadComplete, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Image (PNG/JPG) file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB.');
      return;
    }

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 part
      const base64Data = result.split(',')[1];
      onUploadComplete(base64Data, file.type, file.name, file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : fileName 
              ? 'border-green-400 bg-green-50'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="resume-upload" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept=".pdf,.png,.jpg,.jpeg"
          disabled={isAnalyzing}
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          {isAnalyzing ? (
             <div className="p-4 bg-indigo-100 rounded-full animate-pulse">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
             </div>
          ) : fileName ? (
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          ) : (
            <div className="p-4 bg-indigo-50 rounded-full">
              <UploadCloud className="w-8 h-8 text-indigo-600" />
            </div>
          )}
          
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-slate-900">
              {isAnalyzing 
                ? 'AI is analyzing your resume...' 
                : fileName 
                  ? 'Resume Uploaded!' 
                  : 'Click or drag resume here'}
            </h3>
            <p className="text-sm text-slate-500">
              {fileName || 'PDF, PNG, or JPG up to 5MB'}
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;