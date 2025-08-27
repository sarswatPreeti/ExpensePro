# ExpensePro

## Deployment (Render + Neon + Vercel)

This app is configured to run locally and in the cloud using environment variables only. No UI/features change is required.

### 1) Backend (Render)
- Create a new Web Service from the `server/` folder/repo
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables:
  - DATABASE_URL: Postgres connection string from Neon (include `?sslmode=require` if needed)
    - Or alternatively set: DB_HOST, DB_USER, DB_PASS, DB_NAME
  - JWT_SECRET: a strong random string
  - CORS_ORIGIN: your Vercel URL (e.g. `https://your-app.vercel.app`)
  - RENDER: `true` (enables Firebase service account from secret file path)
  - Optional: FORCE_SYNC=`false` (do not drop tables)
- Secret File (Render): Add a secret file at path `/etc/secrets/firebaseServiceAccountKey.json` with your Firebase service account JSON contents

### 2) Database (Neon)
- Create a new Postgres project and database
- Copy the connection string and set it as `DATABASE_URL` in Render
- Ensure SSL is enabled (Neon uses SSL by default)

### 3) Frontend (Vercel)
- Import the `client/` as a new Vercel Project
- Build Command: `npm run build`
- Output Directory: `build`
- Environment Variables:
  - REACT_APP_API_URL: `https://<your-render-service>.onrender.com/api`
  - REACT_APP_FIREBASEAPP_API_KEY
  - REACT_APP_FIREBASEAPP_AUTH_DOMAIN
  - REACT_APP_FIREBASEAPP_PROJECT_ID
  - REACT_APP_FIREBASEAPP_STORAGE_BUCKET
  - REACT_APP_FIREBASEAPP_MESSAGING_SENDER_ID
  - REACT_APP_FIREBASEAPP_APP_ID
  - REACT_APP_FIREBASEAPP_MEASUREMENT_ID (optional)
- Redeploy after saving environment variables

### Local Development
Create `server/.env`:

```
DATABASE_URL=postgres://user:password@localhost:5432/expensepro
# or use discrete vars instead of DATABASE_URL
# DB_HOST=localhost
# DB_USER=user
# DB_PASS=password
# DB_NAME=expensepro

JWT_SECRET=your_local_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

Create `client/.env`:

```
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_FIREBASEAPP_API_KEY=...
REACT_APP_FIREBASEAPP_AUTH_DOMAIN=...
REACT_APP_FIREBASEAPP_PROJECT_ID=...
REACT_APP_FIREBASEAPP_STORAGE_BUCKET=...
REACT_APP_FIREBASEAPP_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASEAPP_APP_ID=...
REACT_APP_FIREBASEAPP_MEASUREMENT_ID=...
```

### Post-deploy Checklist
- Visit Vercel site and perform login/signup flow (Firebase)
- Ensure backend exchanges Firebase token at `/api/auth/firebase-login`
- Test CRUD on expenses/categories
- If you need persistent file uploads, configure a cloud storage (e.g. S3) instead of local `/uploads`

### Notes
- Server auto-detects `DATABASE_URL` (Neon/Render) or falls back to `DB_*`
- CORS origin is controlled by `CORS_ORIGIN`
- Client uses `REACT_APP_API_URL` for all API calls and refresh flow