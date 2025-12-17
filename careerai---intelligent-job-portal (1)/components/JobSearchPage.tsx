
import React, { useState, useRef, useEffect } from 'react';
import { Job } from '../types';
import { fetchJobs } from '../services/api';
import JobCard from './JobCard';
import { Search, Briefcase, MapPin, DollarSign, ChevronDown, Filter, X, RotateCcw, Code, Check, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface JobSearchPageProps {
  onSelectJob: (job: Job) => void;
  onApplyWithAI?: (job: Job) => void;
  jobs?: Job[];
}

const JobSearchPage: React.FC<JobSearchPageProps> = ({ onSelectJob, onApplyWithAI, jobs }) => {
  const [fetchedJobs, setFetchedJobs] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const displayJobs = (jobs || fetchedJobs || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [minSalary, setMinSalary] = useState('0');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const skillsDropdownRef = useRef<HTMLDivElement>(null);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('savedJobs');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);

  // Close skills dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(event.target as Node)) {
        setIsSkillsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch jobs from backend on mount
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiJobs = await fetchJobs();
        if (apiJobs && apiJobs.length > 0) {
          setFetchedJobs(apiJobs);
        } else {
          setFetchedJobs([]);
        }
      } catch (e: any) {
        setError('Could not load jobs from server.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Derive unique locations from jobs for the dropdown
  const locations = Array.from(new Set(displayJobs.map(job => {
    if (job.location.toLowerCase().includes('remote')) return 'Remote';
    return job.location.split(',')[0].trim(); // Extract city
  }))).sort();

  // Derive unique requirements (skills)
  const allRequirements = Array.from(new Set(displayJobs.flatMap(job => job.requirements))).sort();

  const toggleRequirement = (req: string) => {
    setSelectedRequirements(prev => 
      prev.includes(req) 
        ? prev.filter(r => r !== req) 
        : [...prev, req]
    );
  };

  const filteredJobs = displayJobs.filter(job => {
    // Search Term
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.requirements.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type Filter (Enhanced for Remote)
    const matchesType = typeFilter === 'All' || 
                        job.type === typeFilter || 
                        (typeFilter === 'Remote' && job.location.toLowerCase().includes('remote'));

    // Location Filter
    const matchesLocation = locationFilter === '' || 
                            job.location.toLowerCase().includes(locationFilter.toLowerCase());

    // Salary Filter (Basic parsing)
    // Assumes format "$140k - $180k" or "$80/hr"
    let jobMinSalary = 0;
    const salaryMatch = job.salaryRange.match(/\$(\d+)/);
    if (salaryMatch) {
       jobMinSalary = parseInt(salaryMatch[1]);
       // Hourly to annual approx: 80 * 2 = 160k roughly
       if (job.salaryRange.includes('/hr')) {
          jobMinSalary = jobMinSalary * 2; 
       }
    }
    const matchesSalary = parseInt(minSalary) === 0 || jobMinSalary >= parseInt(minSalary);

    // Requirements Filter (AND logic - must have all selected skills)
    const matchesRequirements = selectedRequirements.length === 0 || 
                                selectedRequirements.every(req => job.requirements.includes(req));

    return matchesSearch && matchesType && matchesLocation && matchesSalary && matchesRequirements;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const pagedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    // Reset to first page when filters change significantly
    setCurrentPage(1);
  }, [searchTerm, typeFilter, locationFilter, minSalary, selectedRequirements, fetchedJobs, jobs]);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => {
      const next = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem('savedJobs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setLocationFilter('');
    setMinSalary('0');
    setSelectedRequirements([]);
  };

  const activeFiltersCount = (searchTerm !== '' ? 1 : 0) + 
                             (typeFilter !== 'All' ? 1 : 0) + 
                             (locationFilter !== '' ? 1 : 0) + 
                             (minSalary !== '0' ? 1 : 0) + 
                             (selectedRequirements.length > 0 ? 1 : 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder="Search jobs by title, skill, or company..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base shadow-sm"
            />
            {searchTerm && (
                <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                    title="Clear search"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
            </div>
            
            <button 
                onClick={handleClearFilters}
                disabled={activeFiltersCount === 0}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors md:w-auto w-full shadow-sm border ${
                  activeFiltersCount > 0 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100 border-red-100' 
                    : 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed'
                }`}
                title="Reset all search filters"
            >
                <RotateCcw className="w-4 h-4" /> Clear Filters
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Employment Type */}
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Employment Type
             </label>
             <div className="relative">
                <select 
                aria-label="Employment Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-slate-700 cursor-pointer appearance-none hover:bg-slate-100 transition-colors"
                >
                <option value="All">Any Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
             </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
             </label>
             <div className="relative">
                 <select 
                  aria-label="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-slate-700 cursor-pointer appearance-none hover:bg-slate-100 transition-colors"
                >
                  <option value="">Any Location</option>
                  <option value="Remote">Remote</option>
                  {locations.filter(l => l !== 'Remote').map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
             </div>
          </div>

          {/* Salary Range */}
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Min Salary
             </label>
             <div className="relative">
                <select 
                aria-label="Minimum Salary"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-slate-700 cursor-pointer appearance-none hover:bg-slate-100 transition-colors"
                >
                <option value="0">Any Salary</option>
                <option value="50">$50k+ / yr</option>
                <option value="100">$100k+ / yr</option>
                <option value="120">$120k+ / yr</option>
                <option value="150">$150k+ / yr</option>
                <option value="200">$200k+ / yr</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
             </div>
          </div>

          {/* Skills / Requirements Multi-select */}
          <div className="space-y-1 relative" ref={skillsDropdownRef}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Code className="w-3 h-3" /> Skills
            </label>
            <button
                onClick={() => setIsSkillsOpen(!isSkillsOpen)}
                className={`w-full text-left pl-4 pr-10 py-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm cursor-pointer hover:bg-slate-100 transition-colors flex items-center truncate ${selectedRequirements.length > 0 ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium' : 'border-slate-200 text-slate-700'}`}
            >
                {selectedRequirements.length === 0 
                  ? "Any Skill" 
                  : `${selectedRequirements.length} Selected`}
            </button>
            <ChevronDown className={`absolute right-3 top-[34px] text-slate-400 w-4 h-4 pointer-events-none transition-transform ${isSkillsOpen ? 'rotate-180' : ''}`} />
            
            {isSkillsOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        {allRequirements.map(req => (
                            <div 
                                key={req} 
                                onClick={() => toggleRequirement(req)}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                            >
                                <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedRequirements.includes(req) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                    {selectedRequirements.includes(req) && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className={`text-sm ${selectedRequirements.includes(req) ? 'text-indigo-900 font-medium' : 'text-slate-600'}`}>
                                    {req}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
           <Filter className="w-5 h-5 text-indigo-600" />
           {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
        </h2>
        <div className="hidden md:flex items-center gap-3">
          <div className="text-sm text-slate-600">Saved: <span className="font-semibold text-indigo-600">{savedJobIds.length}</span></div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Per Page</label>
            <select
              aria-label="Jobs per page"
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
              className="pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-slate-700 cursor-pointer appearance-none hover:bg-slate-100 transition-colors"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
            </select>
          </div>
        </div>
        {activeFiltersCount > 0 && (
            <button 
                onClick={handleClearFilters}
                className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors md:hidden"
            >
                Reset Filters
            </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Loading jobs…</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {pagedJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                onClick={() => onSelectJob(job)} 
                onApplyWithAI={onApplyWithAI ? () => onApplyWithAI(job) : undefined}
                extraActions={
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors ${savedJobIds.includes(job.id) ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    title={savedJobIds.includes(job.id) ? 'Unsave job' : 'Save job'}
                    aria-label={savedJobIds.includes(job.id) ? 'Unsave job' : 'Save job'}
                  >
                    {savedJobIds.includes(job.id) ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {savedJobIds.includes(job.id) ? 'Saved' : 'Save'}
                  </button>
                }
              />
           ))}
        </div>
        
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border shadow-sm text-sm ${currentPage === 1 ? 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed' : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200'}`}
              aria-label="Previous page"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="text-sm text-slate-600">Page <span className="font-semibold text-slate-900">{currentPage}</span> of <span className="font-semibold text-slate-900">{totalPages}</span></div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border shadow-sm text-sm ${currentPage === totalPages ? 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed' : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200'}`}
              aria-label="Next page"
              title="Next page"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
           </div>
           <h3 className="text-lg font-medium text-slate-900">No jobs found</h3>
           <p className="text-slate-500">{error || 'Try adjusting your search filters.'}</p>
           <button 
             onClick={handleClearFilters}
             className="mt-4 px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
           >
             Clear Filters
           </button>
        </div>
      )}
    </div>
  );
};

export default JobSearchPage;
