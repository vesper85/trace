# Deployment Guide

This guide covers deploying the Trace monorepo to production.

## Architecture Overview

| App | Platform | Purpose |
|-----|----------|---------|
| `apps/web` | Vercel | Main web application |
| `apps/docs` | Vercel | Documentation site |
| `apps/sim-backend` | Railway | Simulation API backend |

---

## 1. Deploy sim-backend to Railway

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository connected to Railway

### Steps

1. **Create new project** in Railway dashboard
2. **Add PostgreSQL** service via Railway's "New" → "Database" → "PostgreSQL"
3. **Add your repo** via "New" → "GitHub Repo" → select `vesper85/trace`
4. **Configure service**:
   - Set **Root Directory**: `apps/sim-backend`
   - Railway will auto-detect the `Dockerfile` and `railway.toml`
5. **Link database**: Railway auto-injects `DATABASE_URL` when you link the Postgres service
6. **Deploy**: Railway will build and deploy automatically

### Environment Variables (auto-injected by Railway)
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3005
NODE_ENV=production
```

### After Deploy
- Run database migrations: Use Railway's CLI or add a startup script
- Note your deployment URL (e.g., `https://sim-backend-production.up.railway.app`)

---

## 2. Deploy web to Vercel

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected

### Steps

1. **Import project** in Vercel dashboard
2. **Configure**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm turbo build --filter=web`
   - **Install Command**: `pnpm install`
3. **Add environment variables**:
   ```
   NEXT_PUBLIC_SIM_API_URL=https://your-railway-backend.railway.app
   ```
4. **Deploy**

### Custom Domain
- Add your domain in Vercel Project Settings → Domains

---

## 3. Deploy docs to Vercel

### Steps

1. **Import project** (or create separate Vercel project)
2. **Configure**:
   - **Framework Preset**: Next.js  
   - **Root Directory**: `apps/docs`
   - **Build Command**: `pnpm turbo build --filter=docs`
   - **Install Command**: `pnpm install`
3. **Deploy**

---

## Files Created for Deployment

```
apps/sim-backend/
├── Dockerfile           # Bun-based container for Railway
├── railway.toml         # Railway configuration
└── .env.example         # Environment variable template

apps/web/
└── vercel.json          # Vercel configuration

apps/docs/
└── vercel.json          # Vercel configuration
```

---

## Post-Deployment Checklist

- [ ] Verify sim-backend health endpoint: `GET /health`
- [ ] Run database migrations on Railway
- [ ] Update `NEXT_PUBLIC_SIM_API_URL` in Vercel with Railway URL
- [ ] Test web app functionality with production backend
- [ ] Set up custom domains (optional)
- [ ] Enable preview deployments for PRs
