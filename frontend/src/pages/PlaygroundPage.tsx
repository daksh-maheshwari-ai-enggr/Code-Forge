import React, { useState, useEffect } from 'react';
import {
  FlaskConical, Send, Loader2, ShieldAlert, ShieldCheck, Clock,
  AlertTriangle, Zap, RotateCcw, ChevronDown, ChevronUp, Clipboard
} from 'lucide-react';
import { analyzeText, submitContent } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import { useToast } from '../context/ToastContext';

const TEMPLATES = [
  { label: 'Hate Speech', text: 'These subhuman immigrants are genetic trash, we need ethnic cleansing to eradicate these people from our land.' },
  { label: 'Phishing Link', text: 'Your account is suspended! Verify now: http://192.168.1.1/login-verify/secure-auth or visit https://account-update.xyz for security check.' },
  { label: 'PII Exposure', text: 'Please process my refund to card 4532-8921-7890-1234. My SSN is 012-34-5678 and email is john.doe@gmail.com, phone (415) 555-8921.' },
  { label: 'Crypto Spam', text: 'CONGRATULATIONS YOU WON FREE BITCOIN!!! CLAIM YOUR CRYPTO AIRDROP NOW!!! 100% risk free guaranteed profit!! telegram me @crypto_king!!!' },
  { label: 'Toxic Comment', text: 'You are a complete pathetic loser and an idiot. Shut the fuck up before I find you and beat the shit out of you.' },
  { label: 'Legit Content', text: 'We migrated our backend from a 40-service microservices architecture to a modular FastAPI monolith. Throughput improved by 300% while reducing operational complexity significantly.' },
];

const categoryMeta: Record<string, { label: string; color: string; fillClass: string }> = {
  spam_score:            { label: 'Spam Detection',    color: '#8b5cf6', fillClass: 'risk-fill-spam' },
  toxicity_score:        { label: 'Toxicity',          color: '#ef4444', fillClass: 'risk-fill-high' },
  hate_speech_score:     { label: 'Hate Speech',       color: '#dc2626', fillClass: 'risk-fill-high' },
  inappropriate_score:   { label: 'Inappropriate',     color: '#f97316', fillClass: 'risk-fill-high' },
  suspicious_link_score: { label: 'Suspicious Links',  color: '#f59e0b', fillClass: 'risk-fill-medium' },
  pii_score:             { label: 'PII Exposure',      color: '#3b82f6', fillClass: 'risk-fill-blue' },
};

