# Military Asset Management System - Deployment Guide

Last updated: May 11, 2026

This guide deploys the MERN monorepo with:

- Frontend: React + Vite on Vercel
- Backend: Node.js + Express on Render
- Database: MongoDB Atlas

Production flow:

```text
Browser
  -> Vercel frontend
  -> Render API at /api/v1
  -> MongoDB Atlas
```

Use these placeholders while deploying:

```text
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.onrender.com
API_URL=https://your-backend.onrender.com/api/v1
DATABASE_NAME=military-assets
```

---

## 1. Pre-Deployment Checklist

Before creating cloud services, confirm the project builds locally.

```bash
npm install
npm run build
```

Optional backend test check:

```bash
npm test --workspace=server
```

The root `npm run build` runs the backend no-op build and the Vite production build. If the frontend build fails, fix that before deploying to Vercel.

Required accounts:

- GitHub account with this project pushed to a repository
- MongoDB Atlas account
- Render account
- Vercel account

Required project files:

- `server/.env.example`
- `client/.env.example`
- `client/vercel.json`
- `render.yaml`

---

## 2. Push the Project to GitHub

If the project is not already in GitHub, initialize and push it.

```bash
git init
git add .
git commit -m "Prepare production deployment"
git branch -M main
git remote add origin https://github.com/your-username/military-asset-management-system.git
git push -u origin main
```

Do not commit real `.env` files. The `.env.example` files are safe templates.

---

## 3. Create the MongoDB Atlas Database

1. Open MongoDB Atlas and create a project.
2. Create an M0 or production-sized cluster.
3. Create a database user.
4. Give the user the minimum required database access, preferably `readWrite` on `military-assets` for production.
5. Open Network Access and add an IP access list entry.
6. Get the Node.js driver connection string from Atlas.

Example connection string:

```text
mongodb+srv://<username>:<password>@<cluster-host>/military-assets?retryWrites=true&w=majority
```

Important security note:

- For quick demos, `0.0.0.0/0` allows access from any IP address.
- For stronger production security, restrict Atlas network access to trusted outbound IPs or use a provider feature that gives stable outbound IPs.
- Render free and standard web services may not have a fixed outbound IP unless you configure an appropriate networking solution.

Keep the final connection string ready for Render as `MONGODB_URI`.

---

## 4. Deploy the Backend to Render

You can deploy the backend either from the Render dashboard or from the included `render.yaml` blueprint.

### Option A: Render Dashboard

1. In Render, choose `New` -> `Web Service`.
2. Connect the GitHub repository.
3. Select the production branch, usually `main`.
4. Use these settings:

| Setting | Value |
|---|---|
| Name | `military-asset-management-api` |
| Runtime | `Node` |
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| Auto Deploy | Enabled |

5. Add environment variables:

| Key | Production value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret, 32+ chars |
| `JWT_EXPIRE` | `7d` |
| `JWT_REFRESH_SECRET` | Different long random secret |
| `JWT_REFRESH_EXPIRE` | `30d` |
| `CLIENT_URL` | Temporary frontend URL or `http://localhost:5173`; update after Vercel deploy |
| `API_VERSION` | `v1` |

6. Click `Create Web Service`.
7. Wait for the deploy to complete.
8. Open:

```text
https://your-backend.onrender.com/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is running"
}
```

### Option B: Render Blueprint

The repository includes a root-level `render.yaml` for Render Blueprints.

1. In Render, choose `New` -> `Blueprint`.
2. Connect the GitHub repository.
3. Render will read `render.yaml`.
4. Provide the prompted secret values:

