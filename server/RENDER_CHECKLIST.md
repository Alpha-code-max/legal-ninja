# Render Deployment Checklist

## Pre-Deployment Checklist

### Code & Build
- [ ] `npm run build` runs without errors locally
- [ ] No TypeScript compilation errors
- [ ] All environment variables in `.env.example` are documented
- [ ] `.node-version` is set to `24` or your target version
- [ ] `package.json` scripts are correct:
  - [ ] `"build": "tsc"`
  - [ ] `"start": "node dist/index.js"`

### Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist includes Render ranges (0.0.0.0/0 or specific)
- [ ] Connection string copied and tested locally
- [ ] Database name is `legal_ninja`

### API Keys & Credentials
- [ ] OpenAI API key obtained (required)
- [ ] Paystack keys obtained (for payments)
- [ ] Gemini API key obtained (optional but recommended)
- [ ] Admin secret key generated (random 64+ char hex)
- [ ] JWT secret generated (random 32+ char string)
- [ ] All keys are valid and tested

### Environment Variables for Render
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI=` (full connection string)
- [ ] `JWT_SECRET=` (secure random)
- [ ] `OPENAI_API_KEY=` (your key)
- [ ] `GEMINI_API_KEY=` (your key or empty)
- [ ] `GROQ_API_KEY=` (your key or empty)
- [ ] `PAYSTACK_SECRET_KEY=` (live key)
- [ ] `PAYSTACK_PUBLIC_KEY=` (live key)
- [ ] `FLW_SECRET_KEY=` (if using Flutterwave)
- [ ] `FLW_PUBLIC_KEY=` (if using Flutterwave)
- [ ] `ADMIN_SECRET_KEY=` (secure random)
- [ ] `FRONTEND_URL=` (your frontend domain)

### GitHub & Render
- [ ] Repository pushed to GitHub
- [ ] GitHub repository is public or Render has access
- [ ] Render account created and authenticated
- [ ] GitHub connected to Render

### Frontend Configuration
- [ ] Frontend API base URL updated to Render URL
- [ ] Frontend environment variables configured
- [ ] Frontend can access Render API from deployed URL
- [ ] Socket.io server URL updated if needed

## Deployment Steps

1. **Create Render Web Service**
   - [ ] Service name: `legal-ninja-api`
   - [ ] Runtime: Node
   - [ ] Build command: `npm run build`
   - [ ] Start command: `npm start`

2. **Add Environment Variables**
   - [ ] All required variables added (see above)
   - [ ] No hardcoded secrets left in code

3. **Deploy**
   - [ ] Click "Create Web Service" or "Deploy"
   - [ ] Monitor build logs
   - [ ] Monitor runtime logs after deployment

4. **Post-Deployment Testing**
   - [ ] Health endpoint: `GET /health` returns 200
   - [ ] MongoDB connection works (check logs)
   - [ ] Frontend can connect to API
   - [ ] Authentication endpoints working
   - [ ] File uploads working (if applicable)
   - [ ] Payment processing configured

## Common Issues & Solutions

### Build Fails
- Check Node version in `.node-version`
- Verify all dependencies in `package.json`
- Check TypeScript configuration
- Run `npm install && npm run build` locally

### API Crashes on Startup
- Verify `MONGODB_URI` is correct
- Check MongoDB IP whitelist
- Confirm all required env vars are set
- Review runtime logs in Render dashboard

### CORS Issues
- Verify `FRONTEND_URL` is exact match
- Check frontend is using correct API base URL
- Ensure Socket.io CORS configuration

### Socket.io Connection Fails
- Verify CORS settings in frontend
- Check firewall rules
- Confirm frontend using correct URL with protocol

## Rollback Plan

If deployment fails:
1. Previous working version remains available
2. Render shows deployment history
3. Can revert to previous deployment manually
4. Or redeploy fixed code to Render

## Monitoring After Deployment

- [ ] Set up error alerts in Render
- [ ] Monitor logs for errors (first 24 hours)
- [ ] Test critical user flows
- [ ] Monitor database connection
- [ ] Watch for rate limiting issues
- [ ] Check payment webhook delivery

## Performance Notes

- Free tier instances have 512MB RAM (adequate for initial load)
- Cold starts on free tier: 30-50 seconds after inactivity
- Standard plan ($7/mo): always-on, faster performance
- Monitor memory and CPU usage in metrics

## Security Reminders

- Never commit `.env` file
- Rotate sensitive keys quarterly
- Keep dependencies updated
- Monitor security advisories: `npm audit`
- Use strong passwords for MongoDB
- Keep API keys secret and rotate regularly

## Next Optimization Steps

- [ ] Add monitoring/alerting
- [ ] Set up database backups
- [ ] Configure custom domain
- [ ] Implement logging/analytics
- [ ] Set up CI/CD improvements
- [ ] Add rate limiting adjustments based on usage
