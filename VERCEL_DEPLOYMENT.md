# Vercel Deployment Guide for Fraud Checker Backend

This guide will help you deploy your Fraud Checker backend to Vercel as a serverless application.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **Cloud Database**: Set up a MySQL database (recommended: PlanetScale, Railway, or Neon)
4. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Database Setup

Since Vercel doesn't support persistent file storage, you'll need a cloud database:

### Option A: PlanetScale (Recommended)
1. Go to [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get your connection string
4. Update your `DATABASE_URL` environment variable

### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new MySQL database
3. Get your connection string
4. Update your `DATABASE_URL` environment variable

### Option C: Neon
1. Go to [neon.tech](https://neon.tech)
2. Create a new PostgreSQL database (you'll need to update Prisma schema)
3. Get your connection string
4. Update your `DATABASE_URL` environment variable

## Step 2: Environment Variables

Create a `.env.local` file in your backend directory with the following variables:

```bash
# Copy from env.example and update with your values
NODE_ENV=production
DATABASE_URL="your-database-connection-string"
JWT_ACCESS_SECRET="your-super-secret-access-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FRONTEND_URL="https://your-frontend-domain.vercel.app"
```

## Step 3: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 4: Deploy to Vercel

### Method 1: Using Vercel CLI

1. **Navigate to your backend directory:**
   ```bash
   cd backend
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy your project:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - What's your project's name? **fraud-checker-backend**
   - In which directory is your code located? **./**

5. **Set environment variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_ACCESS_SECRET
   vercel env add JWT_REFRESH_SECRET
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add FRONTEND_URL
   ```

6. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Method 2: Using Vercel Dashboard

1. **Connect your Git repository:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Select the backend folder as the root directory

2. **Configure the project:**
   - Framework Preset: **Other**
   - Root Directory: **backend**
   - Build Command: **npm run vercel-build**
   - Output Directory: **Leave empty**

3. **Set environment variables:**
   - Go to Project Settings > Environment Variables
   - Add all required environment variables

4. **Deploy:**
   - Click "Deploy"

## Step 5: Database Migration

After deployment, you need to run database migrations:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database (optional)
npx prisma db seed
```

## Step 6: File Upload Considerations

**Important**: Vercel has limitations with file uploads in serverless functions:

1. **File size limit**: 4.5MB per request
2. **No persistent storage**: Files are not stored permanently
3. **Temporary storage**: Files are only available during the request

### Recommended Solutions:

1. **Use Vercel Blob Storage:**
   ```bash
   npm install @vercel/blob
   ```

2. **Use Cloudinary:**
   ```bash
   npm install cloudinary
   ```

3. **Use AWS S3:**
   ```bash
   npm install aws-sdk
   ```

## Step 7: Update Frontend Configuration

Update your frontend to use the new Vercel backend URL:

```javascript
// In your frontend config
const API_BASE_URL = 'https://your-backend-domain.vercel.app/api';
```

## Step 8: Testing

Test your deployed API:

```bash
# Health check
curl https://your-backend-domain.vercel.app/api/health

# Test authentication
curl -X POST https://your-backend-domain.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"googleId":"test","name":"Test User","email":"test@example.com"}'
```

## Troubleshooting

### Common Issues:

1. **Database Connection Issues:**
   - Check your `DATABASE_URL` format
   - Ensure your database allows connections from Vercel's IPs
   - Check if SSL is required

2. **Environment Variables:**
   - Make sure all required variables are set
   - Check variable names (case-sensitive)
   - Redeploy after adding new variables

3. **File Upload Issues:**
   - Implement cloud storage solution
   - Check file size limits
   - Update upload middleware

4. **CORS Issues:**
   - Update `FRONTEND_URL` environment variable
   - Check CORS configuration in your code

### Debug Commands:

```bash
# Check Vercel logs
vercel logs

# Check function logs
vercel logs --follow

# Check environment variables
vercel env ls
```

## Performance Optimization

1. **Database Connection Pooling:**
   - Use connection pooling for better performance
   - Consider using Prisma's connection pooling

2. **Caching:**
   - Implement Redis for caching (optional)
   - Use Vercel's edge caching

3. **Cold Starts:**
   - Keep functions warm with scheduled pings
   - Optimize bundle size

## Monitoring

1. **Vercel Analytics:**
   - Enable Vercel Analytics in your dashboard
   - Monitor function performance

2. **Error Tracking:**
   - Implement error tracking (Sentry, Bugsnag)
   - Monitor logs regularly

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate secrets regularly

2. **Database Security:**
   - Use SSL connections
   - Implement proper access controls
   - Regular security updates

3. **API Security:**
   - Implement rate limiting
   - Use HTTPS only
   - Validate all inputs

## Cost Considerations

- **Vercel Pro**: $20/month for production use
- **Database**: Varies by provider
- **Storage**: Additional cost for file storage
- **Bandwidth**: Included in Vercel plans

## Next Steps

1. Set up monitoring and alerting
2. Implement CI/CD pipeline
3. Set up staging environment
4. Configure custom domain
5. Implement backup strategies

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)

---

**Note**: This deployment uses serverless functions, which have some limitations compared to traditional servers. Consider these limitations when designing your application architecture.
