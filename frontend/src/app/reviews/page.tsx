'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { fetchReviews, createReview } from '@/lib/api';
import { useAuthStore } from '@/lib/stores';
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
  const now = new Date();
  const d = new Date(dateStr);
  const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (diffH < 0) return 'just now';
  if (diffH < 1) return 'just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

interface NewReviewForm {
  title: string;
  description: string;
  fileName: string;
  language: string;
  code: string;
}

const INITIAL_FORM: NewReviewForm = {
  title: '',
  description: '',
  fileName: '',
  language: 'typescript',
  code: '',
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewReviewForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    fetchReviews().then(setReviews);
  }, []);

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.status === filter);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const newReview = await createReview({
        ...form,
        authorId: user.id,
      });
      if (newReview) {
        setShowModal(false);
        setForm(INITIAL_FORM);
        router.push(`/reviews/${newReview._id || newReview.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>📝 Code Reviews</h1>
            <p>{reviews.length} total reviews across your projects</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Review
          </button>
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
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No reviews found</h3>
              <p>Create a new review to get started</p>
            </div>
          ) : (
            filtered.map((review, idx) => (
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
            ))
          )}
        </div>
      </main>

      {/* New Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Review</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateReview}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="e.g., Add user authentication"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Brief description of the changes..."
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>File Name</label>
                  <input
                    type="text"
                    placeholder="e.g., auth.ts"
                    value={form.fileName}
                    onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Code</label>
                <textarea
                  placeholder="Paste your code here..."
                  rows={8}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
