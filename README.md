# CodeReview Pro 🚀

An enterprise-grade, collaborative code review platform built with **Next.js 14**, **NestJS**, and **AI**.

## 🌟 Features

- **Live Collaboration**: Shared Monaco Editor with real-time cursor syncing (via Yjs & Socket.io).
- **AI-Powered Analysis**: Automated pre-reviews using LLMs (detected security risks, performance bottlenecks, and style issues).
- **Smart Assignment**: Algorithm-based reviewer assignment based on language expertise and current workload.
- **Enterprise Dashboard**: Comprehensive analytics for Tech Leads to track review velocity and team health.
- **Zero-Config Setup**: Includes an in-memory MongoDB fallback for instant local development.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **State Management**: Zustand
- **Editor**: Monaco Editor (VS Code core)
- **Styling**: Vanilla CSS (Premium Dark/Glassmorphism Theme)
- **Collaboration**: Yjs & Socket.io

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB (Mongoose) with `mongodb-memory-server`
- **Real-time**: Socket.IO Gateway
- **Auth**: Passport.js + JWT

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd CodeReview-Pro
   ```

2. Setup Backend:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

3. Setup Frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard!

## 📸 Screenshots

*(Add your screenshots here)*

## 📄 License
MIT
