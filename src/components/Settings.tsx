import React, { useState } from 'react';
import { authApi, User } from '../lib/auth';
import { KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Settings({ user }: { user: User }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPass !== confirmPass) {
      setStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    if (newPass.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    try {
      const res = await authApi.changePassword(user.username, oldPass, newPass);
      if (res.error) {
        setStatus({ type: 'error', message: res.error });
      } else {
        setStatus({ type: 'success', message: 'Password updated successfully. This device remains authorized.' });
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Account Settings</h2>
        <p className="text-sm text-gray-400">Manage your security credentials.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-800/50 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white">Change Password</h3>
        </div>
        
        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg text-sm text-gray-300">
            <strong>Security Notice:</strong> Changing your password will update your credentials. If you log in from an unfamiliar device, you will still be locked out and require a new access code from the Administrator.
          </div>

          {status && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm ${
              status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'
            }`}>
              {status.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
              <input 
                type="password" 
                value={oldPass}
                onChange={e => setOldPass(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">New Password</label>
              <input 
                type="password" 
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
