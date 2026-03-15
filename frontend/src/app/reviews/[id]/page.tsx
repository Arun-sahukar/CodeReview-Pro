'use client';

import { useEffect, useState, use, useRef } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import { fetchReview, fetchComments } from '@/lib/api';
import { useUIStore } from '@/lib/stores';
import type { Review, Comment, AiFeedbackItem } from '@/lib/stores';

import { useRealtime } from '@/lib/useRealtime';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const CATEGORY_ICONS: Record<string, string> = {
  security: '🔒',
  performance: '⚡',
  style: '🎨',
  bug_risk: '🐛',
  best_practice: '✅',
};

const SEVERITY_ICONS: Record<string, string> = {
  error: '🔴',
  warning: '🟡',
  info: '🔵',
};

const USER_COLORS: Record<string, string> = {
  u1: '#8B5CF6', u2: '#06B6D4', u3: '#F59E0B', u4: '#EF4444', u5: '#10B981',
};

function timeAgo(dateStr: string) {
  const now = new Date('2026-03-14T22:00:00Z');
  const d = new Date(dateStr);
  const diffM = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffM < 60) return `${diffM}m ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

export default function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: reviewId } = use(params);
  const [review, setReview] = useState<Review | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const { activePanel, setActivePanel } = useUIStore();
  
  const { activeUsers, ydoc } = useRealtime(reviewId);
  const editorRef = useRef<any>(null);
  const bindingRef = useRef<any>(null);

  useEffect(() => {
    fetchReview(reviewId).then(setReview);
    fetchComments(reviewId).then(setComments);
  }, [reviewId]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    if (review) {
      const ytext = ydoc.getText('monaco');
      // Set initial content if Yjs is empty
      if (ytext.length === 0) {
        ytext.insert(0, review.code);
      }
      bindingRef.current = new MonacoBinding(
        ytext,
        editor.getModel(),
        new Set([editor]),
        null
      );
    }
  };

  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
    };
  }, []);

  if (!review) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 100px)' }}>
            <div className="skeleton" style={{ flex: 1 }} />
            <div className="skeleton" style={{ width: 360 }} />
          </div>
        </main>
      </div>
    );
  }

  const rootComments = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 2 }}>{review?.title || 'Unknown Review'}</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              by {review?.authorName || 'Unknown'} · <span className={`status-badge status-${review?.status || 'pending'}`}>{review?.status?.replace('_', ' ') || 'Pending'}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm">Request Changes</button>
            <button className="btn btn-primary btn-sm">✓ Approve</button>
          </div>
        </div>

        <div className="editor-layout">
          <div className="editor-panel">
            <div className="editor-toolbar">
              <div className="file-info">
                <span className="file-name">{review.fileName}</span>
                <span className="file-lang">{review.language}</span>
              </div>
              <div className="active-users">
                {activeUsers.map(u => (
                  <div
                    key={u.userId}
                    className="active-user-dot"
                    style={{ background: u.color }}
                    title={u.userName}
                  >
                    {u.userName.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                ))}
              </div>
            </div>
            <div className="editor-container">
              <MonacoEditor
                height="100%"
                language={review.language}
                theme="vs-dark"
                onMount={handleEditorDidMount}
                options={{
                  readOnly: false,
                  minimap: { enabled: true },
                  fontSize: 13.5,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  lineHeight: 22,
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true },
                }}
              />
            </div>
          </div>

          <div className="side-panel">
            <div className="panel-tabs">
              <button
                className={`panel-tab ${activePanel === 'ai' ? 'active' : ''}`}
                onClick={() => setActivePanel('ai')}
              >
                🤖 AI Feedback {review.aiFeedback && `(${review.aiFeedback.length})`}
              </button>
              <button
                className={`panel-tab ${activePanel === 'comments' ? 'active' : ''}`}
                onClick={() => setActivePanel('comments')}
              >
                💬 Comments ({comments.length})
              </button>
            </div>

            {activePanel === 'ai' && (
              <div className="ai-feedback-panel fade-in-up">
                <div className="ai-feedback-header">
                  <h3>
                    <span className="ai-badge">GPT-4o</span> Analysis
                  </h3>
                  <button className="btn btn-ghost btn-sm">↻ Re-analyze</button>
                </div>
                <div className="ai-feedback-list">
                  {review.aiFeedback ? (
                    review.aiFeedback.map((fb: AiFeedbackItem) => (
                      <div key={fb.id} className="ai-feedback-item">
                        <div className="feedback-header">
                          <span className={`category-tag cat-${fb.category}`}>
                            {CATEGORY_ICONS[fb.category]} {fb.category.replace('_', ' ')}
                          </span>
                          <span className={`severity-${fb.severity}`}>
                            {SEVERITY_ICONS[fb.severity]}
                          </span>
                          <span className="feedback-line">
                            L{fb.line}
                          </span>
                        </div>
                        <div className="feedback-message">{fb.message}</div>
                        <div className="feedback-suggestion">💡 {fb.suggestion}</div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state" style={{ padding: 40 }}>
                      <div className="empty-icon">✅</div>
                      <h3>No issues found</h3>
                      <p>AI analysis passed with no concerns</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePanel === 'comments' && (
              <div className="comments-panel fade-in-up">
                <div className="ai-feedback-header">
                  <h3>💬 Discussion</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{comments.length} comments</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {rootComments.map(c => (
                    <div key={c.id} className="comment-thread">
                      <div className="comment-line-badge">📍 Line {c.line}</div>
                      <div className="comment">
                        <div
                          className="comment-avatar"
                          style={{ background: USER_COLORS[c.authorId] || '#8B5CF6' }}
                        >
                          {c.authorName.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="comment-body">
                          <div className="comment-author">
                            {c.authorName}
                            <span className="comment-time">{timeAgo(c.createdAt)}</span>
                          </div>
                          <div className="comment-text">{c.content}</div>
                        </div>
                      </div>
                      {replies
                        .filter(r => r.parentId === c.id)
                        .map(reply => (
                          <div key={reply.id} className="comment comment-reply">
                            <div
                              className="comment-avatar"
                              style={{ background: USER_COLORS[reply.authorId] || '#06B6D4' }}
                            >
                              {reply.authorName.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div className="comment-body">
                              <div className="comment-author">
                                {reply.authorName}
                                <span className="comment-time">{timeAgo(reply.createdAt)}</span>
                              </div>
                              <div className="comment-text">{reply.content}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
                <div className="comment-input-area">
                  <textarea placeholder="Add a comment..." rows={1} />
                  <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Send</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
