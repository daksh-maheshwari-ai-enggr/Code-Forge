import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, TrendingUp, TrendingDown, SlidersHorizontal } from 'lucide-react';
import { getUsers, adjustReputation } from '../services/api';
import { useToast } from '../context/ToastContext';
import RiskGauge from '../components/RiskGauge';

const TRUST_COLORS: Record<string, string> = {
  'High Trust': '#10b981', 'Normal': '#3b82f6', 'Low Trust': '#f59e0b', 'Restricted': '#ef4444'
};

const UsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        search: search || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined
      });
      setUsers(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [search, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const handleAdjust = async () => {
    if (!selectedUser || !delta || !reason.trim()) {
      showToast('warning', 'All Fields Required', 'Please enter delta and reason.');
      return;
    }
    setAdjusting(true);
    try {
      const res = await adjustReputation(selectedUser.id, parseInt(delta), reason);
      showToast('success', 'Reputation Updated', `${selectedUser.username}: ${res.data.previous_score} → ${res.data.new_score}`);
      setSelectedUser(null);
      setDelta('');
      setReason('');
      load();
    } catch {
      showToast('error', 'Update Failed', 'Could not adjust user reputation.');
    } finally { setAdjusting(false); }
  };

  // Invert trust score to show as risk (lower trust = higher display risk)
  const trustToRisk = (score: number) => 100 - score;

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="section-title"><Users size={20} className="text-blue-400" /> Users & Reputation</h1>
          <p className="section-subtitle">{total} users — dynamic trust scores and reputation management</p>
        </div>
      </div>

      <div className="glass-card p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-8 text-sm" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-44 text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="High Trust">High Trust</option>
          <option value="Normal">Normal</option>
          <option value="Low Trust">Low Trust</option>
          <option value="Restricted">Restricted</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-500">Loading users...</div>
        ) : users.map((u: any) => {
          const trustColor = TRUST_COLORS[u.trust_category] || '#6366f1';
          return (
            <div key={u.id} className="glass-card glass-card-hover p-5 space-y-4 cursor-pointer animate-fade-in" onClick={() => setSelectedUser(u)}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                     style={{ background: `${trustColor}20`, color: trustColor, border: `1px solid ${trustColor}30` }}>
                  {u.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-200 truncate">{u.username}</p>
                    <span className={`badge text-[9px]`} style={{ background: `${trustColor}15`, color: trustColor, border: `1px solid ${trustColor}25`, padding: '1px 7px' }}>
                      {u.trust_category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{u.id}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-black" style={{ color: trustColor }}>{u.trust_score}</p>
                  <p className="text-[10px] text-slate-500">Trust Score</p>
                </div>
              </div>

              {/* Trust Bar */}
              <div className="risk-bar-track">
                <div className="risk-bar-fill" style={{ width: `${u.trust_score}%`, background: trustColor }} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800/50 rounded-lg p-2">
                  <p className="text-sm font-bold text-emerald-400">{u.positive_contributions}</p>
                  <p className="text-[10px] text-slate-500">Positive</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2">
                  <p className="text-sm font-bold text-red-400">{u.violations}</p>
                  <p className="text-[10px] text-slate-500">Violations</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2">
                  <p className="text-sm font-bold text-amber-400">{u.reports_count}</p>
                  <p className="text-[10px] text-slate-500">Reports</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`badge ${u.account_status === 'Active' ? 'badge-success' : u.account_status === 'Banned' ? 'badge-danger' : 'badge-warn'}`}>
                  {u.account_status}
                </span>
                <button className="btn btn-ghost btn-xs text-indigo-400" onClick={e => { e.stopPropagation(); setSelectedUser(u); }}>
                  <SlidersHorizontal size={12} /> Adjust
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Reputation Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedUser(null)}>
          <div className="modal-panel w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Adjust Reputation: <span className="text-blue-400">{selectedUser.username}</span></h2>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50">
              <RiskGauge score={selectedUser.trust_score} size={80} label="Trust Score" />
              <div>
                <p className="text-sm text-slate-300">{selectedUser.trust_category}</p>
                <p className="text-xs text-slate-500">Current Score: {selectedUser.trust_score}/100</p>
                <p className="text-xs text-slate-500 mt-1">Violations: {selectedUser.violations} | Reports: {selectedUser.reports_count}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Score Delta (e.g. +10 or -15)</label>
              <input
                type="number"
                className="input text-sm"
                placeholder="-20 to +20"
                value={delta}
                onChange={e => setDelta(e.target.value)}
                min={-100} max={100}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Reason</label>
              <textarea className="input text-sm" placeholder="Manual reputation adjustment reason..." rows={2} value={reason} onChange={e => setReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdjust} disabled={adjusting || !delta || !reason.trim()} className="btn btn-primary flex-1">
                {adjusting ? 'Updating...' : 'Apply Adjustment'}
              </button>
              <button onClick={() => setSelectedUser(null)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
