# ExpensePro Deployment Guide

## Environment Configuration

### Server Environment Variables

Create `server/.env` with the following variables:

```env
# Database Configuration
DATABASE_URL=postgres://user:password@localhost:5432/expensepro
# Or use discrete variables:
# DB_HOST=localhost
# DB_USER=your_db_user
# DB_PASS=your_db_password
# DB_NAME=expensepro

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,https://expense-gn1gz68v3-preeti-saraswats-projects.vercel.app

# Environment
NODE_ENV=development

# Render Configuration (for production)
RENDER=false

# Database Sync (set to true only when intentionally resetting)
FORCE_SYNC=false
```

### Client Environment Variables

Create `client/.env` with the following variables:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:4000/api

# Firebase Configuration
REACT_APP_FIREBASEAPP_API_KEY=your_firebase_api_key
REACT_APP_FIREBASEAPP_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASEAPP_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASEAPP_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASEAPP_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASEAPP_APP_ID=your_firebase_app_id
REACT_APP_FIREBASEAPP_MEASUREMENT_ID=your_firebase_measurement_id
```

## Production Deployment

### Render (Backend) Environment Variables

Set these in your Render dashboard:

```env
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=your_very_secure_jwt_secret_key_here
CORS_ORIGIN=https://expense-gn1gz68v3-preeti-saraswats-projects.vercel.app
RENDER=true
NODE_ENV=production
FORCE_SYNC=false
```

### Vercel (Frontend) Environment Variables

Set these in your Vercel dashboard:

```env
REACT_APP_API_URL=https://expensepro-q29c.onrender.com/api
REACT_APP_FIREBASEAPP_API_KEY=your_firebase_api_key
REACT_APP_FIREBASEAPP_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASEAPP_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASEAPP_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASEAPP_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASEAPP_APP_ID=your_firebase_app_id
REACT_APP_FIREBASEAPP_MEASUREMENT_ID=your_firebase_measurement_id
```

## Firebase Service Account Setup

### Local Development
Ensure `server/config/firebaseServiceAccountKey.json` exists with your Firebase service account credentials.

### Production (Render)
Add a secret file at `/etc/secrets/firebaseServiceAccountKey.json` in your Render service with your Firebase service account JSON contents.

## Changes Made

1. **CORS Configuration**: Updated to support multiple origins including your Vercel domain
2. **Manifest.json**: Updated to reflect your app name
3. **Environment Variables**: Comprehensive configuration for both local and production

## Testing

After deployment:
1. Test login/signup flow
2. Verify API calls work from both localhost and Vercel
3. Check that CORS errors are resolved
4. Ensure manifest.json loads without 401 errors
