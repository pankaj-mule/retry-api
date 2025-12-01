# Vercel Deployment Guide for Retry API

This guide will help you deploy the retry-api to Vercel.

## 📋 Prerequisites

1. A GitHub account
2. Your code pushed to a GitHub repository
3. A Vercel account (sign up at https://vercel.com - it's free!)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

Make sure your `retry-api` folder contains:
- ✅ `api/index.js` (serverless function wrapper)
- ✅ `vercel.json` (Vercel configuration)
- ✅ `package.json` (dependencies)
- ✅ All other necessary files

### Step 2: Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. Sign in with your GitHub account (recommended)

### Step 3: Import Your Project

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Click **"Import"**

### Step 4: Configure Project Settings

Vercel should auto-detect Node.js. Configure:

1. **Root Directory**: 
   - Click "Edit" next to Root Directory
   - Set to: `retry-api`
   - This tells Vercel where your app is located

2. **Build Settings** (usually auto-detected):
   - Framework Preset: `Other`
   - Build Command: `npm install` (or leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

3. **Environment Variables** (optional):
   - Click "Environment Variables"
   - Add: `MAX_IPS` = `1000` (or any value you want)
   - Note: `PORT` is automatically set by Vercel

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Once deployed, you'll see a success message with your URL!

Your app will be live at: `https://your-project-name.vercel.app`

## 🔧 Configuration Files Explained

### `vercel.json`
This file tells Vercel how to handle your Express app:
- Routes all requests to `api/index.js`
- Uses `@vercel/node` to run Node.js serverless functions

### `api/index.js`
This is your Express app wrapped as a Vercel serverless function:
- Exports the Express app (instead of calling `app.listen()`)
- Vercel handles the serverless execution

## 🌐 Custom Domain (Optional)

1. In your Vercel project dashboard, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain name
4. Follow the DNS configuration instructions
5. Vercel automatically provisions SSL certificates

## 🧪 Testing Your Deployment

Once deployed, test your endpoints:

```bash
# Health check
curl https://your-project.vercel.app/health

# Test retry endpoint
curl "https://your-project.vercel.app/api/retry?retry=3"

# Check stats
curl https://your-project.vercel.app/api/stats

# Check status
curl "https://your-project.vercel.app/api/status?retry=3"
```

## ⚠️ Important Notes

### Serverless Limitations

1. **Cold Starts**: First request after inactivity may be slower (1-2 seconds)
2. **In-Memory Cache**: The LRU cache is per-instance. In serverless:
   - Cache persists during the function's warm period
   - Cache resets on cold starts
   - For production with many instances, consider using Vercel KV or Edge Config

### For Production Use with Persistent Cache

If you need persistent cache across all instances, consider:

1. **Vercel KV** (Redis-based):
   ```bash
   vercel kv create
   ```
   Then use `@vercel/kv` in your code

2. **Vercel Edge Config**:
   For global, low-latency key-value storage

### Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:
- `MAX_IPS`: Maximum IPs to track (default: 1000)

## 🔄 Updating Your Deployment

Every time you push to your GitHub repository:
1. Vercel automatically detects the push
2. Creates a new deployment
3. Runs your build
4. Deploys the new version

You can also manually trigger deployments from the Vercel dashboard.

## 📊 Monitoring

Vercel provides:
- **Analytics**: Request counts, response times
- **Logs**: Function execution logs
- **Deployments**: History of all deployments

Access these from your project dashboard.

## 🆘 Troubleshooting

### Build Fails
- Check that `package.json` has all dependencies
- Verify `api/index.js` exists and exports the app correctly
- Check build logs in Vercel dashboard

### 404 Errors
- Verify `vercel.json` routes are correct
- Check that Root Directory is set to `retry-api`
- Ensure `api/index.js` exports the Express app

### Cache Not Working
- This is expected in serverless - cache is per-instance
- For persistent cache, use Vercel KV (see above)

## 🎉 You're Done!

Your retry-api is now live on Vercel with:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments
- ✅ Free tier (generous limits)

Need help? Check Vercel's docs: https://vercel.com/docs

