import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Search, Filter, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getModerationQueue } from '../services/api';
import ContentInspectorModal from '../components/ContentInspectorModal';

const RISK_COLORS: Record<string, string> = {
  HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981'
};

const ModerationQueuePage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(0);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getModerationQueue({
        search: search || undefined,
        risk_level: riskFilter !== 'All' ? riskFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        skip: page * limit,
        limit
      });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [search, riskFilter, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const getRiskFill = (score: number) => {
    if (score >= 75) return 'risk-fill-high';
    if (score >= 35) return 'risk-fill-medium';
    return 'risk-fill-low';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title"><ClipboardList size={20} className="text-indigo-400" /> Moderation Queue</h1>
          <p className="section-subtitle">{total} total content items — review AI decisions and take manual action</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-8 text-sm"
            placeholder="Search content, user, ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            id="mod-search"
          />
        </div>
        <select className="select w-36 text-sm" value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setPage(0); }} id="risk-filter">
          <option value="All">All Risks</option>
          <option value="HIGH">High Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="LOW">Low Risk</option>
        </select>
        <select className="select w-40 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} id="status-filter">
          <option value="All">All Statuses</option>
          <option value="Pending_Review">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="sentinel-table">
          <thead>
            <tr>
              <th>Content ID</th>
              <th>Title / Body</th>
              <th>User</th>
              <th>Risk Score</th>
              <th>Categories</th>
              <th>AI Decision</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-500">Loading moderation queue...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-500">No items found matching your filters.</td></tr>
            ) : items.map((item: any) => {
              const m = item.moderation || {};
              const riskColor = RISK_COLORS[m.risk_level] || '#10b981';
              return (
                <tr key={item.id} className="cursor-pointer" onClick={() => setSelected(item)}>
                  <td>
                    <span className="font-mono text-xs text-indigo-400">{item.id}</span>
                    <div className="text-[10px] text-slate-500 mt-0.5 capitalize">{item.content_type}</div>
                  </td>
                  <td className="max-w-xs">
                    <p className="text-xs font-medium text-slate-200 truncate">{item.title || 'Untitled'}</p>
                    <p className="text-xs text-slate-400 truncate-2 mt-0.5">{item.body}</p>
                  </td>
                  <td>
                    <p className="text-xs font-medium text-slate-300">{item.user?.username}</p>
                    <p className="text-[10px] text-slate-500">{item.user?.trust_category}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold" style={{ color: riskColor }}>{m.overall_risk_score?.toFixed(0)}</span>
                      <span className={`badge ${m.risk_level === 'HIGH' ? 'badge-high' : m.risk_level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>{m.risk_level}</span>
                    </div>
                    <div className="risk-bar-track w-20">
                      <div className={`risk-bar-fill ${getRiskFill(m.overall_risk_score)}`} style={{ width: `${m.overall_risk_score}%` }} />
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(m.detected_categories || []).slice(0, 3).map((cat: string, i: number) => (
                        <span key={i} className="badge badge-warn text-[9px]" style={{ padding: '1px 6px' }}>{cat}</span>
                      ))}
                      {(m.detected_categories || []).length > 3 && (
                        <span className="badge badge-muted text-[9px]" style={{ padding: '1px 6px' }}>+{m.detected_categories.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${m.ai_decision === 'AUTO_BLOCK' ? 'badge-high' : m.ai_decision === 'SEND_TO_REVIEW' ? 'badge-medium' : 'badge-low'}`}>
                      {m.ai_decision?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'Approved' ? 'badge-success' : item.status === 'Blocked' ? 'badge-danger' : 'badge-warn'}`}>
                      {item.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-xs" onClick={() => setSelected(item)} title="Inspect" id={`inspect-${item.id}`}>
                      <Eye size={13} /> Inspect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}</span>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={14} /> Prev
            </button>
            <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {selected && (
        <ContentInspectorModal
          item={selected}
          onClose={() => setSelected(null)}
          onAction={() => { load(); setSelected(null); }}
        />
      )}
    </div>
  );
};

export default ModerationQueuePage;
