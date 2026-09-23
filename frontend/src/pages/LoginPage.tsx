import React, { useState } from 'react';
import { Shield, Lock, User, Key, ArrowRight, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { showToast('warning', 'Required Fields', 'Please enter both username and password.'); return; }
    setIsLoading(true);
    try {
      await login(username, password);
      showToast('success', 'Authentication Successful', 'Welcome to Sentinel AI Moderation Platform');
    } catch {
      showToast('error', 'Invalid Credentials', 'Please check your username and password.');
    } finally { setIsLoading(false); }
  };

  const quickLogin = (u: string, p: string) => { setUsername(u); setPassword(p); };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 gradient-bg">
      <div className="gradient-orb-1" />
      <div className="gradient-orb-2" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl" style={{ boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
            <ShieldCheck size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-100">Sentinel AI</h1>
          <p className="text-slate-400 text-sm mt-1">Enterprise Content Moderation Platform</p>
        </div>

        <div className="glass-card p-8 animate-slide-up">
          {/* Platform Stats Banner */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
            {[
              { label: 'Vectors', value: '6' },
              { label: 'Risk Score', value: '0–100' },
              { label: 'Auto Block', value: '✓' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-base font-black text-indigo-400">{value}</p>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Username</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  id="login-username"
                  className="input pl-9"
                  placeholder="admin"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Password</label>
              <div className="relative">
                <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  id="login-password"
                  className="input pl-9"
                  placeholder="admin123"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>
            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 text-sm mt-2"
            >
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</>
              ) : (
                <><Lock size={15} /> Sign In to Platform <ArrowRight size={15} className="ml-auto" /></>
              )}
            </button>
          </form>

          <div className="divider" />

          <div>
            <p className="text-xs text-slate-500 text-center mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="quick-login-admin"
                onClick={() => quickLogin('admin', 'admin123')}
                className="btn btn-ghost btn-sm text-xs"
              >
                <ShieldCheck size={13} className="text-emerald-400" /> admin / admin123
              </button>
              <button
                id="quick-login-security"
                onClick={() => quickLogin('security_lead', 'admin123')}
                className="btn btn-ghost btn-sm text-xs"
              >
                <Shield size={13} className="text-blue-400" /> security_lead
              </button>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex gap-2">
              <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/80">
                This is a demonstration platform. AI moderation detects <strong>Spam, Toxicity, Hate Speech, Inappropriate Content, Suspicious Links & PII</strong> using pattern matching.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Sentinel AI · Content Moderation Platform v1.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