| Key | Value |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLIENT_URL` | Vercel frontend URL after frontend deployment |

The blueprint generates `JWT_SECRET` and `JWT_REFRESH_SECRET` automatically. If you do not know the frontend URL yet, deploy once, deploy Vercel, then update `CLIENT_URL` manually in the Render service settings and redeploy.

---

## 5. Seed Production Demo Data

The seed script is for demos and evaluation only.

Warning: `server/seeds/seedData.js` deletes existing records from all main collections before inserting demo data. Do not run it against a real production database with live data.

To seed a fresh demo database from your machine:

PowerShell:

```powershell
cd server
$env:MONGODB_URI="mongodb+srv://username:password@cluster-host/military-assets?retryWrites=true&w=majority"
npm run seed
Remove-Item Env:MONGODB_URI
```

Bash:

```bash
cd server
MONGODB_URI="mongodb+srv://username:password@cluster-host/military-assets?retryWrites=true&w=majority" npm run seed
```

Demo credentials after seeding:

```text
Admin: admin@military.com / Admin@123
Base Commander: commander1@military.com / Officer@123
Logistics Officer: logistics1@military.com / Officer@123
```

After a public demo, rotate or remove demo users before treating the environment as production.

---

## 6. Deploy the Frontend to Vercel

1. In Vercel, choose `Add New` -> `Project`.
2. Import the same GitHub repository.
3. Configure the project:

| Setting | Value |
|---|---|
| Framework Preset | `Vite` |
| Root Directory | `client` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

The `client/vercel.json` file already contains a rewrite to `index.html`, so direct visits to routes such as `/dashboard`, `/purchases`, and `/audit-logs` work with React Router.

4. Add Vercel environment variables:

| Key | Production value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com/api/v1` |
| `VITE_NODE_ENV` | `production` |

5. Deploy the project.
6. Copy the final Vercel URL, for example:

```text
https://your-frontend.vercel.app
```

7. Go back to Render and update:

```text
CLIENT_URL=https://your-frontend.vercel.app
```

8. Redeploy the Render backend so CORS uses the final frontend origin.

Do not include a trailing slash in `CLIENT_URL`.

---

## 7. Verify the Production Deployment

### Backend Health Check

```bash
curl https://your-backend.onrender.com/health
```

PowerShell:

```powershell
Invoke-RestMethod -Uri "https://your-backend.onrender.com/health"
```

### Login API Check

```bash
curl -X POST https://your-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@military.com\",\"password\":\"Admin@123\"}"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "https://your-backend.onrender.com/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@military.com","password":"Admin@123"}'
```

### Frontend Check

Open the Vercel URL and verify:

- Login works.
- Dashboard cards and charts load.
- Purchases, transfers, assignments, expenditures, inventory, users, settings, and audit logs pages open.
- Refreshing `/dashboard` does not produce a 404.
- Creating or updating records writes an audit log.
- Role-based pages behave correctly for Admin, Base Commander, and Logistics Officer.

---

## 8. Environment Variable Reference

### Render Backend

| Variable | Required | Notes |
|---|---:|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `PORT` | Yes | Render commonly uses `10000`; app also reads Render-provided `PORT` |
| `NODE_ENV` | Yes | Use `production` |
| `JWT_SECRET` | Yes | Access token signing secret |
| `JWT_EXPIRE` | Yes | Example: `7d` |
| `JWT_REFRESH_SECRET` | Yes | Must differ from `JWT_SECRET` |
| `JWT_REFRESH_EXPIRE` | Yes | Example: `30d` |
| `CLIENT_URL` | Yes | Exact Vercel origin, no trailing slash |
| `API_VERSION` | Optional | Use `v1` for consistency |

### Vercel Frontend

| Variable | Required | Notes |
|---|---:|---|
| `VITE_API_URL` | Yes | Must include `/api/v1` |
| `VITE_NODE_ENV` | Optional | Use `production` |

Vercel applies environment variable changes only to new deployments, so redeploy the frontend after changing `VITE_API_URL`.

---

## 9. Production Hardening Checklist

- Replace all demo credentials.
- Use separate production JWT secrets.
- Restrict MongoDB Atlas IP access where possible.
- Keep `CLIENT_URL` locked to the exact Vercel domain or custom domain.
- Enable MongoDB Atlas backups before storing real operational data.
- Review Render logs after every deploy.
- Review Vercel build logs after every deploy.
- Confirm HTTPS is used for frontend and backend.
- Confirm the seed script is not wired into automatic production deployment.
- Run `npm audit` regularly in root, `server`, and `client`.
- Rotate secrets after demos, shared screen recordings, or accidental exposure.
- Confirm audit logs are generated for login, create, update, and delete operations.
- Remove unused test accounts before production use.

