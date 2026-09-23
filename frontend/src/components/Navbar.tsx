import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, RefreshCw, LogOut, ChevronDown, X, Check, AlertTriangle, Info, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getNotifications, markAllNotificationsRead, resetDemoData } from '../services/api';

interface NavbarProps {
  onSearch?: (q: string) => void;
  onRefresh?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onRefresh }) => {
  const { admin, logout } = useAuth();
  const { showToast } = useToast();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [resetting, setResetting] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.items || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleReset = async () => {
    if (!confirm('Reset and reseed all demo data? This will clear existing records.')) return;
    setResetting(true);
    try {
      await resetDemoData();
      showToast('success', 'Demo Data Reset', 'Database reseeded with fresh sample records.');
      onRefresh?.();
    } catch {
      showToast('error', 'Reset Failed', 'Could not reset demo data.');
    } finally {
      setResetting(false);
    }
  };

  const notifIcon = (type: string) => {
    if (type === 'danger') return <AlertTriangle size={14} className="text-red-400" />;
    if (type === 'warning') return <AlertTriangle size={14} className="text-amber-400" />;
    if (type === 'success') return <Check size={14} className="text-emerald-400" />;
    return <Info size={14} className="text-indigo-400" />;
  };

  return (
    <header className="navbar">
      {/* Left: Page brand */}
      <div className="flex items-center gap-2 mr-auto">
        <Zap size={16} className="text-indigo-400" />
        <span className="text-sm font-semibold text-slate-300">Sentinel AI</span>
        <span className="text-slate-600 mx-1">·</span>
        <span className="text-xs text-slate-500">Enterprise Moderation Platform</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Reset Demo Data */}
        <button
          onClick={handleReset}
          disabled={resetting}
          className="btn btn-ghost btn-sm gap-2"
          title="Reset demo data"
          id="reset-demo-btn"
        >
          <RefreshCw size={14} className={resetting ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="btn btn-ghost btn-icon relative"
            id="notifications-btn"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-sentinel-bg">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 glass-card border-sentinel-border shadow-2xl z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <span className="text-sm font-semibold text-slate-200">Notifications</span>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>
                  )}
                  <button onClick={() => setNotifOpen(false)}><X size={14} className="text-slate-500" /></button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No notifications</p>
                ) : notifications.map((n: any) => (
                  <div key={n.id} className={`px-4 py-3 border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors ${!n.is_read ? 'bg-indigo-950/20' : ''}`}>
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex-shrink-0">{notifIcon(n.type)}</div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 btn btn-ghost btn-sm"
            id="admin-profile-btn"
          >
            <img
              src={admin?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&auto=format&fit=crop&q=80'}
              alt="Admin"
              className="w-7 h-7 rounded-full object-cover border border-slate-600"
            />
            <span className="hidden md:inline text-sm font-medium text-slate-300 max-w-[120px] truncate">
              {admin?.username || 'admin'}
            </span>
            <ChevronDown size={13} className="text-slate-500" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-52 glass-card shadow-2xl z-50 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/50">
                <p className="text-sm font-semibold text-slate-200 truncate">{admin?.full_name || 'Administrator'}</p>
                <p className="text-xs text-slate-500">{admin?.role || 'Security Lead'}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  id="logout-btn"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
