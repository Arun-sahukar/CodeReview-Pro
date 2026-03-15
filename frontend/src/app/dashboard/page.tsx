'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { fetchStats } from '@/lib/api';
import type { DashboardStats } from '@/lib/stores';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';

const COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#F43F5E', '#10B981'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header"><h1>Dashboard</h1></div>
          <div className="stats-grid">
            {[1, 2, 3, 4].map(i => <div key={i} className="stat-card skeleton" style={{ height: 120 }} />)}
          </div>
        </main>
      </div>
    );
  }

  const pieData = Object.entries(stats.aiCategories).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>📊 Dashboard</h1>
          <p>Review activity intelligence and team performance metrics</p>
        </div>

        {/* ─── Stat Cards ─────────────────────────────────── */}
        <div className="stats-grid">
          <div className="stat-card purple fade-in-up">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
          <div className="stat-card teal fade-in-up">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{stats.avgTimeToReview}h</div>
            <div className="stat-label">Avg Review Time</div>
          </div>
          <div className="stat-card amber fade-in-up">
            <div className="stat-icon">🤖</div>
            <div className="stat-value">{stats.aiIssuesFound}</div>
            <div className="stat-label">AI Issues Found</div>
          </div>
          <div className="stat-card rose fade-in-up">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{stats.byStatus.in_review}</div>
            <div className="stat-label">Active Reviews</div>
          </div>
        </div>

        {/* ─── Charts ─────────────────────────────────────── */}
        <div className="charts-grid">
          <div className="chart-card fade-in-up">
            <h3>📈 Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.weeklyActivity}>
                <defs>
                  <linearGradient id="gradReviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradComments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#6b6b80" fontSize={12} />
                <YAxis stroke="#6b6b80" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#1a1a28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0f5' }}
                />
                <Legend />
                <Area type="monotone" dataKey="reviews" stroke="#8B5CF6" fill="url(#gradReviews)" strokeWidth={2} />
                <Area type="monotone" dataKey="comments" stroke="#06B6D4" fill="url(#gradComments)" strokeWidth={2} />
                <Area type="monotone" dataKey="approvals" stroke="#10B981" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card fade-in-up">
            <h3>📊 Review Status</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#6b6b80" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b6b80" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{ background: '#1a1a28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0f5' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {statusData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card fade-in-up">
            <h3>🤖 AI Issues by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#6b6b80' }}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0f5' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card fade-in-up">
            <h3>👥 Reviewer Workload</h3>
            <div className="workload-list" style={{ padding: '8px 0' }}>
              {stats.reviewerWorkload.map((w) => (
                <div key={w.name} className="workload-item">
                  <div className="wl-avatar" style={{ background: w.avatarColor }}>
                    {w.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="wl-info">
                    <div className="wl-name">{w.name}</div>
                    <div className="wl-bar">
                      <div
                        className="wl-bar-fill"
                        style={{
                          width: `${(w.activeReviews / 5) * 100}%`,
                          background: w.activeReviews >= 4
                            ? 'linear-gradient(90deg, #F43F5E, #FB7185)'
                            : w.activeReviews >= 2
                            ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                            : 'linear-gradient(90deg, #10B981, #34D399)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="wl-count">{w.activeReviews}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Bottlenecks ────────────────────────────────── */}
        <div className="chart-card fade-in-up" style={{ marginBottom: 32 }}>
          <h3>⚠️ Review Bottlenecks</h3>
          <div className="bottleneck-list" style={{ marginTop: 16 }}>
            {stats.bottlenecks.map((b) => (
              <div key={b.reviewer} className="bottleneck-item">
                <div className="bl-info">
                  <div className="bl-avatar">⏳</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{b.reviewer}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Avg response: {b.avgResponseTime}</div>
                  </div>
                </div>
                <div className="bl-stats">
                  <div className="bl-count">{b.pendingReviews} pending</div>
                  <div className="bl-time">Needs attention</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
