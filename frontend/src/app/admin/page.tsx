'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { fetchUsers } from '@/lib/api';

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  skills: string[];
  activeReviewCount: number;
  avatarColor: string;
  createdAt: string;
}

const ROLES = ['developer', 'reviewer', 'tech_lead', 'admin'];

export default function AdminPage() {
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>👥 Team & Roles</h1>
            <p>Manage team members, roles, and permissions</p>
          </div>
          <button className="btn btn-primary">+ Invite Member</button>
        </div>

        {/* ─── Stats ────────────────────────────────── */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card purple fade-in-up">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Team Members</div>
          </div>
          <div className="stat-card teal fade-in-up">
            <div className="stat-value">{users.filter(u => u.role === 'developer').length}</div>
            <div className="stat-label">Developers</div>
          </div>
          <div className="stat-card amber fade-in-up">
            <div className="stat-value">{users.filter(u => u.role === 'reviewer').length}</div>
            <div className="stat-label">Reviewers</div>
          </div>
          <div className="stat-card rose fade-in-up">
            <div className="stat-value">{users.filter(u => u.role === 'tech_lead' || u.role === 'admin').length}</div>
            <div className="stat-label">Leads & Admins</div>
          </div>
        </div>

        {/* ─── Users Table ──────────────────────────── */}
        <div className="card fade-in-up">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Skills</th>
                <th>Active Reviews</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: user.avatarColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: 500 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{user.email}</td>
                  <td>
                    <select
                      className="role-select"
                      value={user.role}
                      onChange={() => {}}
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {user.skills.length > 0 ? user.skills.map(s => (
                        <span key={s} className="category-tag cat-best_practice">{s}</span>
                      )) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{user.activeReviewCount}</span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── Permissions Info ──────────────────────── */}
        <div className="card fade-in-up" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>🔐 Role Permissions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            {[
              { role: 'Developer', perms: ['Submit reviews', 'Comment on code', 'View AI feedback'], color: '#06B6D4' },
              { role: 'Reviewer', perms: ['All developer perms', 'Approve/reject reviews', 'Resolve comments'], color: '#F59E0B' },
              { role: 'Tech Lead', perms: ['All reviewer perms', 'View dashboards', 'Manage assignments'], color: '#8B5CF6' },
              { role: 'Admin', perms: ['All permissions', 'Manage users & roles', 'System settings'], color: '#EF4444' },
            ].map(p => (
              <div
                key={p.role}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-glass)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 10, color: p.color }}>
                  {p.role}
                </div>
                {p.perms.map(pm => (
                  <div key={pm} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ color: 'var(--emerald-400)' }}>✓</span> {pm}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
