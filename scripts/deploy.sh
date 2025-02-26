#!/bin/bash

# Deep Wordsmith Deployment Script
# This script handles building and deploying the application to production

echo "🚀 Starting deployment process for Deep Wordsmith..."

# Check for environment files
if [ ! -f ".env.production" ]; then
  echo "⚠️ Warning: .env.production file not found!"
  echo "Creating a template file from .env.local.example..."
  cp .env.local.example .env.production
  echo "⚠️ Please edit .env.production with your production credentials."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --production

# Run type checks
echo "🔍 Running type checks..."
npx tsc --noEmit

# Build the application
echo "🏗️ Building the application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please check the errors above."
  exit 1
fi

# Run tests (if available)
if [ -f "package.json" ] && grep -q "\"test\":" "package.json"; then
  echo "🧪 Running tests..."
  npm test

  # Check if tests passed
  if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix the tests before deploying."
    exit 1
  fi
fi

# Deploy (customize this section based on your hosting provider)
echo "🌐 Deploying to production..."
# Uncomment and modify the appropriate deployment command:
# For Vercel:
# npx vercel --prod
# For Netlify:
# npx netlify deploy --prod
# For AWS Amplify:
# npx amplify publish
# For a custom server:
# rsync -avz --delete out/ user@server:/path/to/deployment/

echo "✅ Deployment completed successfully!"
echo "🔗 Visit your application at: https://your-production-url.com"