---

## 10. Rollback and Recovery

### Backend Rollback

1. Open the Render service.
2. Go to `Deploys`.
3. Select the last known good deploy.
4. Use Render's rollback/redeploy action.
5. Re-test `/health` and login.

### Frontend Rollback

1. Open the Vercel project.
2. Go to `Deployments`.
3. Select the last known good deployment.
4. Promote or redeploy it.
5. Re-test login and route refresh.

### Database Recovery

1. Use MongoDB Atlas backup/restore if enabled.
2. Restore to a new cluster first when possible.
3. Validate data integrity.
4. Point `MONGODB_URI` to the restored cluster only after validation.

---

## 11. Troubleshooting

### Render build fails

Check:

- Root Directory is `server`.
- Build Command is `npm install`.
- Start Command is `npm start`.
- Node version is 18 or newer.
- `server/package.json` is present in the selected root directory.

### Backend cannot connect to MongoDB

Check:

- `MONGODB_URI` is set in Render.
- Username and password are URL-safe and correct.
- Database user has access to `military-assets`.
- Atlas Network Access allows the Render service to connect.
- The connection string contains the database name.

### Frontend shows CORS errors

Check:

- Render `CLIENT_URL` exactly matches the deployed Vercel origin.
- No trailing slash is present.
- Backend was redeployed after changing `CLIENT_URL`.
- Browser is loading the expected Vercel deployment.

### API calls go to localhost

Check:

- Vercel `VITE_API_URL` is set to `https://your-backend.onrender.com/api/v1`.
- The frontend was redeployed after changing environment variables.
- The browser cache is not serving an old build.

### Refreshing a frontend route gives 404

Check:

- `client/vercel.json` contains the rewrite to `/index.html`.
- Vercel project root directory is `client`.
- The latest commit containing `client/vercel.json` has deployed.

### Login returns 401

Check:

- Seed data exists if using demo credentials.
- Request body uses the expected email and password.
- `JWT_SECRET` is present.
- Browser local storage does not contain an old invalid token.

### Seed command removed real data

The seed script is destructive. Restore from MongoDB Atlas backup if available. For future production work, create a separate non-destructive seed or migration script.

---

## 12. Custom Domain Setup

Optional production domain layout:

```text
Frontend: https://assets.example.com
Backend:  https://api.assets.example.com
```

After adding custom domains:

1. Update Vercel custom domain DNS records.
2. Update Render custom domain DNS records.
3. Set Render `CLIENT_URL=https://assets.example.com`.
4. Set Vercel `VITE_API_URL=https://api.assets.example.com/api/v1`.
5. Redeploy both services.
6. Re-test login and CORS.

---

## 13. Final Deployment Summary

Use this final production configuration:

```text
MongoDB Atlas
  Database: military-assets
  Used by: Render backend

Render
  Root Directory: server
  Build Command: npm install
  Start Command: npm start
  Health Check: /health
  Public URL: https://your-backend.onrender.com

Vercel
  Root Directory: client
  Build Command: npm run build
  Output Directory: dist
  API Variable: VITE_API_URL=https://your-backend.onrender.com/api/v1
  Public URL: https://your-frontend.vercel.app
```

Deployment is complete when:

- `GET /health` returns success.
- The Vercel app can log in.
- Dashboard data loads from MongoDB Atlas through Render.
- Protected routes work after browser refresh.
- CORS errors are gone.
- Audit logs are created for user actions.

---

## Official References

- Render Node/Express deployment: https://render.com/docs/deploy-node-express-app
- Render Blueprint specification: https://render.com/docs/blueprint-spec
- Render monorepo support: https://render.com/docs/monorepo-support
- Vercel build and root directory settings: https://vercel.com/docs/builds/configure-a-build
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel rewrites: https://vercel.com/docs/routing/rewrites
- MongoDB Atlas connection strings: https://www.mongodb.com/docs/manual/reference/connection-string/
- MongoDB Atlas IP access lists: https://www.mongodb.com/docs/api/doc/atlas-admin-api-v2/2025-02-19/operation/operation-creategroupaccesslistentry
