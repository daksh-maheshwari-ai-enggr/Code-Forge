import React, { useState, useEffect, useCallback } from 'react';
import { ScrollText, Search, Download, Filter } from 'lucide-react';
import { getAuditLogs, exportAuditLogs } from '../services/api';

const ACTION_COLORS: Record<string, string> = {
  AUTO_APPROVE: '#10b981', ADMIN_APPROVE: '#10b981', APPEAL_APPROVED: '#10b981',
  AUTO_BLOCK: '#ef4444', ADMIN_BLOCK: '#ef4444',
  SEND_TO_REVIEW: '#f59e0b',
  REPORT_RESOLVED: '#3b82f6', REPORT_REJECTED: '#64748b',
  APPEAL_REJECTED: '#ef4444',
  REPUTATION_CHANGED: '#8b5cf6',
};

const ACTOR_BADGE: Record<string, string> = {
  AI: 'badge-info', Admin: 'badge-success', System: 'badge-muted'
};

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        search: search || undefined,
        actor_type: actorFilter !== 'All' ? actorFilter : undefined,
        action: actionFilter !== 'All' ? actionFilter : undefined,
        limit: 50
      });
      setLogs(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [search, actorFilter, actionFilter]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async (fmt: string) => {
    setExporting(true);
    try {
      const res = await exportAuditLogs(fmt);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_ledger.${fmt}`;
      a.click();
    } catch {} finally { setExporting(false); }
  };

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="section-title"><ScrollText size={20} className="text-purple-400" /> Audit Ledger</h1>
          <p className="section-subtitle">{total} immutable audit records — complete compliance trail</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} disabled={exporting} className="btn btn-ghost btn-sm">
            <Download size={14} /> CSV
          </button>
          <button onClick={() => handleExport('json')} disabled={exporting} className="btn btn-ghost btn-sm">
            <Download size={14} /> JSON
          </button>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-40 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-8 text-sm" placeholder="Search logs, IDs, actors..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-32 text-sm" value={actorFilter} onChange={e => setActorFilter(e.target.value)}>
          <option value="All">All Actors</option>
          <option value="AI">AI Engine</option>
          <option value="Admin">Admin</option>
          <option value="System">System</option>
        </select>
        <select className="select w-48 text-sm" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="All">All Actions</option>
          <option value="AUTO_APPROVE">Auto Approve</option>
          <option value="AUTO_BLOCK">Auto Block</option>
          <option value="SEND_TO_REVIEW">Send to Review</option>
          <option value="ADMIN_APPROVE">Admin Approve</option>
          <option value="ADMIN_BLOCK">Admin Block</option>
          <option value="REPORT_RESOLVED">Report Resolved</option>
          <option value="REPORT_REJECTED">Report Rejected</option>
          <option value="APPEAL_APPROVED">Appeal Approved</option>
          <option value="APPEAL_REJECTED">Appeal Rejected</option>
          <option value="REPUTATION_CHANGED">Reputation Changed</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="sentinel-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Status Transition</th>
              <th>Reason</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-slate-500">Loading audit logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-slate-500">No audit logs found.</td></tr>
            ) : logs.map((log: any) => {
              const actionColor = ACTION_COLORS[log.action] || '#6366f1';
              return (
                <tr key={log.id}>
                  <td><span className="font-mono text-xs text-purple-400">{log.id}</span></td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className={`badge ${ACTOR_BADGE[log.actor_type] || 'badge-muted'}`}>{log.actor_type}</span>
                      <span className="text-[10px] text-slate-500">{log.actor_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-bold font-mono" style={{ color: actionColor }}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div>
                      <span className="text-xs text-slate-400">{log.target_type}</span>
                      <p className="font-mono text-xs text-indigo-300">{log.target_id}</p>
                    </div>
                  </td>
                  <td>
                    {log.previous_status || log.new_status ? (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="badge badge-muted text-[9px]">{log.previous_status || '—'}</span>
                        <span className="text-slate-600">→</span>
                        <span className="badge badge-info text-[9px]">{log.new_status || '—'}</span>
                      </div>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td>
                    <p className="text-xs text-slate-400 max-w-56 truncate" title={log.reason}>{log.reason || '—'}</p>
                  </td>
                  <td>
                    <p className="text-xs text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage;
