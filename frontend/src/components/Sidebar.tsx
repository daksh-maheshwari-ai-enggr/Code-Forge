import React, { useState } from 'react';
import {
  LayoutDashboard, Shield, ClipboardList, Flag, Scale, Users,
  ScrollText, BarChart3, FlaskConical, ChevronLeft, ChevronRight,
  ShieldCheck, AlertTriangle, Clock
} from 'lucide-react';

const navItems = [
  { id: 'dashboard',   label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'moderation',  label: 'Moderation Queue',  icon: ClipboardList,  badge: 'queue' },
  { id: 'reports',     label: 'Reports',            icon: Flag,           badge: 'reports' },
  { id: 'appeals',     label: 'Appeals',            icon: Scale,          badge: 'appeals' },
  { id: 'users',       label: 'Users & Reputation', icon: Users },
  { id: 'audit',       label: 'Audit Logs',         icon: ScrollText },
  { id: 'analytics',   label: 'Analytics',          icon: BarChart3 },
  { id: 'playground',  label: 'AI Playground',      icon: FlaskConical },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  stats?: { pending_review?: number; open_reports?: number; open_appeals?: number };
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, stats }) => {
  const [collapsed, setCollapsed] = useState(false);

  const getBadgeCount = (badge?: string) => {
    if (!badge || !stats) return null;
    if (badge === 'queue') return stats.pending_review || 0;
    if (badge === 'reports') return stats.open_reports || 0;
    if (badge === 'appeals') return stats.open_appeals || 0;
    return null;
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sentinel-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <ShieldCheck size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-slate-100 leading-tight">Sentinel AI</p>
            <p className="text-xs text-slate-500 leading-tight">Content Moderation</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const count = getBadgeCount(badge);
          const isActive = currentPage === id;
          return (
            <div
              key={id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(id)}
              title={collapsed ? label : undefined}
            >
              <Icon size={17} className={`sidebar-icon flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm">{label}</span>
                  {count !== null && count > 0 && (
                    <span className="bg-indigo-600/80 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {count}
                    </span>
                  )}
                </>
              )}
              {collapsed && count !== null && count > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Status indicator */}
      {!collapsed && (
        <div className="px-4 py-3 mx-2 mb-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-xs text-emerald-400 font-medium">AI Engine Active</span>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="border-t border-sentinel-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-ghost btn-sm w-full justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
