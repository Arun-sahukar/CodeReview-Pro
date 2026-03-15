// In-memory user store (replace with MongoDB in production)
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'developer' | 'reviewer' | 'tech_lead' | 'admin';
  skills: string[];
  activeReviewCount: number;
  avatarColor: string;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  assignees: string[];
  status: 'pending' | 'in_review' | 'changes_requested' | 'approved' | 'merged';
  language: string;
  fileName: string;
  code: string;
  aiFeedback: AiFeedbackItem[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiFeedbackItem {
  id: string;
  line: number;
  category: 'style' | 'security' | 'performance' | 'bug_risk' | 'best_practice';
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestion: string;
}

export interface CommentRecord {
  id: string;
  reviewId: string;
  authorId: string;
  authorName: string;
  line: number;
  content: string;
  resolved: boolean;
  parentId: string | null;
  createdAt: string;
}

const AVATAR_COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#EC4899', '#3B82F6'];

// Seed data
export const users: UserRecord[] = [
  {
    id: 'u1',
    email: 'alex@codereview.pro',
    name: 'Alex Chen',
    passwordHash: '$2a$10$dummyhash1',
    role: 'tech_lead',
    skills: ['typescript', 'javascript', 'react', 'node'],
    activeReviewCount: 2,
    avatarColor: AVATAR_COLORS[0],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'u2',
    email: 'sara@codereview.pro',
    name: 'Sara Patel',
    passwordHash: '$2a$10$dummyhash2',
    role: 'developer',
    skills: ['typescript', 'python', 'rust'],
    activeReviewCount: 1,
    avatarColor: AVATAR_COLORS[1],
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'u3',
    email: 'mike@codereview.pro',
    name: 'Mike Johnson',
    passwordHash: '$2a$10$dummyhash3',
    role: 'reviewer',
    skills: ['javascript', 'react', 'css'],
    activeReviewCount: 4,
    avatarColor: AVATAR_COLORS[2],
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'u4',
    email: 'admin@codereview.pro',
    name: 'Admin User',
    passwordHash: '$2a$10$dummyhash4',
    role: 'admin',
    skills: [],
    activeReviewCount: 0,
    avatarColor: AVATAR_COLORS[3],
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 'u5',
    email: 'emma@codereview.pro',
    name: 'Emma Wilson',
    passwordHash: '$2a$10$dummyhash5',
    role: 'developer',
    skills: ['python', 'go', 'kubernetes'],
    activeReviewCount: 3,
    avatarColor: AVATAR_COLORS[4],
    createdAt: '2026-02-10T10:00:00Z',
  },
];

export const reviews: ReviewRecord[] = [
  {
    id: 'demo',
    title: 'Add user authentication middleware',
    description: 'Implements JWT-based authentication with refresh token support',
    authorId: 'u2',
    authorName: 'Sara Patel',
    assignees: ['u1', 'u3'],
    status: 'in_review',
    language: 'typescript',
    fileName: 'auth-middleware.ts',
    code: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthPayload {
  userId: string;
  role: string;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-fallback';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req['user'] = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req['user'] as AuthPayload;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as AuthPayload;
    const newToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    return res.json({ token: newToken });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
}`,
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
    authorId: 'u5',
    authorName: 'Emma Wilson',
    assignees: ['u2'],
    status: 'pending',
    language: 'typescript',
    fileName: 'rate-limiter.ts',
    code: `export class RateLimiter {
  private buckets = new Map<string, { tokens: number; lastRefill: number }>();

  constructor(
    private maxTokens: number = 100,
    private refillRate: number = 10,
    private windowMs: number = 60000
  ) {}

  tryConsume(key: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.maxTokens, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    const elapsed = now - bucket.lastRefill;
    const refillAmount = Math.floor(elapsed / 1000) * this.refillRate;
    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + refillAmount);
    bucket.lastRefill = now;

    if (bucket.tokens > 0) {
      bucket.tokens--;
      return true;
    }
    return false;
  }

  getRemainingTokens(key: string): number {
    return this.buckets.get(key)?.tokens ?? this.maxTokens;
  }
}`,
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
    authorId: 'u1',
    authorName: 'Alex Chen',
    assignees: ['u5', 'u3'],
    status: 'approved',
    language: 'typescript',
    fileName: 'db-pool.ts',
    code: `import { EventEmitter } from 'events';

interface PoolOptions {
  maxConnections: number;
  idleTimeoutMs: number;
  healthCheckIntervalMs: number;
}

export class ConnectionPool extends EventEmitter {
  private connections: any[] = [];
  private idle: any[] = [];
  private waiting: Array<(conn: any) => void> = [];

  constructor(private options: PoolOptions) {
    super();
    this.startHealthCheck();
  }

  async acquire(): Promise<any> {
    if (this.idle.length > 0) {
      return this.idle.pop();
    }
    if (this.connections.length < this.options.maxConnections) {
      const conn = await this.createConnection();
      this.connections.push(conn);
      return conn;
    }
    return new Promise(resolve => this.waiting.push(resolve));
  }

  release(conn: any) {
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      resolve(conn);
    } else {
      this.idle.push(conn);
    }
  }

  private async createConnection() {
    this.emit('connection:created');
    return { id: Math.random().toString(36), createdAt: Date.now() };
  }

  private startHealthCheck() {
    setInterval(() => {
      this.emit('health:check', { total: this.connections.length, idle: this.idle.length });
    }, this.options.healthCheckIntervalMs);
  }
}`,
    aiFeedback: null,
    createdAt: '2026-03-12T11:00:00Z',
    updatedAt: '2026-03-14T07:00:00Z',
  },
  {
    id: 'r4',
    title: 'Fix CORS configuration for production',
    description: 'Updates CORS headers to properly handle credentials and preflight',
    authorId: 'u3',
    authorName: 'Mike Johnson',
    assignees: ['u1'],
    status: 'changes_requested',
    language: 'typescript',
    fileName: 'cors-config.ts',
    code: `const allowedOrigins = [
  'https://codereview.pro',
  'https://staging.codereview.pro',
  process.env.DEV_ORIGIN
].filter(Boolean);

export const corsConfig = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400
};`,
    aiFeedback: [
      { id: 'af9', line: 4, category: 'security', severity: 'warning', message: 'DEV_ORIGIN env var could allow any origin', suggestion: 'Only include DEV_ORIGIN when NODE_ENV is development' },
    ],
    createdAt: '2026-03-14T16:00:00Z',
    updatedAt: '2026-03-14T18:30:00Z',
  },
  {
    id: 'r5',
    title: 'WebSocket event handler refactor',
    description: 'Refactors WebSocket events to use typed event maps',
    authorId: 'u2',
    authorName: 'Sara Patel',
    assignees: ['u1', 'u5'],
    status: 'merged',
    language: 'typescript',
    fileName: 'ws-events.ts',
    code: `type EventMap = {
  'review:join': { reviewId: string; userId: string };
  'review:leave': { reviewId: string; userId: string };
  'cursor:move': { reviewId: string; userId: string; line: number; col: number };
  'comment:add': { reviewId: string; comment: any };
};

