import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, KeyRound, Loader2 } from 'lucide-react';
import { authApi, User } from '../lib/auth';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'creds' | 'code'>('creds');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login(username, password);
      if (res.error) {
        setError(res.error);
      } else if (res.requireCode) {
        setStep('code');
      } else if (res.user) {
        onLogin(res.user);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.verifyCode(username, code);
      if (res.error) {
        setError(res.error);
      } else if (res.user) {
        onLogin(res.user);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans selection:bg-blue-500/30">
      <div className="w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-gray-800 flex flex-col items-center justify-center bg-gradient-to-b from-yellow-900/10 to-transparent relative overflow-hidden">
          {/* Gold Neon Glow Behind Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-500/20 blur-[40px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col items-center gap-2 mb-2 relative z-10">
            <img 
              src="/uploads/Wingmen_Vision.png" 
              alt="Logo" 
              className="w-48 h-auto object-contain drop-shadow-[0_0_25px_rgba(250,204,21,0.6)]" 
            />
          </div>
          <p className="text-sm text-gray-400 mt-1 relative z-10">Secure Unified Access Portal</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          {step === 'creds' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate'}
              </button>
              
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Demo Accounts: admin, president, vp, saa, monitoring
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5 text-center">
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-6">
                <Lock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <h3 className="text-orange-400 font-bold mb-1">Device Not Recognized</h3>
                <p className="text-xs text-gray-400">
                  Please contact the System Administrator to approve this device. Enter the 6-digit access code provided by the Admin below.
                </p>
              </div>
              
              <div>
                <div className="relative max-w-[200px] mx-auto">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-11 pr-4 text-white text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading || code.length < 6}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Device'}
              </button>
              <button 
                type="button"
                onClick={() => setStep('creds')}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                &larr; Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}