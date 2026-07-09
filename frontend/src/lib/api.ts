'use client';

// ─── API Base URL ───────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// ─── Mock Data (used when backend is not running) ───────────
const MOCK_USERS = [
  { id: 'u1', email: 'alex@codereview.pro', name: 'Alex Chen', role: 'tech_lead', skills: ['typescript', 'javascript', 'react', 'node'], activeReviewCount: 2, avatarColor: '#8B5CF6', createdAt: '2026-01-15' },
  { id: 'u2', email: 'sara@codereview.pro', name: 'Sara Patel', role: 'developer', skills: ['typescript', 'python', 'rust'], activeReviewCount: 1, avatarColor: '#06B6D4', createdAt: '2026-01-20' },
  { id: 'u3', email: 'mike@codereview.pro', name: 'Mike Johnson', role: 'reviewer', skills: ['javascript', 'react', 'css'], activeReviewCount: 4, avatarColor: '#F59E0B', createdAt: '2026-02-01' },
  { id: 'u4', email: 'admin@codereview.pro', name: 'Admin User', role: 'admin', skills: [], activeReviewCount: 0, avatarColor: '#EF4444', createdAt: '2026-01-01' },
  { id: 'u5', email: 'emma@codereview.pro', name: 'Emma Wilson', role: 'developer', skills: ['python', 'go', 'kubernetes'], activeReviewCount: 3, avatarColor: '#10B981', createdAt: '2026-02-10' },
];

