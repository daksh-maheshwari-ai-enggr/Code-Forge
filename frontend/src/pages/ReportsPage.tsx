import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getReports, resolveReport, rejectReport } from '../services/api';
import { useToast } from '../context/ToastContext';

const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionItem, setActionItem] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [actioning, setActioning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReports({ search: search || undefined, status: statusFilter !== 'All' ? statusFilter : undefined });
      setReports(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (action: 'resolve' | 'reject') => {
    if (!actionItem) return;
    setActioning(true);
    try {
      if (action === 'resolve') await resolveReport(actionItem.id, notes);
      else await rejectReport(actionItem.id, notes);
      showToast('success', `Report ${action === 'resolve' ? 'Resolved' : 'Rejected'}`, `${actionItem.id} has been ${action === 'resolve' ? 'resolved' : 'rejected'}.`);
      setActionItem(null);
      setNotes('');
      load();
    } catch {
      showToast('error', 'Action Failed', 'Could not process the report action.');
    } finally { setActioning(false); }
  };

  const statusBadge = (s: string) => {
    if (s === 'Resolved') return 'badge-success';
    if (s === 'Rejected') return 'badge-muted';
    if (s === 'Under_Review') return 'badge-warn';
    if (s === 'Escalated') return 'badge-high';
    return 'badge-info';
  };

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="section-title"><Flag size={20} className="text-blue-400" /> Reports</h1>
          <p className="section-subtitle">{total} reports — investigate and resolve user-flagged content</p>
        </div>
      </div>

      <div className="glass-card p-4 flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-8 text-sm" placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-40 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Under_Review">Under Review</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
          <option value="Escalated">Escalated</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="sentinel-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Reason</th>
              <th>Content</th>
              <th>Reporter</th>
              <th>Risk Score</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-500">Loading reports...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-500">No reports found.</td></tr>
            ) : reports.map((r: any) => (
              <tr key={r.id}>
                <td><span className="font-mono text-xs text-blue-400">{r.id}</span></td>
                <td>
                  <p className="text-xs font-medium text-slate-200">{r.reason}</p>
                  {r.details && <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{r.details}</p>}
                </td>
                <td>
                  {r.content ? (
                    <div>
                      <span className="font-mono text-xs text-indigo-400">{r.content.id}</span>
                      <p className="text-xs text-slate-400 truncate max-w-36">{r.content.title}</p>
                    </div>
                  ) : <span className="text-slate-500 text-xs">N/A</span>}
                </td>
                <td><span className="text-xs font-mono text-slate-300">{r.reporter_user_id}</span></td>
                <td>
                  {r.content?.risk_score != null ? (
                    <span className={`text-xs font-bold ${r.content.risk_score >= 75 ? 'text-red-400' : r.content.risk_score >= 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {r.content.risk_score.toFixed(0)} / 100
                    </span>
                  ) : <span className="text-slate-500 text-xs">—</span>}
                </td>
                <td><span className={`badge ${statusBadge(r.status)}`}>{r.status.replace(/_/g, ' ')}</span></td>
                <td><span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span></td>
                <td>
                  {r.status === 'Pending' || r.status === 'Under_Review' ? (
                    <button className="btn btn-ghost btn-xs text-blue-400" onClick={() => { setActionItem(r); setNotes(''); }}>
                      <AlertTriangle size={12} /> Review
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

      {/* Action Modal */}
      {actionItem && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActionItem(null)}>
          <div className="modal-panel w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Review Report: <span className="text-blue-400 font-mono">{actionItem.id}</span></h2>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-300 mb-1">{actionItem.reason}</p>
              <p className="text-xs text-slate-400">{actionItem.details}</p>
            </div>
            <textarea
              className="input text-sm"
              placeholder="Enter admin notes / resolution reason..."
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => handleAction('resolve')} disabled={actioning} className="btn btn-success flex-1">
                <CheckCircle size={14} /> Resolve & Block Content
              </button>
              <button onClick={() => handleAction('reject')} disabled={actioning} className="btn btn-ghost flex-1">
                <XCircle size={14} /> Reject Report
              </button>
            </div>
            <button onClick={() => setActionItem(null)} className="btn btn-ghost btn-sm w-full">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
