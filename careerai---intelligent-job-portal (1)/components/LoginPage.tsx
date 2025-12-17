import React, { useState } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';
import { Briefcase, User as UserIcon, ShieldCheck } from 'lucide-react';
import { fetchProfile, login, setAuthTokens } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateToSignup }) => {
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { access_token, refresh_token } = await login(email, password);
      setAuthTokens(access_token, refresh_token);
      const profile = await fetchProfile(access_token);
      onLoginSuccess(profile);
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 p-6 text-center border-b border-slate-100 relative">
          <button
            onClick={() => window.location.href = '/'}
            className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
            title="Back to Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <h2 className="text-2xl font-bold text-slate-900">
            {activeTab === UserRole.ADMIN ? 'Admin Portal' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 mt-2">
            {activeTab === UserRole.ADMIN
              ? 'Secure access for system administrators'
              : 'Sign in to access your account'}
          </p>
        </div>

        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab(UserRole.STUDENT)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === UserRole.STUDENT ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Student
          </button>
          <button
            onClick={() => setActiveTab(UserRole.EMPLOYER)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === UserRole.EMPLOYER ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Employer
          </button>
          <button
            onClick={() => setActiveTab(UserRole.ADMIN)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === UserRole.ADMIN ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Admin
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-lg transition-colors flex justify-center items-center gap-2`}
          >
            {activeTab === UserRole.STUDENT && <UserIcon className="w-4 h-4" />}
            {activeTab === UserRole.EMPLOYER && <Briefcase className="w-4 h-4" />}
            {activeTab === UserRole.ADMIN && <ShieldCheck className="w-4 h-4" />}
            {loading ? 'Signing in...' : `Login as ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}`}
          </button>

          <div className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button className="text-indigo-600 hover:underline" onClick={onNavigateToSignup}>
              Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;