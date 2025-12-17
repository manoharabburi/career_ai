import React from 'react';
import { Bell, Lock, Eye, Trash2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        <div className="p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-slate-500" /> Notifications
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-slate-900">Email Alerts</p>
                   <p className="text-xs text-slate-500">Get notified about new job matches</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle-checkbox" />
             </div>
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-slate-900">Application Updates</p>
                   <p className="text-xs text-slate-500">Notify when application status changes</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle-checkbox" />
             </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-slate-500" /> Security
          </h3>
          <button className="text-indigo-600 text-sm font-medium hover:underline">Change Password</button>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
             <Eye className="w-5 h-5 text-slate-500" /> Privacy
          </h3>
          <div className="flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-slate-900">Profile Visibility</p>
                 <p className="text-xs text-slate-500">Allow employers to find you</p>
              </div>
              <select className="text-sm border-slate-200 rounded-lg p-1 border">
                 <option>Public</option>
                 <option>Private</option>
              </select>
           </div>
        </div>

        <div className="p-6 bg-red-50">
          <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </h3>
          <p className="text-xs text-red-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;