const MOCK_REVIEWS = [
  {
    id: 'r1',
    title: 'Add user authentication middleware',
    description: 'Implements JWT-based authentication with refresh token support',
    authorId: 'u2', authorName: 'Sara Patel',
    assignees: ['u1', 'u3'],
    status: 'in_review',
    language: 'typescript',
    fileName: 'auth-middleware.ts',
    code: `import { Request, Response, NextFunction } from 'express';\nimport jwt from 'jsonwebtoken';\n\ninterface AuthPayload {\n  userId: string;\n  role: string;\n  exp: number;\n}\n\nconst JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';\nconst REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-fallback';\n\nexport function authMiddleware(req: Request, res: Response, next: NextFunction) {\n  const token = req.headers.authorization?.split(' ')[1];\n\n  if (!token) {\n    return res.status(401).json({ error: 'No token provided' });\n  }\n\n  try {\n    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;\n    req['user'] = decoded;\n    next();\n  } catch (err) {\n    if (err.name === 'TokenExpiredError') {\n      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });\n    }\n    return res.status(403).json({ error: 'Invalid token' });\n  }\n}\n\nexport function requireRole(...roles: string[]) {\n  return (req: Request, res: Response, next: NextFunction) => {\n    const user = req['user'] as AuthPayload;\n    if (!user || !roles.includes(user.role)) {\n      return res.status(403).json({ error: 'Insufficient permissions' });\n    }\n    next();\n  };\n}\n\nexport async function refreshToken(req: Request, res: Response) {\n  const { refreshToken } = req.body;\n  if (!refreshToken) {\n    return res.status(400).json({ error: 'Refresh token required' });\n  }\n\n  try {\n    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as AuthPayload;\n    const newToken = jwt.sign(\n      { userId: decoded.userId, role: decoded.role },\n      JWT_SECRET,\n      { expiresIn: '15m' }\n    );\n    return res.json({ token: newToken });\n  } catch (err) {\n    return res.status(403).json({ error: 'Invalid refresh token' });\n  }\n}`,
    aiFeedback: [
      { id: 'af1', line: 11, category: 'security', severity: 'error', message: 'Hardcoded fallback secret is a security risk', suggestion: 'Use a mandatory environment variable and throw if not set in production' },
      { id: 'af2', line: 12, category: 'security', severity: 'error', message: 'Refresh secret uses weak fallback value', suggestion: 'Require REFRESH_SECRET env var and validate on startup' },
      { id: 'af3', line: 20, category: 'bug_risk', severity: 'warning', message: 'Missing null check — authorization header could be malformed', suggestion: 'Add validation for Bearer prefix and token format' },
      { id: 'af4', line: 35, category: 'best_practice', severity: 'info', message: 'Role check could use Set for O(1) lookup', suggestion: 'Convert roles array to Set: new Set(roles).has(user.role)' },
      { id: 'af5', line: 48, category: 'performance', severity: 'info', message: 'Consider caching decoded refresh tokens', suggestion: 'Use Redis to cache recently verified refresh tokens' },
      { id: 'af6', line: 5, category: 'style', severity: 'info', message: 'Interface could use readonly properties', suggestion: 'Add readonly modifier to AuthPayload properties' },
    ],
    createdAt: '2026-03-14T08:30:00Z',
    updatedAt: '2026-03-14T09:15:00Z',
  },
  {
    id: 'r2',
    title: 'Implement rate limiter service',
    description: 'Token bucket algorithm for API rate limiting',
    authorId: 'u5', authorName: 'Emma Wilson',
    assignees: ['u2'],
    status: 'pending',
    language: 'typescript',
    fileName: 'rate-limiter.ts',
    code: `export class RateLimiter {\n  private buckets = new Map<string, { tokens: number; lastRefill: number }>();\n\n  constructor(\n    private maxTokens: number = 100,\n    private refillRate: number = 10,\n    private windowMs: number = 60000\n  ) {}\n\n  tryConsume(key: string): boolean {\n    const now = Date.now();\n    let bucket = this.buckets.get(key);\n\n    if (!bucket) {\n      bucket = { tokens: this.maxTokens, lastRefill: now };\n      this.buckets.set(key, bucket);\n    }\n\n    const elapsed = now - bucket.lastRefill;\n    const refillAmount = Math.floor(elapsed / 1000) * this.refillRate;\n    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + refillAmount);\n    bucket.lastRefill = now;\n\n    if (bucket.tokens > 0) {\n      bucket.tokens--;\n      return true;\n    }\n    return false;\n  }\n\n  getRemainingTokens(key: string): number {\n    return this.buckets.get(key)?.tokens ?? this.maxTokens;\n  }\n}`,
    aiFeedback: [
      { id: 'af7', line: 2, category: 'performance', severity: 'warning', message: 'Map grows unbounded — no cleanup of stale entries', suggestion: 'Add periodic cleanup or use WeakRef / TTL-based eviction' },
      { id: 'af8', line: 20, category: 'bug_risk', severity: 'warning', message: 'Integer division may cause imprecise refill timing', suggestion: 'Use floating-point arithmetic and floor only the final token count' },
    ],
    createdAt: '2026-03-13T14:00:00Z',
    updatedAt: '2026-03-13T14:00:00Z',
  },
  {
    id: 'r3',
    title: 'Database connection pool manager',
    description: 'Manages MongoDB connection pooling with health checks',
    authorId: 'u1', authorName: 'Alex Chen',
    assignees: ['u5', 'u3'],
    status: 'approved',
    language: 'typescript',
    fileName: 'db-pool.ts',
    code: `import { EventEmitter } from 'events';\n\nexport class ConnectionPool extends EventEmitter {\n  private connections: any[] = [];\n  private idle: any[] = [];\n\n  constructor(private options: { maxConnections: number }) {\n    super();\n  }\n\n  async acquire(): Promise<any> {\n    if (this.idle.length > 0) return this.idle.pop();\n    return { id: Math.random().toString(36) };\n  }\n\n  release(conn: any) {\n    this.idle.push(conn);\n  }\n}`,
    aiFeedback: null,
    createdAt: '2026-03-12T11:00:00Z',
    updatedAt: '2026-03-14T07:00:00Z',
  },
  {
    id: 'r4',
    title: 'Fix CORS configuration for production',
    description: 'Updates CORS headers to properly handle credentials and preflight',
    authorId: 'u3', authorName: 'Mike Johnson',
    assignees: ['u1'],
    status: 'changes_requested',
    language: 'typescript',
    fileName: 'cors-config.ts',
    code: `const allowedOrigins = [\n  'https://codereview.pro',\n  process.env.DEV_ORIGIN\n].filter(Boolean);\n\nexport const corsConfig = {\n  origin: (origin, callback) => {\n    if (!origin || allowedOrigins.includes(origin)) {\n      callback(null, true);\n    } else {\n      callback(new Error('Not allowed by CORS'));\n    }\n  },\n  credentials: true,\n};`,
    aiFeedback: [
      { id: 'af9', line: 3, category: 'security', severity: 'warning', message: 'DEV_ORIGIN env var could allow any origin', suggestion: 'Only include DEV_ORIGIN when NODE_ENV is development' },
    ],
    createdAt: '2026-03-14T16:00:00Z',
    updatedAt: '2026-03-14T18:30:00Z',
  },
  {
    id: 'r5',
    title: 'WebSocket event handler refactor',
    description: 'Refactors WebSocket events to use typed event maps',
    authorId: 'u2', authorName: 'Sara Patel',
    assignees: ['u1', 'u5'],
    status: 'merged',
    language: 'typescript',
    fileName: 'ws-events.ts',
    code: `type EventMap = {\n  'review:join': { reviewId: string; userId: string };\n  'cursor:move': { reviewId: string; line: number; col: number };\n};\n\nexport function createTypedEmitter() {\n  const handlers = new Map<string, Set<Function>>();\n  return {\n    on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void) {\n      if (!handlers.has(event)) handlers.set(event, new Set());\n      handlers.get(event)!.add(handler);\n    },\n    emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {\n      handlers.get(event)?.forEach(fn => fn(data));\n    },\n  };\n}`,
    aiFeedback: null,
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-11T14:00:00Z',
  },
];