export function createTypedEmitter() {
  const handlers = new Map<string, Set<Function>>();

  return {
    on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void) {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler);
    },
    emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
      handlers.get(event)?.forEach(fn => fn(data));
    },
    off<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void) {
      handlers.get(event)?.delete(handler);
    }
  };
}`,
    aiFeedback: null,
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-11T14:00:00Z',
  },
];

export const comments: CommentRecord[] = [
  { id: 'c1', reviewId: 'r1', authorId: 'u1', authorName: 'Alex Chen', line: 11, content: 'We should never have hardcoded fallback secrets, even for development. Let\'s use dotenv-safe to enforce required env vars.', resolved: false, parentId: null, createdAt: '2026-03-14T09:00:00Z' },
  { id: 'c2', reviewId: 'r1', authorId: 'u2', authorName: 'Sara Patel', line: 11, content: 'Good point — I\'ll add a startup check that throws if secrets are missing in production.', resolved: false, parentId: 'c1', createdAt: '2026-03-14T09:05:00Z' },
  { id: 'c3', reviewId: 'r1', authorId: 'u3', authorName: 'Mike Johnson', line: 35, content: 'The Set optimization is a good idea. Also consider memoizing the set per endpoint.', resolved: false, parentId: null, createdAt: '2026-03-14T09:10:00Z' },
  { id: 'c4', reviewId: 'r4', authorId: 'u1', authorName: 'Alex Chen', line: 4, content: 'This definitely needs an environment check. Can you wrap it in a NODE_ENV === "development" condition?', resolved: false, parentId: null, createdAt: '2026-03-14T18:00:00Z' },
];