const PlaygroundPage: React.FC = () => {
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSnippets, setShowSnippets] = useState(true);

  const handleAnalyze = async () => {
    if (!text.trim()) { showToast('warning', 'Input Required', 'Please enter some text to analyze.'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeText(text.trim());
      setResult(res.data);
    } catch {
      showToast('error', 'Analysis Failed', 'Could not connect to the AI engine.');
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!text.trim() || !result) return;
    setSaving(true);
    try {
      const res = await submitContent({ body: text.trim(), title: 'Playground Submission', content_type: 'message' });
      showToast('success', 'Content Submitted', `Saved as ${res.data.content_id} — Status: ${res.data.status}`);
    } catch {
      showToast('error', 'Submit Failed', 'Could not save to moderation queue.');
    } finally { setSaving(false); }
  };

  const decisionConfig = result ? {
    AUTO_APPROVE: { label: 'AUTO APPROVE', color: '#10b981', Icon: ShieldCheck, bg: 'bg-emerald-500/10 border-emerald-500/25' },
    SEND_TO_REVIEW: { label: 'SEND TO REVIEW', color: '#f59e0b', Icon: Clock, bg: 'bg-amber-500/10 border-amber-500/25' },
    AUTO_BLOCK: { label: 'AUTO BLOCK', color: '#ef4444', Icon: ShieldAlert, bg: 'bg-red-500/10 border-red-500/25' },
  }[result.ai_decision as string] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title text-2xl"><FlaskConical size={22} className="text-indigo-400" /> AI Moderation Playground</h1>
        <p className="section-subtitle">Submit any text to instantly analyze it across all 6 detection vectors and see the real-time risk score.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Input */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200">Content Input</h3>
              <button
                onClick={() => { setText(''); setResult(null); }}
                className="btn btn-ghost btn-xs"
              >
                <RotateCcw size={12} /> Clear
              </button>
            </div>
            <textarea
              className="input text-sm font-mono"
              placeholder="Paste or type content here to analyze... (supports text with links, emails, phone numbers, etc.)"
              rows={8}
              value={text}
              onChange={e => setText(e.target.value)}
              id="playground-input"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-500">{text.length} characters</span>
              {result && (
                <button onClick={handleSubmit} disabled={saving} className="btn btn-ghost btn-xs text-indigo-400">
                  {saving ? <Loader2 size={11} className="animate-spin" /> : <Clipboard size={11} />}
                  Save to Queue
                </button>
              )}
            </div>
          </div>

          {/* Templates */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Test Templates</h3>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.label}
                  onClick={() => { setText(t.text); setResult(null); }}
                  className="btn btn-ghost btn-sm text-left justify-start text-xs"
                  id={`template-${t.label.toLowerCase().replace(/ /g, '-')}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="btn btn-primary w-full"
            id="analyze-btn"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Analyzing across 6 vectors...</>
            ) : (
              <><Zap size={15} /> Run AI Analysis</>
            )}
          </button>
        </div>

        {/* Right — Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="glass-card p-10 flex flex-col items-center justify-center text-center h-full min-h-64">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <FlaskConical size={28} className="text-indigo-400" />
              </div>
              <p className="text-slate-300 font-semibold">Ready to Analyze</p>
              <p className="text-slate-500 text-sm mt-1">Enter content and click Run AI Analysis to see risk scores, category breakdown, and flagged snippets.</p>
            </div>
          )}

          {loading && (
            <div className="glass-card p-10 flex flex-col items-center justify-center h-full min-h-64">
              <Loader2 size={36} className="text-indigo-400 animate-spin mb-4" />
              <p className="text-slate-300 font-semibold">Scanning content...</p>
              <p className="text-slate-500 text-sm mt-1">Running 6 AI detection vectors</p>
              <div className="flex gap-2 mt-4">
                {['Spam', 'Toxicity', 'Hate', 'NSFW', 'Links', 'PII'].map((cat, i) => (
                  <span key={cat} className="badge badge-info text-[10px]" style={{ animationDelay: `${i * 0.1}s` }}>{cat}</span>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">
              {/* Decision Banner */}
              {decisionConfig && (
                <div className={`flex items-center gap-4 p-4 rounded-xl border ${decisionConfig.bg}`}>
                  <decisionConfig.Icon size={28} style={{ color: decisionConfig.color }} />
                  <div>
                    <p className="text-lg font-black" style={{ color: decisionConfig.color }}>{decisionConfig.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{result.explanation}</p>
                  </div>
                  <RiskGauge score={result.overall_risk_score} size={70} showLabel={false} />
                </div>
              )}

              {/* Category Scores */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Detection Vector Scores</h3>
                <div className="space-y-3">
                  {Object.entries(categoryMeta).map(([key, meta]) => {
                    const score = result[key] as number;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-300">{meta.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold ${score >= 75 ? 'text-red-400' : score >= 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {score.toFixed(0)}
                            </span>
                            {score >= 35 && <AlertTriangle size={11} className={score >= 75 ? 'text-red-400' : 'text-amber-400'} />}
                          </div>
                        </div>
                        <div className="risk-bar-track">
                          <div className={`risk-bar-fill ${meta.fillClass}`} style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flagged Snippets */}
              {result.flagged_snippets?.length > 0 && (
                <div className="glass-card p-5">
                  <button
                    className="flex items-center justify-between w-full text-sm font-semibold text-slate-200 mb-3"
                    onClick={() => setShowSnippets(!showSnippets)}
                  >
                    <span><AlertTriangle size={14} className="inline mr-1 text-amber-400" />Flagged Violations ({result.flagged_snippets.length})</span>
                    {showSnippets ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </button>
                  {showSnippets && (
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {result.flagged_snippets.map((s: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/40">
                          <span className={`${s.severity === 'Critical' || s.severity === 'High' ? 'snippet-critical' : s.severity === 'Medium' ? 'snippet-high' : 'snippet-medium'} flex-shrink-0`}>
                            {s.term.length > 40 ? s.term.slice(0, 40) + '…' : s.term}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-xs font-semibold text-slate-300">{s.category}</span>
                              <span className={`badge ${s.severity === 'Critical' ? 'badge-high' : s.severity === 'High' ? 'badge-high' : s.severity === 'Medium' ? 'badge-medium' : 'badge-muted'}`} style={{ padding: '1px 5px', fontSize: '9px' }}>{s.severity}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-tight">{s.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaygroundPage;
