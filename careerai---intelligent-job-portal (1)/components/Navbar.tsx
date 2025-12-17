
/* eslint-disable jsx-a11y/aria-proptypes */
import React, { useState } from 'react';
import { User, PageView, UserRole, UserStatus, Notification } from '../types';
import { Bell, Briefcase, User as UserIcon, LogOut, Shield, GraduationCap, Building2, BellRing, Menu, Info } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../constants';

interface NavbarProps {
  user: User | null;
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, currentPage, onNavigate, onLogout, onToggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Configuration for navigation links based on roles
  const NAV_CONFIG = {
    [UserRole.STUDENT]: [
      { label: 'Job Search', view: PageView.JOB_SEARCH },
      { label: 'Resume AI', view: PageView.RESUME_ANALYSIS },
      { label: 'Career Coach', view: PageView.CAREER_CHAT },
    ],
    [UserRole.EMPLOYER]: [
      { label: 'Post Job', view: PageView.POST_JOB },
      { label: 'Applicants', view: PageView.VIEW_APPLICANTS },
    ],
    [UserRole.ADMIN]: [
      { label: 'User Management', view: PageView.ADMIN_USERS },
      { label: 'System Settings', view: PageView.SETTINGS },
    ]
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Inactive': return 'bg-slate-400';
      case 'Pending': return 'bg-yellow-500';
      default: return 'bg-slate-400';
    }
  };

  const getRoleBranding = () => {
    if (!user) return { 
      icon: Briefcase, 
      color: 'bg-indigo-600', 
      textColor: 'text-indigo-600',
      borderColor: 'border-transparent',
      hoverText: 'hover:text-indigo-600',
      activeText: 'text-indigo-700',
      logoGradient: 'from-slate-900 to-slate-700'
    };
    
    switch (user.role) {
      case UserRole.STUDENT:
        return { 
          icon: GraduationCap, 
          color: 'bg-indigo-600', 
          textColor: 'text-indigo-600',
          borderColor: 'border-indigo-600',
          hoverText: 'hover:text-indigo-600',
          activeText: 'text-indigo-700 font-bold',
          logoGradient: 'from-indigo-700 to-indigo-500'
        };
      case UserRole.EMPLOYER:
        return { 
          icon: Building2, 
          color: 'bg-purple-600', 
          textColor: 'text-purple-600',
          borderColor: 'border-purple-600',
          hoverText: 'hover:text-purple-600',
          activeText: 'text-purple-700 font-bold',
          logoGradient: 'from-purple-700 to-purple-500'
        };
      case UserRole.ADMIN:
        return { 
          icon: Shield, 
          color: 'bg-slate-700', 
          textColor: 'text-slate-700',
          borderColor: 'border-slate-700',
          hoverText: 'hover:text-slate-800',
          activeText: 'text-slate-900 font-bold',
          logoGradient: 'from-slate-800 to-slate-600'
        };
      default:
        return { 
          icon: Briefcase, 
          color: 'bg-indigo-600', 
          textColor: 'text-indigo-600',
          borderColor: 'border-transparent',
          hoverText: 'hover:text-indigo-600',
          activeText: 'text-indigo-700',
          logoGradient: 'from-slate-900 to-slate-700'
        };
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setShowNotifications(false);
    if (notification.link) {
      onNavigate(notification.link);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  const branding = getRoleBranding();
  const BrandIcon = branding.icon;
  const currentNavLinks = user ? NAV_CONFIG[user.role] : [];

  const isActive = (view: PageView) => {
    if (currentPage === view) return true;
    // Handle sub-pages for Job Search
    if (view === PageView.JOB_SEARCH && (currentPage === PageView.JOB_DETAILS || currentPage === PageView.APPLY_JOB)) return true;
    return false;
  };

  return (
    <nav className={`sticky top-0 z-50 bg-white border-b border-slate-200 ${user ? `border-t-4 ${branding.borderColor}` : ''} px-4 md:px-6 py-3 flex justify-between items-center shadow-sm transition-all duration-300`}>
      <div className="flex items-center gap-4">
        {user && (
            <button onClick={onToggleSidebar} className="md:hidden text-slate-500 hover:text-slate-700" aria-label="Toggle sidebar" title="Toggle sidebar">
                <Menu className="w-6 h-6" />
            </button>
        )}
        <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
                if (!user) onNavigate(PageView.LANDING);
                else if (user.role === UserRole.STUDENT) onNavigate(PageView.STUDENT_DASHBOARD);
                else if (user.role === UserRole.EMPLOYER) onNavigate(PageView.EMPLOYER_DASHBOARD);
                else onNavigate(PageView.ADMIN_DASHBOARD);
            }}
        >
            <div className={`p-2 rounded-lg ${branding.color} transition-colors duration-300 shadow-sm group-hover:scale-105 transform`}>
              <BrandIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${branding.logoGradient} leading-none`}>
                  CareerAI
              </span>
              {user && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${branding.textColor} opacity-80 leading-tight mt-0.5`}>
                  {user.role} Portal
                  </span>
              )}
            </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            {/* Dynamic Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
                {currentNavLinks.map(link => (
                    <button 
                        key={link.label}
                        onClick={() => onNavigate(link.view)}
                        className={`text-sm font-medium transition-colors ${
                            isActive(link.view) ? branding.activeText : `text-slate-600 ${branding.hoverText}`
                        }`}
                    >
                        {link.label}
                    </button>
                ))}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-4">
              {/* Notification System */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-slate-500 hover:text-slate-700 outline-none transition-colors p-1 rounded-full hover:bg-slate-100"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                     <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                           <BellRing className="w-3.5 h-3.5" /> Notifications
                        </h3>
                        {unreadCount > 0 && (
                           <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                             Mark all read
                           </button>
                        )}
                     </div>
                     <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                           notifications.map(notification => (
                              <div 
                                 key={notification.id}
                                 onClick={() => handleNotificationClick(notification)}
                                 className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 ${!notification.read ? 'bg-indigo-50/30' : ''}`}
                              >
                                 <div className="flex gap-3">
                                    <div className="mt-1 flex-shrink-0">
                                       {notification.type === 'job_match' && <Briefcase className="w-4 h-4 text-indigo-500" />}
                                       {notification.type === 'application_update' && <Building2 className="w-4 h-4 text-purple-500" />}
                                       {notification.type === 'system' && <Info className="w-4 h-4 text-blue-500" />}
                                    </div>
                                    <div>
                                       <div className="flex justify-between items-start gap-2">
                                           <p className={`text-sm ${!notification.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                             {notification.title}
                                           </p>
                                           {!notification.read && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                                       </div>
                                       <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                         {notification.message}
                                       </p>
                                       <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{notification.timestamp}</p>
                                    </div>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="p-8 text-center text-slate-500 text-sm">
                              No notifications
                           </div>
                        )}
                     </div>
                  </div>
                )}
              </div>
              
              <div className="relative" onMouseLeave={() => setShowProfileMenu(false)}>
                {/* eslint-disable-next-line jsx-a11y/aria-proptypes */}
                <button 
                  className="flex items-center gap-2 outline-none"
                  onClick={() => setShowProfileMenu(prev => !prev)}
                  aria-haspopup="menu"
                >
                  <div className="relative">
                    <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className={`w-9 h-9 rounded-full border-2 p-0.5 object-cover ${user.role === UserRole.ADMIN ? 'border-slate-200' : user.role === UserRole.EMPLOYER ? 'border-purple-100' : 'border-indigo-100'}`}
                    />
                    <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${getStatusColor(user.status)}`}></span>
                  </div>
                </button>
                {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`} title={user.status}></span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                       <BrandIcon className={`w-3.5 h-3.5 ${branding.textColor}`} />
                       <p className="text-xs text-slate-500 capitalize font-medium">{user.role.toLowerCase()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setShowProfileMenu(false); onNavigate(PageView.PROFILE); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" /> Profile
                  </button>
                  <button 
                    onClick={() => { setShowProfileMenu(false); onLogout(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => onNavigate(PageView.LOGIN)}
              className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900"
            >
              Log in
            </button>
            <button 
              onClick={() => onNavigate(PageView.SIGNUP)}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
