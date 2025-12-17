import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { signup, setAuthTokens, fetchProfile } from '../services/api';
import { Briefcase, User as UserIcon } from 'lucide-react';

interface SignupPageProps {
  onSignupSuccess: (user: User) => void;
  onNavigateLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onNavigateLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = firstName && lastName && email && password.length >= 8 && (role === UserRole.STUDENT || role === UserRole.EMPLOYER);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await signup({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: role === UserRole.STUDENT ? 'STUDENT' : 'EMPLOYER',
        phone: phone || undefined,
        location: location || undefined,
      });
      setAuthTokens(res.access_token, res.refresh_token);
      const profile = await fetchProfile(res.access_token);
      onSignupSuccess(profile);
    } catch (e: any) {
      setError(e?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 p-6 text-center border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
          <p className="text-slate-500 mt-2">Join CareerAI to find jobs or hire talent</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="firstName">First name</label>
              <input id="firstName" placeholder="Alex" title="First name" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="lastName">Last name</label>
              <input id="lastName" placeholder="Johnson" title="Last name" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">Email</label>
              <input id="email" placeholder="you@example.com" title="Email" type="email" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">Password (min 8 chars)</label>
              <input id="password" placeholder="••••••••" title="Password" type="password" minLength={8} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <div className="relative">
                <select aria-label="Role" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                  <option value={UserRole.STUDENT}>Student (Job Seeker)</option>
                  <option value={UserRole.EMPLOYER}>Employer (Post Jobs)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="phone">Phone (optional)</label>
              <input id="phone" placeholder="+1 555 555 5555" title="Phone" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="location">Location (optional)</label>
            <input id="location" placeholder="City, Country" title="Location" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button onClick={handleSubmit} disabled={!canSubmit || loading} className={`w-full py-3 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-lg transition-colors flex justify-center items-center gap-2`}>
            {role === UserRole.STUDENT ? <UserIcon className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />} {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button className="text-indigo-600 hover:underline" onClick={onNavigateLogin}>Log in</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