const MOCK_COMMENTS = [
  { id: 'c1', reviewId: 'r1', authorId: 'u1', authorName: 'Alex Chen', line: 11, content: "We should never have hardcoded fallback secrets, even for development. Let's use dotenv-safe to enforce required env vars.", resolved: false, parentId: null, createdAt: '2026-03-14T09:00:00Z' },
  { id: 'c2', reviewId: 'r1', authorId: 'u2', authorName: 'Sara Patel', line: 11, content: "Good point — I'll add a startup check that throws if secrets are missing in production.", resolved: false, parentId: 'c1', createdAt: '2026-03-14T09:05:00Z' },
  { id: 'c3', reviewId: 'r1', authorId: 'u3', authorName: 'Mike Johnson', line: 35, content: 'The Set optimization is a good idea. Also consider memoizing the set per endpoint.', resolved: false, parentId: null, createdAt: '2026-03-14T09:10:00Z' },
  { id: 'c4', reviewId: 'r4', authorId: 'u1', authorName: 'Alex Chen', line: 4, content: 'This needs an environment check. Wrap it in NODE_ENV === "development" condition.', resolved: false, parentId: null, createdAt: '2026-03-14T18:00:00Z' },
];

const MOCK_STATS = {
  total: 47,
  byStatus: { pending: 8, in_review: 12, changes_requested: 5, approved: 14, merged: 8 },
  avgTimeToReview: 4.2,
  aiIssuesFound: 156,
  weeklyActivity: [
    { day: 'Mon', reviews: 12, comments: 34, approvals: 8 },
    { day: 'Tue', reviews: 18, comments: 45, approvals: 12 },
    { day: 'Wed', reviews: 15, comments: 52, approvals: 14 },
    { day: 'Thu', reviews: 22, comments: 61, approvals: 18 },
    { day: 'Fri', reviews: 9, comments: 28, approvals: 6 },
    { day: 'Sat', reviews: 3, comments: 8, approvals: 2 },
    { day: 'Sun', reviews: 1, comments: 3, approvals: 1 },
  ],
  reviewerWorkload: [
    { name: 'Alex Chen', activeReviews: 2, avatarColor: '#8B5CF6' },
    { name: 'Sara Patel', activeReviews: 1, avatarColor: '#06B6D4' },
    { name: 'Mike Johnson', activeReviews: 4, avatarColor: '#F59E0B' },
    { name: 'Emma Wilson', activeReviews: 3, avatarColor: '#10B981' },
  ],
  aiCategories: { style: 12, security: 28, performance: 18, bug_risk: 15, best_practice: 9 },
  bottlenecks: [
    { reviewer: 'Mike Johnson', pendingReviews: 4, avgResponseTime: '6.5h' },
    { reviewer: 'Emma Wilson', pendingReviews: 3, avgResponseTime: '4.2h' },
  ],
};

// ─── API Functions with Fallback ────────────────────────────
async function apiFetch(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null; // Will trigger fallback to mock data
  }
}

export async function fetchReviews(status?: string) {
  const query = status ? `?status=${status}` : '';
  const data = await apiFetch(`/reviews${query}`);
  return data || MOCK_REVIEWS;
}

export async function fetchReview(id: string) {
  const data = await apiFetch(`/reviews/${id}`);
  return data || MOCK_REVIEWS.find(r => r.id === id) || MOCK_REVIEWS[0];
}

export async function fetchStats() {
  const data = await apiFetch('/reviews/stats');
  return data || MOCK_STATS;
}

export async function fetchComments(reviewId: string) {
  const data = await apiFetch(`/comments/${reviewId}`);
  return data || MOCK_COMMENTS.filter(c => c.reviewId === reviewId);
}

export async function fetchUsers() {
  const data = await apiFetch('/auth/users');
  return data || MOCK_USERS;
}

export async function loginUser(email: string, password: string) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data || { user: MOCK_USERS[0], token: 'demo-token' };
}

export async function analyzeCode(code: string, language: string) {
  const data = await apiFetch('/ai/analyze', {
    method: 'POST',
    body: JSON.stringify({ code, language }),
  });
  return data;
}

export async function updateReviewStatus(reviewId: string, status: string) {
  const data = await apiFetch(`/reviews/${reviewId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return data;
}

export async function addComment(reviewId: string, authorId: string, line: number, content: string) {
  const data = await apiFetch('/comments', {
    method: 'POST',
    body: JSON.stringify({ reviewId, authorId, line, content }),
  });
  return data;
}

export async function reanalyzeReview(reviewId: string) {
  const data = await apiFetch(`/ai/analyze/${reviewId}`, {
    method: 'POST',
  });
  return data;
}

export async function createReview(data: {
  title: string;
  description: string;
  authorId: string;
  fileName: string;
  code: string;
  language: string;
}) {
  const result = await apiFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result;
}

export { MOCK_REVIEWS, MOCK_USERS, MOCK_COMMENTS, MOCK_STATS };
