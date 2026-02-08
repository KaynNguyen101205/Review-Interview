# Deploy Review Platform on Netlify

This guide walks you through deploying the Review Platform (Next.js 14 + Prisma + NextAuth) on **Netlify**.

## Prerequisites

- Code pushed to **GitHub**, **GitLab**, or **Bitbucket**
- A **PostgreSQL** database (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
- (Optional) **Google OAuth** credentials for Sign in with Google

---

## 1. Connect the repo to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign in.
2. Click **Add new site** → **Import an existing project**.
3. Choose your Git provider and authorize Netlify.
4. Select the repository that contains this project.
5. Netlify will detect **Next.js** and set the build command. Leave defaults or use:
   - **Build command:** `npm run build` (runs `prisma generate && next build` from `package.json`)
   - **Base directory:** (leave empty unless the app lives in a subfolder)
   - **Publish directory:** leave empty (Next.js adapter sets it)

Click **Deploy site** (you can add env vars in the next step and redeploy).

---

## 2. Set environment variables

In Netlify: **Site settings** → **Environment variables** → **Add a variable** (or **Import from .env**).

Add these (replace with your real values):

| Variable | Description | Example |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `NEXTAUTH_URL` | Full URL of your site | `https://your-site-name.netlify.app` |
| `NEXTAUTH_SECRET` | Random secret for sessions | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | (Optional) Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | (Optional) Google OAuth client secret | From Google Cloud Console |

**Important:** After changing `NEXTAUTH_URL` or adding variables, trigger a **new deploy** (Deploys → Trigger deploy → Deploy site).

---

## 3. Database setup

Your production DB must have the same schema as in development:

- Either run **migrations** from your machine against the production `DATABASE_URL`, or  
- Use **Prisma Migrate** in a one-off script/CI step that runs `npx prisma migrate deploy` with the production `DATABASE_URL`.

To push schema without migrations (simpler for small projects):

```bash
DATABASE_URL="your-production-database-url" npx prisma db push
```

(Optional) Seed an admin user:

```bash
DATABASE_URL="your-production-database-url" npm run db:seed
```

---

## 4. Redeploy

After saving environment variables:

1. Go to **Deploys**.
2. Click **Trigger deploy** → **Deploy site**.

Build logs will show `prisma generate` and `next build`. If the build fails, check the logs and that all env vars (especially `DATABASE_URL`) are set.

---

## 5. Post-deploy checks

- Open `https://your-site-name.netlify.app`.
- Test: home page, sign in, browse companies/reviews, and (if configured) Google sign-in.
- Ensure `NEXTAUTH_URL` is exactly the Netlify URL (no trailing slash).

---

## Optional: Sentry (errors)

If you use Sentry, add in Netlify:

- `SENTRY_ORG`
- `SENTRY_PROJECT`
- (and any auth token your Sentry setup needs)

---

## Troubleshooting

- **Build fails: Prisma / "schema not found"**  
  Ensure `prisma generate` runs (it’s part of `npm run build`). If you use a custom build command in Netlify, include `prisma generate` before `next build`.

- **"Prisma Client could not find the query engine"**  
  The schema uses `binaryTargets = ["native", "rhel-openssl-3.0.x"]` for Netlify’s Linux environment. Regenerate and redeploy: `npx prisma generate` then push and trigger a new deploy.

- **NextAuth / redirect errors**  
  Set `NEXTAUTH_URL` to your exact Netlify URL (e.g. `https://your-site.netlify.app`) and add that URL in your OAuth app’s redirect URIs if using Google.

- **Database connection errors**  
  Confirm `DATABASE_URL` is correct, that the DB allows connections from Netlify’s IPs (or use a cloud DB with public access + SSL), and that the schema has been applied (`db push` or `migrate deploy`).
