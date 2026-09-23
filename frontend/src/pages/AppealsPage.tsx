import React, { useState, useEffect, useCallback } from 'react';
import { Scale, Search, CheckCircle, XCircle } from 'lucide-react';
import { getAppeals, approveAppeal, rejectAppeal } from '../services/api';
import { useToast } from '../context/ToastContext';

const AppealsPage: React.FC = () => {
  const { showToast } = useToast();
  const [appeals, setAppeals] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionItem, setActionItem] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [actioning, setActioning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAppeals({ search: search || undefined, status: statusFilter !== 'All' ? statusFilter : undefined });
      setAppeals(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!actionItem || !response.trim()) { showToast('warning', 'Response Required', 'Please provide a response reason.'); return; }
    setActioning(true);
    try {
      if (action === 'approve') await approveAppeal(actionItem.id, response);
      else await rejectAppeal(actionItem.id, response);
      showToast('success', `Appeal ${action === 'approve' ? 'Approved' : 'Rejected'}`, `${actionItem.id} has been processed.`);
      setActionItem(null);
      setResponse('');
      load();
    } catch {
      showToast('error', 'Action Failed', 'Could not process the appeal.');
    } finally { setActioning(false); }
  };

  const statusBadge = (s: string) => {
    if (s === 'Approved') return 'badge-success';
    if (s === 'Rejected') return 'badge-danger';
    if (s === 'Under_Review') return 'badge-warn';
    return 'badge-info';
  };

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="section-title"><Scale size={20} className="text-teal-400" /> Appeals</h1>
          <p className="section-subtitle">{total} appeals — review contested AI moderation decisions</p>
        </div>
      </div>

      <div className="glass-card p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-8 text-sm" placeholder="Search appeals..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-40 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Under_Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="sentinel-table">
          <thead>
            <tr>
              <th>Appeal ID</th>
              <th>Content</th>
              <th>User</th>
              <th>Original Action</th>
              <th>Risk Score</th>
              <th>Appeal Reason</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-10 text-slate-500">Loading appeals...</td></tr>
            ) : appeals.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-slate-500">No appeals found.</td></tr>
            ) : appeals.map((a: any) => (
              <tr key={a.id}>
                <td><span className="font-mono text-xs text-teal-400">{a.id}</span></td>
                <td>
                  <span className="font-mono text-xs text-indigo-400">{a.content_id}</span>
                  {a.content && <p className="text-xs text-slate-400 truncate max-w-32 mt-0.5">{a.content.title}</p>}
                </td>
                <td><span className="text-xs font-mono text-slate-300">{a.user_id}</span></td>
                <td><span className="badge badge-danger text-xs">{a.original_action}</span></td>
                <td>
                  <span className={`text-xs font-bold ${a.original_risk_score >= 75 ? 'text-red-400' : a.original_risk_score >= 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {a.original_risk_score?.toFixed(0)} / 100
                  </span>
                </td>
                <td><p className="text-xs text-slate-300 max-w-48 truncate">{a.appeal_reason}</p></td>
                <td><span className={`badge ${statusBadge(a.status)}`}>{a.status.replace(/_/g, ' ')}</span></td>
                <td><span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span></td>
                <td>
                  {a.status === 'Pending' || a.status === 'Under_Review' ? (
                    <button className="btn btn-ghost btn-xs text-teal-400" onClick={() => { setActionItem(a); setResponse(''); }}>
                      Review
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {actionItem && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActionItem(null)}>
          <div className="modal-panel w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Review Appeal: <span className="text-teal-400 font-mono">{actionItem.id}</span></h2>
            <div className="bg-slate-800/50 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="badge badge-danger text-xs">Original: {actionItem.original_action}</span>
                <span className="text-xs text-slate-400">Risk: <strong className="text-red-400">{actionItem.original_risk_score?.toFixed(0)}/100</strong></span>
              </div>
              <p className="text-xs text-slate-300 font-semibold">User's Reason:</p>
              <p className="text-xs text-slate-400">{actionItem.appeal_reason}</p>
            </div>
            {actionItem.content && (
              <div className="bg-slate-900/50 rounded-xl p-3 max-h-28 overflow-y-auto">
                <p className="text-xs font-mono text-slate-300">{actionItem.content.body}</p>
              </div>
            )}
            <textarea
              className="input text-sm"
              placeholder="Enter admin response / decision rationale (required)..."
              rows={3}
              value={response}
              onChange={e => setResponse(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => handleAction('approve')} disabled={actioning || !response.trim()} className="btn btn-success flex-1">
                <CheckCircle size={14} /> Approve Appeal
              </button>
              <button onClick={() => handleAction('reject')} disabled={actioning || !response.trim()} className="btn btn-danger flex-1">
                <XCircle size={14} /> Reject Appeal
              </button>
            </div>
            <button onClick={() => setActionItem(null)} className="btn btn-ghost btn-sm w-full">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppealsPage;
