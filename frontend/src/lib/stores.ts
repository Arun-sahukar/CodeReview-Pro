'use client';

import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  skills: string[];
  avatarColor: string;
}

export interface AiFeedbackItem {
  id: string;
  line: number;
  category: 'style' | 'security' | 'performance' | 'bug_risk' | 'best_practice';
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestion: string;
}

export interface Review {
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

export interface Comment {
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

export interface DashboardStats {
  total: number;
  byStatus: Record<string, number>;
  avgTimeToReview: number;
  aiIssuesFound: number;
  weeklyActivity: Array<{ day: string; reviews: number; comments: number; approvals: number }>;
  reviewerWorkload: Array<{ name: string; activeReviews: number; avatarColor: string }>;
  aiCategories: Record<string, number>;
  bottlenecks: Array<{ reviewer: string; pendingReviews: number; avgResponseTime: string }>;
}

// ─── Auth Store ─────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'u1',
    email: 'alex@codereview.pro',
    name: 'Alex Chen',
    role: 'tech_lead',
    skills: ['typescript', 'javascript', 'react', 'node'],
    avatarColor: '#8B5CF6',
  },
  token: 'demo-token',
  isLoggedIn: true,
  login: (user, token) => set({ user, token, isLoggedIn: true }),
  logout: () => set({ user: null, token: null, isLoggedIn: false }),
}));

// ─── UI Store ───────────────────────────────────────────────
interface UIState {
  activePanel: 'ai' | 'comments';
  sidebarOpen: boolean;
  selectedLine: number | null;
  setActivePanel: (panel: 'ai' | 'comments') => void;
  toggleSidebar: () => void;
  setSelectedLine: (line: number | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePanel: 'ai',
  sidebarOpen: true,
  selectedLine: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSelectedLine: (line) => set({ selectedLine: line }),
}));
