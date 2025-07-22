# WizSpeek® Render Deployment Guide

## Critical Files for GitHub Upload

To fix the login issue on Render, you need to update these files in your GitHub repository:

### 1. **server/index.ts** ✅ UPDATED
- Added auto-seeding functionality for production
- Checks if admin users exist on startup
- Automatically seeds database if empty

### 2. **seed.ts** ✅ UPDATED  
- Exports seed function as default for importing
- Only runs immediately when executed directly

### 3. **Build Configuration**
You have two options for the build command on Render:

**Option A: Update package.json build script (Recommended)**
```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist && esbuild seed.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
```

**Option B: Use the render-build.js script**
- Upload the `render-build.js` file
- Set Render build command to: `node render-build.js`

### 4. **Environment Variables on Render**
Make sure these are set in your Render dashboard:
- `NODE_ENV=production`
- `DATABASE_URL=your_postgres_url`
- Any other required secrets

## How Auto-Seeding Works

1. **Server starts** → Checks if admin user "calvarado" exists
2. **If no admin users** → Runs seed script automatically  
3. **Creates all demo accounts** with correct passwords
4. **Login works immediately** without manual seeding

## Login Credentials (After Auto-Seed)

**Admin Accounts:**
- Username: `calvarado` | Password: `NewSecurePassword2025!`
- Username: `dzambrano` | Password: `NewSecurePassword2025!`

**User Accounts:**
- Username: `testuser` | Password: `password`
- Username: `alice` | Password: `password`
- Username: `bob` | Password: `password`
- Username: `charlie` | Password: `password`

## Upload to GitHub

1. Download the updated files from this Replit
2. Upload to your GitHub repository: "Nebusis_WizSpeek_NodeFull_V5"
3. Redeploy on Render
4. The login issue will be resolved automatically

The auto-seeding ensures that every fresh deployment has working admin accounts.