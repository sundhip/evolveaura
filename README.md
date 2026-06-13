# EvolveAura V2.0 - Web Platform Setup Guide

EvolveAura is a digital detox and real-life gamified self-improvement web application. It transitions digital screen distractions into structured real-world parameters (Scholar, Warrior, Sage, Creator) using software-based cheat-resistant metrics. 

This repository is organized as a monorepo consisting of:
- `backend/`: Node.js Express server + Prisma + PostgreSQL DB.
- `frontend/`: Next.js Client Application + Framer Motion.

---

## 💻 Part 1: How to Run Locally

### 1. Prerequisites
- **Node.js**: Version 18.x or 20.x installed.
- **PostgreSQL Database**: You can use a local PostgreSQL instance or a free cloud-hosted instance (such as **Neon.tech** or **Supabase**).

---

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/evolveaura?schema=public"
   JWT_SECRET="your_secure_jwt_token_secret_key"
   ```
   > [!NOTE]
   > Replace `DATABASE_URL` with your actual local PostgreSQL URI or a Neon cloud database connection string.

4. Push the Prisma database schema and generate the client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Seed the database with default quests and bosses:
   ```bash
   npm run prisma:seed
   ```
6. Start the development server (auto-reloading):
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`.

---

### 3. Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend/` directory to link the client to the backend API:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## ☁️ Part 2: How to Deploy Online (Free-of-Cost)

The entire V2.0 stack can be deployed completely free of charge using global serverless cloud integrations.

### 1. Step 1: Database Setup (Neon Cloud PostgreSQL)
1. Go to [Neon.tech](https://neon.tech/) and create a free PostgreSQL database project.
2. Copy the connection string (URI) provided in your project dashboard. It will look like:
   ```
   postgresql://alex:xxxxxx@ep-cool-water-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

### 2. Step 2: Deploy Backend Server (Render.com Web Service)
1. Sign up for a free account at [Render.com](https://render.com/).
2. Click **New +** > **Web Service** and connect your GitHub repository.
3. Configure the following settings for the backend service:
   - **Name**: `evolveaura-backend`
   - **Root Directory**: `backend`
   - **Environment/Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** ($0/month)
4. Add the following **Environment Variables** in Render's configuration:
   - `DATABASE_URL` = *(Your Neon database connection string)*
   - `JWT_SECRET` = *(A secure random string of characters)*
   - `PORT` = `5000`
5. Render will automatically build the API and assign it a public URL (e.g. `https://evolveaura-backend.onrender.com`).

---

### 3. Step 3: Deploy Frontend Client (Vercel Client Hosting)
1. Sign up for a free Hobby account at [Vercel.com](https://vercel.com/).
2. Click **Add New** > **Project** and import your GitHub repository.
3. Configure the following settings:
   - **Name**: `evolveaura-frontend`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `next build` (Vercel handles this automatically)
4. Open the **Environment Variables** accordion and add:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-name.onrender.com/api`
   *(Replace with the actual URL assigned by Render in Step 2)*
5. Click **Deploy**. Vercel will build your static pages and serve the app globally on an SSL-certified domain (e.g. `https://evolveaura.vercel.app`).
