import React, { useState } from 'react';
import {
  X, ShieldAlert, ShieldCheck, Clock, User, FileText,
  AlertTriangle, Flame, Link, Eye, EyeOff, CheckCircle, XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import RiskGauge from './RiskGauge';
import { approveContent, blockContent } from '../services/api';
import { useToast } from '../context/ToastContext';

interface Snippet { category: string; term: string; severity: string; reason: string; }

interface ContentItem {
  id: string;
  title?: string;
  body: string;
  content_type: string;
  status: string;
  created_at: string;
  user: { id: string; username: string; trust_score: number; trust_category: string; violations?: number; positive_contributions?: number; };
  moderation: {
    overall_risk_score: number;
    risk_level: string;
    spam_score: number;
    toxicity_score: number;
    hate_speech_score: number;
    inappropriate_score: number;
    suspicious_link_score: number;
    pii_score: number;
    detected_categories: string[];
    flagged_snippets: Snippet[];
    ai_decision: string;
    admin_decision?: string;
    admin_reason?: string;
  };
}

interface Props {
  item: ContentItem;
  onClose: () => void;
  onAction: () => void;
}

const categoryMeta: Record<string, { label: string; color: string; fillClass: string }> = {
  spam_score:            { label: 'Spam',              color: '#8b5cf6', fillClass: 'risk-fill-spam' },
  toxicity_score:        { label: 'Toxicity',          color: '#ef4444', fillClass: 'risk-fill-high' },
  hate_speech_score:     { label: 'Hate Speech',       color: '#dc2626', fillClass: 'risk-fill-high' },
  inappropriate_score:   { label: 'Inappropriate',     color: '#f97316', fillClass: 'risk-fill-high' },
  suspicious_link_score: { label: 'Suspicious Links',  color: '#f59e0b', fillClass: 'risk-fill-medium' },
  pii_score:             { label: 'PII Exposure',      color: '#3b82f6', fillClass: 'risk-fill-blue' },
};

const severityClass: Record<string, string> = {
  Critical: 'snippet-critical',
  High: 'snippet-critical',
  Medium: 'snippet-high',
  Low: 'snippet-medium',
};

const ContentInspectorModal: React.FC<Props> = ({ item, onClose, onAction }) => {
  const { showToast } = useToast();
  const [action, setAction] = useState<'approve' | 'block' | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBody, setShowBody] = useState(true);
  const [showSnippets, setShowSnippets] = useState(true);

  const m = item.moderation;
  const riskColor = m.risk_level === 'HIGH' ? '#ef4444' : m.risk_level === 'MEDIUM' ? '#f59e0b' : '#10b981';

  const handleAction = async () => {
    if (!action) return;
    if (!reason.trim()) { showToast('warning', 'Reason Required', 'Please enter a reason for this action.'); return; }
    setLoading(true);
    try {
      if (action === 'approve') await approveContent(item.id, reason);
      else await blockContent(item.id, reason);
      showToast('success', action === 'approve' ? 'Content Approved' : 'Content Blocked', `${item.id} has been ${action === 'approve' ? 'approved' : 'blocked'}.`);
      onAction();
      onClose();
    } catch {
      showToast('error', 'Action Failed', 'Could not complete the moderation action.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert size={18} className="text-indigo-400" />
              <span className="text-xs font-mono text-slate-400">{item.id}</span>
              <span className={`badge ${m.risk_level === 'HIGH' ? 'badge-high' : m.risk_level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                {m.risk_level} RISK
              </span>
              <span className="badge badge-muted capitalize">{item.content_type}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">{item.title || 'Untitled Content'}</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon mt-1"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Risk */}
          <div className="flex items-center gap-6 p-4 rounded-xl" style={{ background: `${riskColor}0d`, border: `1px solid ${riskColor}25` }}>
            <RiskGauge score={m.overall_risk_score} size={90} label="Overall Risk" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black" style={{ color: riskColor }}>{m.overall_risk_score}</span>
                <span className="text-slate-400 text-sm">/ 100</span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{m.ai_decision.replace(/_/g, ' ')}</p>
              <p className="text-xs text-slate-400">
                {m.detected_categories.length > 0
                  ? `Detected: ${m.detected_categories.join(', ')}`
                  : 'No violations detected'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                <User size={12} />
                <span className="font-mono">{item.user.username}</span>
              </div>
              <div className="text-xs text-slate-500">Trust: <span style={{ color: item.user.trust_score >= 80 ? '#10b981' : item.user.trust_score >= 50 ? '#3b82f6' : item.user.trust_score >= 20 ? '#f59e0b' : '#ef4444' }}>{item.user.trust_score}/100</span></div>
              <div className="text-xs text-slate-500">{item.user.trust_category}</div>
            </div>
          </div>

          {/* 6 Category Score Bars */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200">AI Category Breakdown</h3>
              <span className="text-xs text-slate-500">6 Detection Vectors</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(categoryMeta).map(([key, meta]) => {
                const score = m[key as keyof typeof m] as number;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-300">{meta.label}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: score >= 75 ? '#ef4444' : score >= 35 ? '#f59e0b' : '#10b981' }}>
                        {Math.round(score)}
                      </span>
                    </div>
                    <div className="risk-bar-track">
                      <div
                        className={`risk-bar-fill ${meta.fillClass}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Body */}
          <div>
            <button
              className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2 w-full"
              onClick={() => setShowBody(!showBody)}
            >
              <FileText size={14} className="text-slate-400" />
              Content Body
              {showBody ? <ChevronUp size={14} className="ml-auto text-slate-500" /> : <ChevronDown size={14} className="ml-auto text-slate-500" />}
            </button>
            {showBody && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                {item.body}
              </div>
            )}
          </div>

          {/* Flagged Snippets */}
          {m.flagged_snippets && m.flagged_snippets.length > 0 && (
            <div>
              <button
                className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2 w-full"
                onClick={() => setShowSnippets(!showSnippets)}
              >
                <AlertTriangle size={14} className="text-amber-400" />
                Flagged Violations ({m.flagged_snippets.length})
                {showSnippets ? <ChevronUp size={14} className="ml-auto text-slate-500" /> : <ChevronDown size={14} className="ml-auto text-slate-500" />}
              </button>
              {showSnippets && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {m.flagged_snippets.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                      <span className={`${severityClass[s.severity] || 'snippet-low'} flex-shrink-0`}>{s.term}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-slate-300">{s.category}</span>
                          <span className={`badge badge-xs ${s.severity === 'Critical' || s.severity === 'High' ? 'badge-high' : s.severity === 'Medium' ? 'badge-medium' : 'badge-muted'}`} style={{ padding: '1px 6px', fontSize: '10px' }}>
                            {s.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{s.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin Decision */}
          {!m.admin_decision ? (
            <div className="border border-slate-700/50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">Admin Decision</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setAction('approve')}
                  className={`btn btn-sm flex-1 ${action === 'approve' ? 'btn-success' : 'btn-ghost'}`}
                >
                  <CheckCircle size={14} /> Approve
                </button>
                <button
                  onClick={() => setAction('block')}
                  className={`btn btn-sm flex-1 ${action === 'block' ? 'btn-danger' : 'btn-ghost'}`}
                >
                  <XCircle size={14} /> Block
                </button>
              </div>
              {action && (
                <div className="space-y-2 animate-fade-in">
                  <textarea
                    className="input text-sm"
                    placeholder={`Enter reason for ${action === 'approve' ? 'approval' : 'blocking'} (required)...`}
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <button
                    onClick={handleAction}
                    disabled={loading || !reason.trim()}
                    className={`btn w-full ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                  >
                    {loading ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : 'Block'}`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${m.admin_decision === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              {m.admin_decision === 'Approved' ? <ShieldCheck size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
              <div>
                <p className="text-sm font-semibold" style={{ color: m.admin_decision === 'Approved' ? '#10b981' : '#ef4444' }}>{m.admin_decision} by Admin</p>
                {m.admin_reason && <p className="text-xs text-slate-400">{m.admin_reason}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentInspectorModal;
