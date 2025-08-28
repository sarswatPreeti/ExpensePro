# Backend Deployment on Railway

This guide sets up the ExpensePro backend (`server/`) on Railway using Postgres (Neon or Railway Postgres) and Firebase Admin via environment variables.

## 1) Prerequisites
- GitHub repo with this project
- Firebase project with a Service Account (JSON)
- Postgres database (Neon recommended, or Railway Postgres plugin)

## 2) Fork/Push the repo
Ensure your latest code is pushed to GitHub.

## 3) Create a new Railway Project
1. Go to `https://railway.app`
2. New Project → "Deploy from GitHub repo" → select your repo
3. Once created, add a new Service: "Node.js"
4. Set the Root Directory to `server/`
5. Build Command: `npm install`
6. Start Command: `npm start`

## 4) Environment Variables
Open the Railway project → Variables → Add the following:

Required:
- `NODE_ENV=production`
- `PORT=4000` (or leave empty and use `${PORT}` in logs only; Express reads `process.env.PORT` automatically)
- `JWT_SECRET=<a-strong-random-string>`
- `CORS_ORIGIN=https://<your-vercel-app>.vercel.app,http://localhost:3000`
- Database (choose one):
  - `DATABASE_URL=postgres://user:pass@host:5432/dbname?sslmode=require` (Neon)
  - or discrete: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`

Firebase Admin credentials (choose ONE method):
- Method A (recommended): `FIREBASE_SERVICE_ACCOUNT_BASE64` = base64 of your service account JSON
  - Create with: `base64 -w0 firebaseServiceAccountKey.json` (Linux/macOS) or use an online Base64 encoder.
- Method B: `FIREBASE_SERVICE_ACCOUNT` = full JSON string of service account
- Method C (discrete keys):
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_PRIVATE_KEY_ID`
  - `FIREBASE_PRIVATE_KEY` (replace literal \n with real newlines if needed)
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_CLIENT_ID`
  - `FIREBASE_CLIENT_X509_CERT_URL`

Optional:
- `FORCE_SYNC=false` (set `true` only to reset DB tables)

## 5) Deploy
- Railway will build and start automatically after variables are set.
- Check logs for: `🚀 Server running at http://0.0.0.0:<PORT>` and `✅ PostgreSQL connected`.

## 6) Verify CORS and API
- From your Vercel frontend, API base URL should be `https://<railway-service-domain>/api` (set in Vercel `REACT_APP_API_URL`).
- Test `GET https://<railway-service-domain>/api/test` → should return `{ "message": "API is running!" }`.

## 7) Client (Vercel) config changes
In Vercel project settings add/update:
- `REACT_APP_API_URL=https://<railway-service-domain>/api`
- Keep your existing Firebase web config envs.
Redeploy the client after saving.

## Notes
- The backend already supports multiple CORS origins. Keep `CORS_ORIGIN` as a comma-separated list of allowed domains.
- Firebase Admin is now initialized from env vars (Railway-friendly), falling back to local file for development.
- For file uploads, Railway uses ephemeral disk. For persistence, migrate `/uploads` to cloud storage (S3, etc.).
