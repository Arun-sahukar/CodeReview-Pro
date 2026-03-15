'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('alex@codereview.pro');
  const [password, setPassword] = useState('demo');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      login(data.user, data.token);
      router.push('/dashboard');
    } catch {
      // Demo: always succeeds
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <div className="auth-header">
          <div className="auth-logo">CR</div>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to CodeReview Pro</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? '⏳ Signing in...' : '🚀 Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account? <a href="/register">Sign up</a>
        </div>

        <div style={{ marginTop: 20, padding: 12, background: 'rgba(139,92,246,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--purple-400)', marginBottom: 4 }}>DEMO CREDENTIALS</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            alex@codereview.pro / any password
          </div>
        </div>
      </div>
    </div>
  );
}
