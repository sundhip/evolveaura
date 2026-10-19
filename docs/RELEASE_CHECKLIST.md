# Production Release Checklist & Safe Deployment Guide

Follow this protocol before every deployment to production (Render backend + Vercel frontend + Neon PostgreSQL).

---

## 1. Pre-Deployment Verification

- [ ] **Run Type-Check & Unit/Integration Tests:**
  ```bash
  cd backend && npm test
  node node_modules/typescript/bin/tsc --noEmit
  cd ../frontend && node node_modules/typescript/bin/tsc --noEmit && npm run lint
  ```
- [ ] **Prohibited Medication Words Audit:**
  Ensure zero pharmaceutical terms (`mg`, `patch`, `gum`, `varenicline`, `bupropion`, `nicotex`, `champix`, `zyban`) exist in user-facing copy:
  ```bash
  node -e "
  const fs = require('fs');
  const path = require('path');
  const banned = [/mg\b/i, /patch/i, /gum/i, /varenicline/i, /bupropion/i, /nicotex/i, /champix/i, /zyban/i];
  function scan(dir) {
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) scan(p);
      else if (/\.(tsx|ts)$/.test(f)) {
        const c = fs.readFileSync(p, 'utf8');
        banned.forEach(r => { if (c.match(r)) console.log('VIOLATION:', p, r); });
      }
    });
  }
  scan('frontend/src/app/quit');
  scan('frontend/src/components/quit');
  console.log('Audit complete.');
  "
  ```
- [ ] **Verify Verified Helpline Numbers:**
  - National Tobacco Quitline: `1800-11-2356`
  - Tele-MANAS: `14416`
  - Check verification date in `docs/rehab-evidence.md`.

---

## 2. Database Backup & Staging Push

1. **Back up Neon Database:**
   - Open Neon Dashboard -> **Branches** -> create a point-in-time branch named `backup-pre-release-v3`.
2. **Apply Additive Schema on a Staging Branch First:**
   - Create a staging branch `stage-v3` in Neon.
   - Point `.env` `DATABASE_URL` to the staging branch.
   - Run:
     ```bash
     cd backend && npx prisma db push
     ```
   - Verify that all existing tables and rows remain intact.
3. **Apply to Production DB:**
   - Re-point to production `DATABASE_URL`.
   - Run:
     ```bash
     npx prisma db push
     npx prisma generate
     ```
4. **Seed Required Questions & Recovery Bosses:**
   ```bash
   npm run prisma:seed
   npm run questions:audit
   ```
5. **Run Quest Cleanup Script:**
   - Dry run first to preview adjustments:
     ```bash
     node scripts/cleanupOldQuests.js --dry-run
     ```
   - Apply changes:
     ```bash
     node scripts/cleanupOldQuests.js --apply
     ```

---

## 3. Backend Deployment (Render.com)

1. Verify environment variables in Render Dashboard:
   - `DATABASE_URL`: Production Neon PostgreSQL connection string with `?sslmode=require`.
   - `JWT_SECRET`: Random 64-character secret.
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `ALLOWED_ORIGINS`: `https://evolveaura.vercel.app`
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID.
2. Trigger manual deploy of the latest `main` commit.
3. Check build logs for `npm run build` and server startup message:
   `[EvolveAura Backend V2] Server running on port 5000`.
4. Test health check endpoint:
   `curl https://your-backend.onrender.com/health` -> `{"status":"ok"}`.

---

## 4. Frontend Deployment (Vercel)

1. Verify environment variables in Vercel Dashboard:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api`
2. Trigger deployment.
3. Verify build completes successfully with all 23+ routes static/dynamically generated.

---

## 5. Post-Deployment Smoke Test

- [ ] Register a new test account.
- [ ] Complete onboarding and 16-question assessment.
- [ ] Verify score report and bottleneck detection.
- [ ] Choose an archetype path (e.g. Scholar) -> verify 7-day lock is activated.
- [ ] Open `/quit/try` unauthenticated -> verify 4-7-8 breathing rescue runs smoothly.
- [ ] Open `/quit` authenticated -> consent gate -> complete screening -> verify welcome bonus awarded (+100 XP + "First Breath" badge).
- [ ] Test `/privacy` page renders data export and right-to-be-forgotten details.

---

## 6. Rollback Plan

- **Database:** If schema issues occur, restore the database from the Neon `backup-pre-release-v3` branch with a single click in the Neon console.
- **Backend:** In Render, navigate to **Deploys** and select the previous successful build -> **Rollback to this deploy**.
- **Frontend:** In Vercel, navigate to **Deployments** and promote the previous production deployment.
