# Render Deployment Guide for Legal Ninja API

## Prerequisites

- Render account (https://render.com)
- MongoDB Atlas account with a connection string (free tier available)
- All API keys ready (OpenAI, Paystack, etc.)
- Git repository pushed to GitHub

## Step 1: Set Up MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas)
2. Create a free tier cluster
3. Create a database user with strong credentials
4. Whitelist Render's IP range (0.0.0.0/0 for simplicity, or configure specific IPs)
5. Copy your connection string in the format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/legal_ninja?retryWrites=true&w=majority
   ```

## Step 2: Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `legal-ninja-api`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

## Step 3: Add Environment Variables

In the Render dashboard, add the following environment variables in the **Environment** section:

### Required Variables
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/legal_ninja?retryWrites=true&w=majority
JWT_SECRET=your-very-long-random-secret-key-min-32-chars
OPENAI_API_KEY=sk-proj-...
FRONTEND_URL=https://your-frontend-domain.com
```

### Payment & AI Provider Keys
```
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
GEMINI_API_KEY=... (optional)
GROQ_API_KEY=... (optional)
FLW_SECRET_KEY=... (optional)
FLW_PUBLIC_KEY=... (optional)
ADMIN_SECRET_KEY=generate-secure-random-hex-string
```

**Note**: Render automatically assigns a `PORT` environment variable. You don't need to set it manually.

## Step 4: Deploy

1. Click **Create Web Service**
2. Render will automatically deploy when you push to your GitHub branch
3. Monitor the deployment in the **Logs** tab
4. Once deployed, your API will be available at: `https://legal-ninja-api.onrender.com`

## Step 5: Update Frontend Configuration

Update your frontend's API base URL from `http://localhost:4000` to your Render service URL:

```typescript
// Example in your frontend config
const API_BASE_URL = 
  process.env.NODE_ENV === 'production'
    ? 'https://legal-ninja-api.onrender.com'
    : 'http://localhost:4000';
```

## Step 6: Test the Deployment

```bash
# Health check
curl https://legal-ninja-api.onrender.com/health

# Expected response
{"status":"ok","ts":"2025-01-15T10:30:00.000Z"}
```

## Important Notes

### Cold Starts
- Free tier instances spin down after 15 minutes of inactivity
- First request after inactive period takes 30-50 seconds
- Upgrade to paid plan for always-on service

### Scaling
- Start with free tier for testing
- Upgrade to **Standard** ($7/month) for production traffic
- Consider **Pro** plan for high-traffic applications

### Database Considerations
- MongoDB Atlas free tier allows 512MB storage
- Sufficient for initial development and testing
- Upgrade if you need more storage or performance

### CORS Configuration
- Update `FRONTEND_URL` to your deployed frontend domain
- Socket.io connections require proper CORS setup
- Current config allows credentials with CORS origin

### File Uploads
- Multer is configured with 1MB limit for JSON bodies
- Adjust `express.json({ limit: "1mb" })` if needed
- Consider using cloud storage (AWS S3, Cloudinary) for large files

### Rate Limiting
- Global: 300 requests per 15 minutes
- Auth: 20 requests per 15 minutes
- Questions: 60 requests per 60 seconds
- Adjust in `src/index.ts` if needed

## Troubleshooting

### Deployment Fails
1. Check **Build Logs** for compilation errors
2. Ensure all dependencies in `package.json` are correct
3. Verify TypeScript compiles: `npm run build` locally
4. Check Node version matches `.node-version` file

### Server Crashes After Deployment
1. Check **Runtime Logs** for error messages
2. Verify all required environment variables are set
3. Test MongoDB connection string is correct
4. Ensure `MONGODB_URI` has correct IP whitelist

### CORS Errors
1. Verify `FRONTEND_URL` matches your actual frontend domain
2. Check frontend is sending requests to correct API base URL
3. Ensure credentials are enabled if needed

### Socket.io Connection Issues
1. Verify CORS is properly configured
2. Check firewall/network settings
3. Ensure frontend is using correct socket server URL

## Monitoring & Logs

- **Logs**: View real-time logs in Dashboard → **Logs** tab
- **Metrics**: Available in Dashboard → **Metrics** tab
- **Alerts**: Set up notifications for crashes in **Alerts**

## Custom Domain (Optional)

1. Go to your Render service settings
2. Under **Custom Domains**, add your domain
3. Update DNS records as instructed by Render
4. Update `FRONTEND_URL` and frontend config with new domain

## Continuous Deployment

Render automatically redeploys when you push to the connected GitHub branch. To disable auto-deploy:
- Service Settings → **Auto-Deploy** → Toggle off
- Deploy manually via Dashboard when ready

## Next Steps

1. ✅ Push this prepared server to GitHub
2. ✅ Create MongoDB Atlas cluster
3. ✅ Connect GitHub to Render
4. ✅ Set environment variables
5. ✅ Test health endpoint
6. ✅ Update frontend config
7. ✅ Deploy frontend
8. ✅ Monitor logs and metrics

## Useful Commands

```bash
# Test locally before deploying
npm install
npm run build
npm start

# Check for TypeScript errors
npx tsc --noEmit

# View environment setup
cat .env.example
```
