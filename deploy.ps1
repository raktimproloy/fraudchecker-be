# Fraud Checker Backend - Vercel Deployment Script (PowerShell)
# This script helps deploy the backend to Vercel

Write-Host "🚀 Starting Vercel deployment process..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
} catch {
    Write-Host "❌ Vercel CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in to Vercel
try {
    vercel whoami | Out-Null
} catch {
    Write-Host "❌ Please login to Vercel first:" -ForegroundColor Red
    Write-Host "vercel login" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Please create one based on env.example" -ForegroundColor Yellow
    Write-Host "Copy-Item env.example .env" -ForegroundColor Yellow
    Write-Host "Then edit .env with your actual values" -ForegroundColor Yellow
    exit 1
}

# Generate Prisma client
Write-Host "📦 Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

# Check deployment status
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🔗 Your API is now available at the URL shown above" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Set up your database and run migrations" -ForegroundColor White
    Write-Host "2. Configure environment variables in Vercel dashboard" -ForegroundColor White
    Write-Host "3. Test your API endpoints" -ForegroundColor White
    Write-Host "4. Update your frontend to use the new API URL" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}
