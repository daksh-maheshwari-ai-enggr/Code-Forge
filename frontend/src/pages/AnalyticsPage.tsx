import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { getDashboardStats } from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs border-slate-700">
      <p className="text-slate-300 font-semibold mb-1">{label || payload[0]?.name}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(res => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const kpis = stats?.kpis || {};
  const riskDist = stats?.risk_distribution || [];
  const catData = (stats?.category_counts || []).map((c: any, i: number) => ({ ...c, fill: COLORS[i % COLORS.length] }));
  const trustDist = stats?.user_trust_distribution || [];

  // Synthesize a weekly trend line from kpis for illustration
  const trendData = [
    { day: 'Mon', approved: Math.round((kpis.approved || 80) * 0.7), blocked: Math.round((kpis.blocked || 20) * 0.6) },
    { day: 'Tue', approved: Math.round((kpis.approved || 80) * 0.85), blocked: Math.round((kpis.blocked || 20) * 0.8) },
    { day: 'Wed', approved: Math.round((kpis.approved || 80) * 0.9), blocked: Math.round((kpis.blocked || 20) * 0.9) },
    { day: 'Thu', approved: Math.round((kpis.approved || 80) * 1.1), blocked: Math.round((kpis.blocked || 20) * 1.1) },
    { day: 'Fri', approved: Math.round((kpis.approved || 80) * 0.95), blocked: Math.round((kpis.blocked || 20) * 0.7) },
    { day: 'Sat', approved: Math.round((kpis.approved || 80) * 0.6), blocked: Math.round((kpis.blocked || 20) * 0.5) },
    { day: 'Sun', approved: kpis.approved || 80, blocked: kpis.blocked || 20 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title text-2xl"><BarChart3 size={22} className="text-indigo-400" /> Analytics</h1>
        <p className="section-subtitle">Deep-dive metrics and moderation performance over time</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Analyzed', value: kpis.total_processed ?? 0, color: '#6366f1' },
          { label: 'Approval Rate', value: `${kpis.approval_rate ?? 0}%`, color: '#10b981' },
          { label: 'Auto-Block Rate', value: `${kpis.auto_block_rate ?? 0}%`, color: '#ef4444' },
          { label: 'Avg Risk Score', value: kpis.avg_risk_score ?? 0, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-5 text-center">
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Trend */}
      <div className="glass-card p-5">
        <h3 className="section-title mb-4"><TrendingUp size={16} className="text-indigo-400" /> Weekly Decision Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="Approved" />
            <Line type="monotone" dataKey="blocked"  stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} name="Blocked" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4"><Activity size={16} className="text-amber-400" /> Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {catData.map((d: any, i: number) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution Donut */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4"><PieIcon size={16} className="text-purple-400" /> Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {riskDist.map((_: any, i: number) => <Cell key={i} fill={['#10b981', '#f59e0b', '#ef4444'][i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {riskDist.map((d: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: ['#10b981', '#f59e0b', '#ef4444'][i] }} />
                {d.name}: <strong className="text-slate-200">{d.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Distribution Bar */}
      <div className="glass-card p-5">
        <h3 className="section-title mb-4"><BarChart3 size={16} className="text-blue-400" /> User Trust Segment Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: 'High Trust', color: '#10b981' },
            { label: 'Normal',     color: '#3b82f6' },
            { label: 'Low Trust',  color: '#f59e0b' },
            { label: 'Restricted', color: '#ef4444' },
          ].map(({ label, color }) => {
            const d = trustDist.find((t: any) => t.category === label);
            const count = d?.count || 0;
            const total = trustDist.reduce((a: number, b: any) => a + b.count, 0) || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={label} className="text-center p-4 rounded-xl" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                <p className="text-2xl font-black mb-1" style={{ color }}>{count}</p>
                <p className="text-xs text-slate-400 mb-2">{label}</p>
                <div className="risk-bar-track">
                  <div className="risk-bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{pct}% of users</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
