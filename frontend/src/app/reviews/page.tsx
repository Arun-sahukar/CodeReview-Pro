'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { fetchReviews } from '@/lib/api';
import type { Review } from '@/lib/stores';

const STATUS_COLORS: Record<string, string> = {
  pending: '#FBBF24',
  in_review: '#60A5FA',
  changes_requested: '#FB7185',
  approved: '#34D399',
  merged: '#A78BFA',
};

const FILTERS = ['all', 'pending', 'in_review', 'changes_requested', 'approved', 'merged'];

const USER_COLORS: Record<string, string> = {
  u1: '#8B5CF6', u2: '#06B6D4', u3: '#F59E0B', u4: '#EF4444', u5: '#10B981',
};

const USER_NAMES: Record<string, string> = {
  u1: 'Alex Chen', u2: 'Sara Patel', u3: 'Mike Johnson', u4: 'Admin', u5: 'Emma Wilson',
};

function timeAgo(dateStr: string) {
  const now = new Date('2026-03-14T22:00:00Z');
  const d = new Date(dateStr);
  const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (diffH < 1) return 'just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReviews().then(setReviews);
  }, []);

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.status === filter);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>📝 Code Reviews</h1>
            <p>{reviews.length} total reviews across your projects</p>
          </div>
          <button className="btn btn-primary">+ New Review</button>
        </div>

        <div className="filter-bar">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
              {f !== 'all' && (
                <span style={{ marginLeft: 4, opacity: 0.7 }}>
                  ({reviews.filter(r => r.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="review-list">
          {filtered.map((review, idx) => (
            <Link key={review.id} href={`/reviews/${review.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="review-card fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
                <div
                  className="review-status-indicator"
                  style={{ background: STATUS_COLORS[review.status] || '#8B5CF6' }}
                />
                <div className="review-body">
                  <div className="review-title">{review.title}</div>
                  <div className="review-desc">{review.description}</div>
                  <div className="review-meta">
                    <span>👤 {review.authorName}</span>
                    <span>📄 {review.fileName}</span>
                    <span>🕐 {timeAgo(review.updatedAt)}</span>
                    {review.aiFeedback && (
                      <span style={{ color: 'var(--purple-400)' }}>
                        🤖 {review.aiFeedback.length} AI issues
                      </span>
                    )}
                  </div>
                </div>
                <div className="review-right">
                  <span className={`status-badge status-${review.status}`}>
                    {review.status.replace('_', ' ')}
                  </span>
                  <div className="assignee-avatars">
                    {review.assignees.map(uid => (
                      <div
                        key={uid}
                        className="assignee-avatar"
                        style={{ background: USER_COLORS[uid] || '#8B5CF6' }}
                        title={USER_NAMES[uid]}
                      >
                        {(USER_NAMES[uid] || '?').split(' ').map(n => n[0]).join('')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
