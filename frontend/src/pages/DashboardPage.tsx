import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard, ShieldAlert, ShieldCheck, Clock, AlertTriangle,
  BarChart3, Flag, Scale, Users, TrendingUp, TrendingDown, Activity, Zap
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getDashboardStats } from '../services/api';

const KPICard = ({ title, value, sub, accent, Icon, trend }: any) => (
  <div className={`kpi-card ${accent} animate-fade-in`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-100">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}
           style={{ background: `rgba(${accent === 'emerald' ? '16,185,129' : accent === 'red' ? '239,68,68' : accent === 'amber' ? '245,158,11' : accent === 'blue' ? '59,130,246' : accent === 'purple' ? '139,92,246' : '99,102,241'},0.15)` }}>
        <Icon size={20} style={{ color: accent === 'emerald' ? '#10b981' : accent === 'red' ? '#ef4444' : accent === 'amber' ? '#f59e0b' : accent === 'blue' ? '#3b82f6' : accent === 'purple' ? '#8b5cf6' : '#6366f1' }} />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        <span>{Math.abs(trend)}% from last period</span>
      </div>
    )}
  </div>
);

const RCOLORS = ['#10b981', '#f59e0b', '#ef4444'];
const CCOLORS = ['#8b5cf6', '#ef4444', '#dc2626', '#f97316', '#f59e0b', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-slate-300 font-semibold mb-1">{label || payload[0]?.name}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name || 'Count'}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch { } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  const kpis = stats?.kpis || {};
  const categoryData = (stats?.category_counts || []).map((c: any, i: number) => ({ ...c, fill: CCOLORS[i % CCOLORS.length] }));
  const auditFeed = stats?.recent_audit_feed || [];
  const trustData = stats?.user_trust_distribution || [];

  const actionColor = (action: string) => {
    if (action?.includes('BLOCK')) return '#ef4444';
    if (action?.includes('APPROVE')) return '#10b981';
    if (action?.includes('REVIEW')) return '#f59e0b';
    if (action?.includes('REPORT')) return '#3b82f6';
    if (action?.includes('APPEAL')) return '#8b5cf6';
    return '#6366f1';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <LayoutDashboard size={22} className="text-indigo-400" />
          Moderation Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">Real-time AI content moderation overview and key performance indicators</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Processed" value={kpis.total_processed ?? 0} sub="Content items analyzed" accent="accent" Icon={ShieldAlert} />
        <KPICard title="Auto Approved" value={kpis.approved ?? 0} sub={`${kpis.approval_rate ?? 0}% approval rate`} accent="emerald" Icon={ShieldCheck} trend={2.4} />
        <KPICard title="Auto Blocked" value={kpis.blocked ?? 0} sub={`${kpis.auto_block_rate ?? 0}% block rate`} accent="red" Icon={AlertTriangle} />
        <KPICard title="Pending Review" value={kpis.pending_review ?? 0} sub="Awaiting human moderator" accent="amber" Icon={Clock} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Avg Risk Score" value={kpis.avg_risk_score ?? 0} sub="out of 100" accent="purple" Icon={Activity} />
        <KPICard title="Open Reports" value={kpis.open_reports ?? 0} sub="Require investigation" accent="blue" Icon={Flag} />
        <KPICard title="Open Appeals" value={kpis.open_appeals ?? 0} sub="Awaiting decision" accent="teal" Icon={Scale} />
        <KPICard title="Total Users" value={trustData.reduce((a: number, b: any) => a + b.count, 0)} sub="Tracked accounts" accent="rose" Icon={Users} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Distribution Pie */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4"><BarChart3 size={16} className="text-indigo-400" /> Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={stats?.risk_distribution || []}
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {(stats?.risk_distribution || []).map((_: any, i: number) => (
                  <Cell key={i} fill={RCOLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {(stats?.risk_distribution || []).map((d: any, i: number) => (
              <div key={i} className="flex items-center gap-1 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: RCOLORS[i] }} />
                {d.name?.split(' ')[0]}: <strong className="text-slate-200">{d.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="glass-card p-5 col-span-2">
          <h3 className="section-title mb-4"><AlertTriangle size={16} className="text-amber-400" /> Violations by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {categoryData.map((d: any, i: number) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Trust + Audit Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Trust Distribution */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4"><Users size={16} className="text-blue-400" /> User Trust Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'High Trust', key: 'High Trust', color: '#10b981' },
              { label: 'Normal',     key: 'Normal',     color: '#3b82f6' },
              { label: 'Low Trust',  key: 'Low Trust',  color: '#f59e0b' },
              { label: 'Restricted', key: 'Restricted', color: '#ef4444' },
            ].map(({ label, key, color }) => {
              const d = trustData.find((t: any) => t.category === key);
              const count = d?.count || 0;
              const total = trustData.reduce((a: number, b: any) => a + b.count, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color }}>{label}</span>
                    <span className="text-xs text-slate-400">{count} users · {pct}%</span>
                  </div>
                  <div className="risk-bar-track">
                    <div className="risk-bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Audit Feed */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4"><Activity size={16} className="text-indigo-400" /> Live Activity Feed</h3>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {auditFeed.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No recent activity</p>
            ) : auditFeed.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-700/30 last:border-0">
                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: actionColor(a.action) }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-200">{a.actor}</span>
                    {' → '}<span style={{ color: actionColor(a.action) }}>{a.action.replace(/_/g, ' ')}</span>
                    {' '}<span className="text-slate-500 font-mono">{a.target}</span>
                  </p>
                  {a.reason && <p className="text-xs text-slate-500 mt-0.5 truncate">{a.reason}</p>}
                </div>
                <span className="text-[10px] text-slate-600 flex-shrink-0">
                  {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
