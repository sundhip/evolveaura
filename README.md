# EvolveAura V3.0 - Web Platform Setup & Architecture Guide

EvolveAura is a digital detox and real-life gamified self-improvement web application. It transitions digital screen distractions into structured real-world parameters across four core archetypes (**Scholar**, **Warrior**, **Sage**, **Creator**) and features an evidence-based, confidential **Smoke-Free Path** grounded in behavioral clinical research.

This repository is organized as a monorepo consisting of:
- `backend/`: Node.js Express server + TypeScript + Prisma ORM + PostgreSQL (Neon) + JWT Auth.
- `frontend/`: Next.js 16.2.9 (App Router) + React 19 + Tailwind CSS 4 + Framer Motion.

---

## 🌟 What's New in V3.x

1. **Adaptive Question-Bank Lifecycle:** 16-question dynamic assessments (4 per path) with 3-attempt freshness exclusion and objective bottleneck detection.
2. **Path Purity & 7-Day Change Lock:** When committing to an archetype, daily quests strictly align to that path for 7 days to reinforce habit crystallization.
3. **The Smoke-Free Path:** An evidence-based, 18+ tobacco cessation companion featuring:
   - Fagerström screening and tapering plans.
   - 4-7-8 rapid urge surfing and breathing rescue (`/quit/sos` and public `/quit/try`).
   - Non-judgmental honesty bonuses (logging slips earns XP, bosses never heal on slips).
   - "Nicotine Shade" 3,000 HP recovery boss.
   - Absolute privacy: isolated database tables, zero public leaderboard exposure, full data export, and single-click permanent deletion (Right to be Forgotten).

---

## 💻 Part 1: How to Run Locally

### 1. Prerequisites
- **Node.js**: Version 18.x or 20.x installed.
- **PostgreSQL Database**: Free cloud instance from [Neon.tech](https://neon.tech/) or local PostgreSQL.

---

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/evolveaura?schema=public"
   JWT_SECRET="your_secure_jwt_token_secret_key_at_least_32_chars_long"
   GOOGLE_CLIENT_ID="your_optional_google_oauth_client_id"
   ALLOWED_ORIGINS="http://localhost:3000"
   NODE_ENV="development"
   ALLOW_GOOGLE_SIMULATOR="true"
   ```
4. Push Prisma database schema and generate client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Seed database with question banks, archetype quests, and recovery bosses:
   ```bash
   npm run prisma:seed
   ```
6. Run question bank audit to verify question balance and theme coverage:
   ```bash
   npm run questions:audit
   ```
7. Run the test suite:
   ```bash
   npm test
   ```
8. Start development server:
   ```bash
   npm run dev
   ```
   The API will listen at `http://localhost:5000`.

---

### 3. Frontend Setup
1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```
4. Run linting and TypeScript checks:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
5. Start development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## ☁️ Part 2: Deployment Guide

### 1. Database Setup (Neon Cloud PostgreSQL)
1. Create a project at [Neon.tech](https://neon.tech/).
2. Copy the connection URI:
   ```
   postgresql://user:password@ep-name.region.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Deploy Backend (Render.com)
1. Connect repository to Render as a **Web Service**.
2. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
3. Environment Variables:
   - `DATABASE_URL` = *(Neon connection string)*
   - `JWT_SECRET` = *(Min 32 characters random secret)*
   - `PORT` = `5000`
   - `ALLOWED_ORIGINS` = `https://your-frontend.vercel.app`
   - `NODE_ENV` = `production`

### 3. Deploy Frontend (Vercel)
1. Import repository to Vercel as a **Next.js** project.
2. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
3. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com/api`
