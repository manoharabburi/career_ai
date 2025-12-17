import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Filter, 
  Trash2, 
  Shield, 
  Ban, 
  XCircle,
  ChevronDown,
  Download,
  FileText,
  TrendingUp,
  Clock,
  Mail,
  Settings,
  Database,
  Lock,
  Globe,
  Flag,
  BarChart3,
  UserCheck,
  UserX,
  Send
} from 'lucide-react';
import { User, UserRole, UserStatus } from '../types';
import { adminDeleteUser, adminListUsers, adminUpdateUserStatus, adminGetUserStats, adminGetJobStats, AdminUserStats, AdminJobStats } from '../services/api';

type DashboardView = 'overview' | 'users' | 'moderation' | 'settings';

interface AdminDashboardProps {
  initialView?: DashboardView;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialView = 'overview' }) => {
  const [currentView, setCurrentView] = useState<DashboardView>(initialView);
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<AdminUserStats | null>(null);
  const [jobStats, setJobStats] = useState<AdminJobStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock data for additional features
  const [systemLogs] = useState([
    { id: 1, action: 'User Registration', user: 'john.smith@email.com', timestamp: '2 mins ago', status: 'success' },
    { id: 2, action: 'Job Posted', user: 'TechCorp Inc.', timestamp: '5 mins ago', status: 'success' },
    { id: 3, action: 'Failed Login', user: 'admin@system', timestamp: '12 mins ago', status: 'warning' },
    { id: 4, action: 'Application Submitted', user: 'sarah.j@email.com', timestamp: '18 mins ago', status: 'success' },
    { id: 5, action: 'Profile Updated', user: 'mike.ross@email.com', timestamp: '25 mins ago', status: 'success' },
  ]);
  
  const [moderationQueue] = useState([
    { id: 1, type: 'Job Post', title: 'Senior Developer - Urgent Hiring', reporter: 'user123', reason: 'Suspicious salary range', status: 'pending' },
    { id: 2, type: 'User Profile', title: 'john.suspicious@fake.com', reporter: 'system', reason: 'Multiple account creation', status: 'pending' },
    { id: 3, type: 'Resume', title: 'resume_fake_credentials.pdf', reporter: 'user456', reason: 'Fake certifications', status: 'pending' },
  ]);

  // Initial fetch
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersData, usersStatsData, jobsStatsData] = await Promise.all([
          adminListUsers(),
          adminGetUserStats().catch(() => null),
          adminGetJobStats().catch(() => null)
        ]);
        setUsers(usersData);
        setUserStats(usersStatsData);
        setJobStats(jobsStatsData);
      } catch (e: any) {
        setError(e?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Actions
  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      await adminUpdateUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminDeleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (e) {
        alert('Failed to delete user');
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* AI Platform Health */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <p className="text-blue-900 text-sm font-semibold">AI Platform Health</p>
            <div className="p-2 bg-blue-200 rounded-lg">
              <Activity className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-blue-900 mb-2">96.5%</h3>
          <p className="text-xs text-blue-700">Overall system stability and trust score.</p>
        </div>

        {/* Anomaly Alerts */}
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-6 rounded-2xl border border-red-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <p className="text-red-900 text-sm font-semibold">Anomaly Alerts</p>
            <div className="p-2 bg-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-700" />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-red-900 mb-2">3</h3>
          <p className="text-xs text-red-700">Suspicious activities detected.</p>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-2xl border border-green-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <p className="text-green-900 text-sm font-semibold">Total Users</p>
            <div className="p-2 bg-green-200 rounded-lg">
              <Users className="w-5 h-5 text-green-700" />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-green-900 mb-2">{userStats?.total_users.toLocaleString() || users.length.toLocaleString()}</h3>
          <p className="text-xs text-green-700">+201 since last week</p>
        </div>

        {/* Active Jobs */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <p className="text-purple-900 text-sm font-semibold">Active Jobs</p>
            <div className="p-2 bg-purple-200 rounded-lg">
              <Briefcase className="w-5 h-5 text-purple-700" />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-purple-900 mb-2">{jobStats?.active_jobs.toLocaleString() || '0'}</h3>
          <p className="text-xs text-purple-700">Total: {jobStats?.total_jobs.toLocaleString() || '0'} jobs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Real-Time Platform Activity</h3>
            <p className="text-sm text-slate-500">Live feed of user interactions and events.</p>
          </div>
          
          {/* Activity Chart */}
          <div className="relative h-64 bg-gradient-to-b from-blue-50 to-transparent rounded-xl p-4">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              <line x1="0" y1="40" x2="800" y2="40" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="0" y1="80" x2="800" y2="80" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="0" y1="120" x2="800" y2="120" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="0" y1="160" x2="800" y2="160" stroke="#e2e8f0" strokeWidth="1" />
              
              {/* Area chart */}
              <path
                d="M 0 160 L 50 140 L 100 130 L 150 120 L 200 110 L 250 100 L 300 85 L 350 90 L 400 80 L 450 75 L 500 65 L 550 70 L 600 55 L 650 45 L 700 40 L 750 35 L 800 30 L 800 200 L 0 200 Z"
                fill="url(#areaGradient)"
              />
              
              {/* Line */}
              <path
                d="M 0 160 L 50 140 L 100 130 L 150 120 L 200 110 L 250 100 L 300 85 L 350 90 L 400 80 L 450 75 L 500 65 L 550 70 L 600 55 L 650 45 L 700 40 L 750 35 L 800 30"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-400 py-2">
              <span>320</span>
              <span>240</span>
              <span>160</span>
              <span>80</span>
              <span>0</span>
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>10:00</span>
              <span>10:05</span>
              <span>10:10</span>
              <span>10:15</span>
              <span>10:20</span>
              <span>10:25</span>
              <span>10:30</span>
            </div>
          </div>
        </div>

        {/* Fraud & Risk Map */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Fraud & Risk Map</h3>
            <p className="text-sm text-slate-500">Geographic concentration of high-risk activities.</p>
          </div>
          
          {/* Map Placeholder */}
          <div className="flex items-center justify-center h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-sm text-slate-500 font-medium">Interactive Risk Map</p>
              <p className="text-xs text-slate-400 mt-1">Geographic data visualization</p>
            </div>
          </div>
          
          {/* Risk Summary */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">High Risk</span>
              </div>
              <span className="text-sm font-bold text-red-700">12</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Medium Risk</span>
              </div>
              <span className="text-sm font-bold text-yellow-700">34</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Low Risk</span>
              </div>
              <span className="text-sm font-bold text-green-700">156</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & System Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Analytics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">User Growth Trend</h3>
              <p className="text-sm text-slate-500">30-day registration analytics</p>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-40">
            {[45, 52, 48, 65, 58, 72, 68, 75, 82, 78, 85, 92].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t hover:from-indigo-700 hover:to-indigo-500 transition-all cursor-pointer" 
                     style={{ height: `${height}%` }}
                     title={`Week ${i + 1}: ${Math.round(height * 1.5)} users`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-3">
            <span>Week 1</span>
            <span>Week 6</span>
            <span>Week 12</span>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-slate-600">+24% growth</span>
            </div>
            <span className="text-xs text-slate-500">Last 30 days</span>
          </div>
        </div>

        {/* Recent System Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">System Activity Log</h3>
              <p className="text-sm text-slate-500">Recent platform events</p>
            </div>
            <button 
              onClick={() => setCurrentView('moderation')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {systemLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`p-1.5 rounded-full ${
                  log.status === 'success' ? 'bg-green-100' : 
                  log.status === 'warning' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {log.status === 'success' ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> :
                   log.status === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> :
                   <Activity className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-500 truncate">{log.user}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group">
            <Download className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-slate-900">Export Users</p>
            <p className="text-xs text-slate-500 mt-1">Download CSV</p>
          </button>
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all group">
            <Mail className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-slate-900">Send Newsletter</p>
            <p className="text-xs text-slate-500 mt-1">Bulk email</p>
          </button>
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group">
            <FileText className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-slate-900">Generate Report</p>
            <p className="text-xs text-slate-500 mt-1">Analytics PDF</p>
          </button>
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all group">
            <Database className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-slate-900">Backup Data</p>
            <p className="text-xs text-slate-500 mt-1">Full backup</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
                type="text" 
                placeholder="Search users by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <select 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                    title="Filter by role"
                    aria-label="Filter by role"
                    className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                >
                    <option value="ALL">All Roles</option>
                    <option value={UserRole.STUDENT}>Students</option>
                    <option value={UserRole.EMPLOYER}>Employers</option>
                    <option value={UserRole.ADMIN}>Admins</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="relative">
                 <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${statusFilter === 'Active' ? 'bg-green-500' : statusFilter === 'Pending' ? 'bg-yellow-500' : statusFilter === 'Inactive' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'ALL')}
                    title="Filter by status"
                    aria-label="Filter by status"
                    className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                >
                    <option value="ALL">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && (
          <div className="p-4 text-sm text-slate-500">Loading users...</div>
        )}
        {error && (
          <div className="p-4 text-sm text-red-600">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                      <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{user.name}</p>
                        </div>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {user.role === UserRole.ADMIN && <Shield className="w-3 h-3" />}
                      {user.role === UserRole.EMPLOYER && <Briefcase className="w-3 h-3" />}
                      {user.role === UserRole.STUDENT && <Users className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {user.joinedDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' :
                      user.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {/* Action Buttons */}
                       {user.status === 'Active' ? (
                           <button 
                             onClick={() => handleStatusChange(user.id, 'Inactive')}
                             title="Deactivate"
                             className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                           >
                              <Ban className="w-4 h-4" />
                           </button>
                       ) : (
                           <button 
                             onClick={() => handleStatusChange(user.id, 'Active')}
                             title="Activate"
                             className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                           >
                              <CheckCircle className="w-4 h-4" />
                           </button>
                       )}
                       
                       <button 
                         onClick={() => handleDeleteUser(user.id)}
                         title="Delete User"
                         className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                  <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500">
                          <div className="flex flex-col items-center justify-center">
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                  <Users className="w-6 h-6 text-slate-400" />
                              </div>
                              <p>No users found matching your criteria.</p>
                              <button 
                                onClick={() => { setSearchQuery(''); setRoleFilter('ALL'); setStatusFilter('ALL'); }}
                                className="mt-2 text-indigo-600 text-sm hover:underline"
                              >
                                Clear Filters
                              </button>
                          </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
            <span>Showing {filteredUsers.length} of {users.length} users</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
            </div>
        </div>
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-200 rounded-lg">
            <Flag className="w-5 h-5 text-orange-700" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Content Moderation Queue</h3>
        </div>
        <p className="text-sm text-slate-600">Review and moderate flagged content and suspicious activities</p>
      </div>

      {/* Moderation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Reviews</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-1">{moderationQueue.length}</h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Approved Today</p>
              <h3 className="text-3xl font-bold text-green-600 mt-1">18</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Rejected Today</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">5</h3>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-900">Flagged Items</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {moderationQueue.map((item) => (
            <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {item.type}
                    </span>
                    <h4 className="font-semibold text-slate-900">{item.title}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-red-700">{item.reason}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      Reported by: {item.reporter}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      {/* System Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          System Configuration
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Platform Maintenance Mode</p>
                <p className="text-sm text-slate-500">Disable public access for updates</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Email Notifications</p>
                <p className="text-sm text-slate-500">Send system emails to users</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500">Require 2FA for admin accounts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">AI Analytics Tracking</p>
                <p className="text-sm text-slate-500">Collect usage data for insights</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">API & Integration Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gemini API Key</label>
            <input 
              type="password" 
              placeholder="••••••••••••••••••••"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Service Provider</label>
            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>SendGrid</option>
              <option>Mailgun</option>
              <option>AWS SES</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Max API Requests per User (per day)</label>
            <input 
              type="number" 
              defaultValue={100}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="w-full px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">
              {currentView === 'overview' ? 'System overview and platform statistics' : 
               currentView === 'users' ? 'Manage system users and permissions' :
               currentView === 'moderation' ? 'Review flagged content and moderation queue' :
               'Configure system settings and integrations'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8">
            <button 
                onClick={() => setCurrentView('overview')}
                className={`pb-4 text-sm font-medium transition-colors relative ${
                    currentView === 'overview' 
                    ? 'text-indigo-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Overview
                {currentView === 'overview' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>
                )}
            </button>
            <button 
                onClick={() => setCurrentView('users')}
                className={`pb-4 text-sm font-medium transition-colors relative ${
                    currentView === 'users' 
                    ? 'text-indigo-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                User Management
                {currentView === 'users' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>
                )}
            </button>
            <button 
                onClick={() => setCurrentView('moderation')}
                className={`pb-4 text-sm font-medium transition-colors relative ${
                    currentView === 'moderation' 
                    ? 'text-indigo-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Moderation
                {currentView === 'moderation' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>
                )}
            </button>
            <button 
                onClick={() => setCurrentView('settings')}
                className={`pb-4 text-sm font-medium transition-colors relative ${
                    currentView === 'settings' 
                    ? 'text-indigo-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Settings
                {currentView === 'settings' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>
                )}
            </button>
        </div>
      </div>

      {currentView === 'overview' && renderOverview()}
      {currentView === 'users' && renderUserManagement()}
      {currentView === 'moderation' && renderModeration()}
      {currentView === 'settings' && renderSettings()}
    </div>
  );
};

export default AdminDashboard;