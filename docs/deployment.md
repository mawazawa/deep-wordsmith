# Deep Words Deployment Guide

This guide provides instructions for deploying the Deep Words application to various hosting platforms.

## Pre-Deployment Checklist

Before deploying to production, ensure:

1. All environment variables are properly set in `.env.production`
2. API keys are valid and have proper permissions
3. The application builds successfully locally
4. All features have been tested
5. SVG fallback images are working properly
6. API routes are functioning correctly

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform for Next.js applications.

1. **Install Vercel CLI** (optional, but helpful for testing):
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables**:
   - Create a `.env.production` file based on `.env.production.example`
   - Add all required environment variables to Vercel dashboard

3. **Deploy**:
   ```bash
   # Login to Vercel
   vercel login

   # Deploy to production
   vercel --prod
   ```

4. **Configure Build Settings** (if needed):
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install --legacy-peer-deps`

### Option 2: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Create a `netlify.toml` file**:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [build.environment]
     NODE_VERSION = "20.6.0"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. **Configure Environment Variables**:
   - Add all variables from `.env.production` to Netlify dashboard

4. **Deploy**:
   ```bash
   # Login to Netlify
   netlify login

   # Deploy to production
   netlify deploy --prod
   ```

### Option 3: AWS Amplify

1. **Install Amplify CLI**:
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Configure Amplify**:
   ```bash
   amplify configure
   ```

3. **Initialize Amplify in your project**:
   ```bash
   amplify init
   ```

4. **Add hosting**:
   ```bash
   amplify add hosting
   ```

5. **Deploy**:
   ```bash
   amplify publish
   ```

### Option 4: Custom Server

For a traditional server deployment:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Transfer files to server**:
   ```bash
   # Example using rsync
   rsync -avz --delete .next/ package.json next.config.js public/ user@your-server:/path/to/app
   ```

3. **Install dependencies on server**:
   ```bash
   npm install --production --legacy-peer-deps
   ```

4. **Set environment variables on server**

5. **Start the application**:
   ```bash
   # Using PM2 (recommended)
   pm2 start npm --name "deep-wordsmith" -- start

   # Or directly
   npm start
   ```

## Post-Deployment Verification

After deployment, verify:

1. The application loads correctly
2. Environment variables are being read properly
3. API routes work as expected
4. Image generation functions properly
5. SVG fallbacks display correctly
6. The application works on mobile devices

## Troubleshooting Common Issues

### SVG Loading Issues

If SVG images fail to load, verify:
- `next.config.js` has `dangerouslyAllowSVG: true` in the images configuration
- SVG files are properly formatted with valid XML

### API Token Issues

If API tokens aren't recognized:
- Check that environment variables are properly set
- Verify the environment variable names match exactly what the code expects
- Try redeploying after clearing the cache

### Build Failures

If the build fails:
- Check for TypeScript errors
- Ensure all dependencies are installed
- Add the `--legacy-peer-deps` flag to npm install commands
- Verify Node.js version compatibility

## Continuous Deployment

For automated deployments, configure your Git provider with the hosting platform:

1. Connect your GitHub/GitLab repository to your hosting platform
2. Configure build settings
3. Set up environment variables securely
4. Enable automatic deployments on push to main/master branch