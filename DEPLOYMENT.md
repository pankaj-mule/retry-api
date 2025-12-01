# Deployment Guide for Retry API

This guide covers deploying the retry-api to various free hosting platforms.

## 🚀 Quick Deploy Options

### 1. Render (Recommended - Easiest)

**Steps:**
1. Push your code to GitHub
2. Go to https://render.com and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `retry-api`
   - **Root Directory**: `retry-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `PORT`: `3000` (Render sets this automatically, but you can override)
     - `MAX_IPS`: `1000` (optional)

6. Click "Create Web Service"
7. Your app will be live at: `https://retry-api.onrender.com` (or custom domain)

**Free Tier:**
- 750 hours/month
- Spins down after 15 minutes of inactivity (first request may be slow)
- Automatic HTTPS
- Custom domain support

---

### 2. Railway

**Steps:**
1. Push your code to GitHub
2. Go to https://railway.app and sign up
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js
6. Set Root Directory to: `retry-api`
7. Add environment variables:
   - `MAX_IPS`: `1000` (optional)
8. Deploy!

**Free Tier:**
- $5 credit/month
- No spin-down
- Automatic HTTPS
- Custom domain support

---

### 3. Fly.io

**Steps:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. In the `retry-api` directory, run: `fly launch`
3. Follow the prompts
4. Deploy: `fly deploy`

**Free Tier:**
- 3 shared-cpu VMs
- 3GB persistent volumes
- 160GB outbound data transfer

---

### 4. Cyclic

**Steps:**
1. Push your code to GitHub
2. Go to https://cyclic.sh and sign up
3. Click "Deploy Now"
4. Connect GitHub and select your repo
5. Set:
   - **Root Directory**: `retry-api`
   - **Start Command**: `npm start`
6. Deploy!

**Free Tier:**
- Unlimited deployments
- Automatic HTTPS
- Custom domains

---

### 5. Vercel (Serverless)

**Note:** Requires slight modification for Express apps.

**Steps:**
1. Create `vercel.json` in `retry-api`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

2. Push to GitHub
3. Go to https://vercel.com
4. Import your repository
5. Set Root Directory: `retry-api`
6. Deploy!

---

## 📝 Important Notes

### Environment Variables
All platforms support environment variables. Set these:
- `PORT`: Usually set automatically by the platform
- `MAX_IPS`: Maximum IPs to track (default: 1000)

### Root Directory
Since `retry-api` is in a subdirectory, you need to:
- Set the **Root Directory** to `retry-api` in platform settings, OR
- Move the `retry-api` folder contents to the root (if deploying separately)

### Custom Domain
Most platforms allow custom domains:
1. Add your domain in platform settings
2. Update DNS records as instructed
3. Wait for SSL certificate (automatic)

---

## 🔧 Testing Your Deployment

Once deployed, test your API:

```bash
# Health check
curl https://your-app-url.com/health

# Test retry endpoint
curl "https://your-app-url.com/api/retry?retry=3"

# Check stats
curl https://your-app-url.com/api/stats
```

---

## 💡 Recommendation

**For simplicity**: Use **Render** or **Railway**
- Easy setup
- Good free tiers
- Automatic HTTPS
- No complex configuration needed

**For performance**: Use **Fly.io**
- No spin-down
- Global edge deployment
- Better for production use

