#!/bin/bash

# Fraud Checker Backend - Vercel Deployment Script
# This script helps deploy the backend to Vercel

echo "🚀 Starting Vercel deployment process..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Please login to Vercel first:"
    echo "vercel login"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one based on env.example"
    echo "cp env.example .env"
    echo "Then edit .env with your actual values"
    exit 1
fi

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🔗 Your API is now available at the URL shown above"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up your database and run migrations"
    echo "2. Configure environment variables in Vercel dashboard"
    echo "3. Test your API endpoints"
    echo "4. Update your frontend to use the new API URL"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
