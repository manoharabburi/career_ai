
import React from 'react';
import { PageView, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  MessageSquare, 
  User, 
  Settings,
  Briefcase,
  Users,
  ClipboardList,
  Sparkles,
  Mic
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  role: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, role }) => {
  const studentItems = [
    { icon: LayoutDashboard, label: 'Dashboard', value: PageView.STUDENT_DASHBOARD },
    { icon: Sparkles, label: 'AI Recommendations', value: PageView.JOB_RECOMMENDATIONS },
    { icon: Search, label: 'Job Search', value: PageView.JOB_SEARCH },
    { icon: ClipboardList, label: 'My Applications', value: PageView.APPLICATION_HISTORY },
    { icon: FileText, label: 'Resume AI', value: PageView.RESUME_ANALYSIS },
    { icon: MessageSquare, label: 'Career Coach', value: PageView.CAREER_CHAT },
    { icon: Mic, label: 'AI Interview', value: PageView.AI_INTERVIEW },
    { icon: User, label: 'Profile', value: PageView.PROFILE },
  ];

  const employerItems = [
    { icon: LayoutDashboard, label: 'Dashboard', value: PageView.EMPLOYER_DASHBOARD },
    { icon: Briefcase, label: 'Post Job', value: PageView.POST_JOB },
    { icon: Users, label: 'Applicants', value: PageView.VIEW_APPLICANTS }, 
    { icon: User, label: 'Profile', value: PageView.PROFILE },
  ];

  const adminItems = [
     { icon: LayoutDashboard, label: 'Dashboard', value: PageView.ADMIN_DASHBOARD },
     { icon: Users, label: 'User Management', value: PageView.ADMIN_USERS }, 
     { icon: Settings, label: 'System Settings', value: PageView.SETTINGS },
     { icon: User, label: 'Profile', value: PageView.PROFILE },
  ];

  const items = role === UserRole.STUDENT ? studentItems : 
                role === UserRole.EMPLOYER ? employerItems : adminItems;

  // Helper to determine if an item is active, including sub-pages
  const isActive = (itemValue: PageView) => {
    if (currentPage === itemValue) return true;
    
    // Sub-page logic for Student Job Search flow
    if (itemValue === PageView.JOB_SEARCH && 
       (currentPage === PageView.JOB_DETAILS || currentPage === PageView.APPLY_JOB)) {
      return true;
    }

    return false;
  };

  const getThemeClasses = () => {
    switch (role) {
      case UserRole.EMPLOYER:
        return {
          activeBg: 'bg-purple-50',
          activeText: 'text-purple-700',
          activeIcon: 'text-purple-600',
          border: 'border-purple-600',
          hover: 'hover:bg-purple-50',
          settingsActiveIcon: 'text-purple-600'
        };
      case UserRole.ADMIN:
        return {
          activeBg: 'bg-slate-100',
          activeText: 'text-slate-900',
          activeIcon: 'text-slate-700',
          border: 'border-slate-700',
          hover: 'hover:bg-slate-100',
          settingsActiveIcon: 'text-slate-700'
        };
      default: // STUDENT
        return {
          activeBg: 'bg-indigo-50',
          activeText: 'text-indigo-700',
          activeIcon: 'text-indigo-600',
          border: 'border-indigo-600',
          hover: 'hover:bg-indigo-50',
          settingsActiveIcon: 'text-indigo-600'
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-[calc(100vh-65px)] sticky top-[65px]">
      <div className="p-4 space-y-1">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
        {items.map((item, index) => {
          const active = isActive(item.value);
          
          return (
            <button
              key={`${item.label}-${index}`}
              onClick={() => onNavigate(item.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? `${theme.activeBg} ${theme.activeText} border-l-4 ${theme.border}`
                  : `text-slate-600 ${theme.hover} hover:text-slate-900`
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? theme.activeIcon : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </div>
      
      <div className="mt-auto p-4 border-t border-slate-100">
        <button 
          onClick={() => onNavigate(PageView.SETTINGS)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentPage === PageView.SETTINGS
                ? `${theme.activeBg} ${theme.activeText} border-l-4 ${theme.border}`
                : `text-slate-600 ${theme.hover}`
            }`}
        >
          <Settings className={`w-5 h-5 ${currentPage === PageView.SETTINGS ? theme.settingsActiveIcon : 'text-slate-400'}`} />
          Settings
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
