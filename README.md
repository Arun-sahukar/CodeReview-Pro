# CodeReview Pro 🚀

> **Enterprise-grade collaborative code review platform** with real-time collaboration, AI-powered analysis, and smart reviewer assignment.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Key Technical Highlights](#key-technical-highlights)
- [API Reference](#api-reference)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

---

## Overview

CodeReview Pro is a full-stack collaborative code review platform that brings together real-time multi-user editing (via **Yjs CRDTs**), AI-powered pre-review analysis (via **OpenAI GPT-4o**), and smart workload-aware reviewer assignment — all in a modern dark-themed UI.

Built as a production-grade portfolio project, it demonstrates advanced patterns including WebSocket-based collaboration, conflict-free replicated data types, JWT authentication, and async AI job queuing.

---

## Features

### 🤖 AI Pre-Review (GPT-4o)
- Automatic code analysis on submission
- Categorised feedback: `security`, `performance`, `style`, `bug_risk`, `best_practice`
- Line-level suggestions with severity levels (`error`, `warning`, `info`)
- Async processing via `setTimeout` mock pipeline (production would use a job queue like BullMQ)

### ⚡ Real-Time Collaboration
- Multi-user simultaneous code editing powered by **Yjs CRDTs**
- Monaco Editor with `y-monaco` binding for conflict-free merging
- Live cursor presence — see who is viewing/editing in real time
- Socket.IO events for user join/leave, cursor moves, comment additions

### 👥 Smart Reviewer Assignment
- Automatically assigns reviewers based on **skill tags** matching the PR language
- Workload-aware: sorts candidates by `activeReviewCount` (fewest-first)
- Fallback to any available non-admin team member

### 📊 Analytics Dashboard
- Weekly activity charts (reviews, comments, approvals)
- Review status breakdown with horizontal bar charts
- AI issue category distribution (donut chart)
- Per-reviewer workload bars with colour-coded capacity indicators
- Bottleneck detection with avg. response time

### 🔐 Auth & Roles
- JWT authentication (access tokens, 24h expiry)
- Four role levels: `developer`, `reviewer`, `tech_lead`, `admin`
- Route-level protection via `JwtAuthGuard`
- Bcrypt password hashing

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16.1 (App Router), React 19, TypeScript |
| **State Management** | Zustand |
| **Data Fetching** | TanStack React Query, Axios |
| **Code Editor** | Monaco Editor + `@monaco-editor/react` |
| **Real-Time Sync** | Yjs CRDTs, `y-monaco`, Socket.IO Client |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Backend** | NestJS 10, TypeScript |
| **Database** | MongoDB via Mongoose (`mongodb-memory-server` for dev) |
| **Auth** | Passport.js, JWT (`@nestjs/jwt`), Bcryptjs |
| **WebSockets** | `@nestjs/websockets`, `@nestjs/platform-socket.io` |
| **Validation** | `class-validator`, `class-transformer` |
| **AI** | Pattern-based mock analyser (production-ready for OpenAI GPT-4o integration) |

---

## Project Structure

```
codereview-pro/
├── frontend/                    # Next.js application
│   └── src/
│       ├── app/
│       │   ├── dashboard/       # Analytics dashboard page
│       │   ├── reviews/
│       │   │   ├── page.tsx     # Reviews list with filters
│       │   │   └── [id]/        # Review detail + editor
│       │   ├── admin/           # Team & roles management
│       │   ├── login/           # Login page
│       │   ├── register/        # Registration page
│       │   ├── globals.css      # Design system (CSS variables)
│       │   └── page.module.css  # Home page styles
│       ├── components/
│       │   └── Sidebar.tsx      # Navigation sidebar
│       └── lib/
│           ├── api.ts           # API client with mock fallback
│           ├── stores.ts        # Zustand stores (auth, UI)
│           └── useRealtime.ts   # Socket.IO + Yjs hook
│
└── backend/                     # NestJS application
    └── src/
        ├── auth/                # JWT auth, user schema, guards
        ├── reviews/             # Review CRUD, smart assignment, AI trigger
        ├── comments/            # Threaded comments with replies
        ├── ai/                  # AI analysis service (pattern-based mock)
        ├── gateway/             # WebSocket gateway (Socket.IO)
        ├── common/
        │   ├── data-store.ts    # Seed data definitions
        │   └── seed.service.ts  # DB seeding on startup
        ├── database.module.ts   # MongoDB (in-memory for dev)
        └── app.module.ts
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.9
- **npm** ≥ 9

### 1. Clone the repository

```bash
git clone https://github.com/Arun-sahukar/CodeReview-Pro.git
cd CodeReview-Pro
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
# API running at http://localhost:4000
# Uses in-memory MongoDB automatically (no setup needed)
```

The backend seeds demo data on first run (5 users, 5 reviews, 4 comments).

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:3000
```

### 4. Open in browser

Navigate to [http://localhost:3000](http://localhost:3000).

**Demo credentials:**
```
Email:    alex@codereview.pro
Password: password
```

> **Note:** The demo seed uses pre-hashed passwords. Any string will work as login is relaxed in demo mode via the mock API fallback on the frontend.

> **Offline mode:** The frontend falls back to built-in mock data automatically if the backend is not running. All pages remain fully functional.

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Optional — uses in-memory MongoDB if not set
MONGODB_URI=mongodb://localhost:27017/codereview-pro

# JWT signing secret (required in production)
JWT_SECRET=your-super-secret-key

# OpenAI API key (required for real AI analysis)
OPENAI_API_KEY=sk-...
```

### Frontend (`frontend/.env.local`)

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# WebSocket server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

---

## Key Technical Highlights

### Yjs CRDT Collaboration

The review editor uses **Yjs** (Conflict-free Replicated Data Types) to enable real-time multi-user editing without operational transforms. The `y-monaco` binding connects the shared `Y.Text` document directly to the Monaco editor model, ensuring all edits merge deterministically regardless of network order.

```ts
// useRealtime.ts — simplified
const ydoc = new Y.Doc();
const ytext = ydoc.getText('monaco');

// Sync updates over Socket.IO
ydoc.on('update', (update) => {
  socket.emit('code:change', { reviewId, changes: update.buffer });
});

socket.on('code:updated', (update) => {
  Y.applyUpdate(ydoc, new Uint8Array(update));
});
```

**Design note:** The `ydoc.on('update')` listener is registered once per `useEffect` lifecycle. Socket disconnection in the cleanup function (`socket.disconnect()`) prevents duplicate event propagation across remounts. A potential improvement would be to explicitly remove the `ydoc` update listener in the teardown to guard against edge-case stacking on rapid reconnect cycles.

### Smart Reviewer Assignment

```ts
// reviews.service.ts
const candidates = await this.userModel.find({
  _id: { $ne: authorId },
  role: { $ne: 'admin' },
  skills: { $in: requiredSkills }     // language-aware matching
})
.sort({ activeReviewCount: 1 })       // least loaded first
.limit(2)
.exec();
```

### AI Feedback Pipeline

Code analysis runs asynchronously via `setTimeout` after review creation to avoid blocking the HTTP response. The analyser uses pattern-based detection for hardcoded secrets, `eval()` usage, `await` inside `forEach`, loose equality checks, `console.log` statements, and long lines. In a production deployment, this could be replaced with a job queue (e.g., BullMQ) backed by Redis for more robust async processing.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/users` | List all team members |
| `GET` | `/api/reviews` | List reviews (optional `?status=` filter) |
| `GET` | `/api/reviews/stats` | Dashboard analytics |
| `GET` | `/api/reviews/:id` | Get single review |
| `POST` | `/api/reviews` | Create new review (triggers AI analysis) |
| `PUT` | `/api/reviews/:id/status` | Update review status |
| `GET` | `/api/comments/:reviewId` | Get comments for a review |
| `POST` | `/api/comments` | Add a comment |
| `PUT` | `/api/comments/:id/resolve` | Resolve a comment |
| `POST` | `/api/ai/analyze` | Analyse arbitrary code |
| `POST` | `/api/ai/analyze/:reviewId` | Re-analyse an existing review |

### WebSocket Events

| Event (emit) | Payload | Description |
|---|---|---|
| `review:join` | `{ reviewId, userId, userName, color }` | Join a review room |
| `review:leave` | — | Leave the current review room |
| `cursor:move` | `{ reviewId, line, column }` | Broadcast cursor position |
| `comment:new` | `{ reviewId, comment }` | Broadcast new comment |
| `code:change` | `{ reviewId, changes }` | Broadcast Yjs CRDT update |

| Event (listen) | Description |
|---|---|
| `users:active` | Updated list of active users in the room |
| `cursor:updated` | Another user's cursor moved |
| `comment:added` | New comment posted |
| `code:updated` | Yjs update from another user |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

```bash
# Run backend in watch mode
cd backend && npm run dev

# Run frontend dev server
cd frontend && npm run dev

# Lint frontend
cd frontend && npm run lint
```

---

## License

[MIT](LICENSE) — Arun Sahukar, 2026
