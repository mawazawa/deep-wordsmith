#!/bin/bash

# Deep Wordsmith GitHub Setup Script
# This script helps set up a GitHub repository and prepare for Vercel deployment

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${PURPLE}
╔═══════════════════════════════════════════════╗
║                                               ║
║     Deep Wordsmith GitHub Setup Assistant     ║
║                                               ║
╚═══════════════════════════════════════════════╝
${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git is not installed. Please install Git and try again.${NC}"
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}Warning: GitHub CLI (gh) is not installed.${NC}"
    echo -e "We recommend installing it for easier repository setup: https://cli.github.com/"
    echo -e "Continuing with standard git commands...\n"
    HAS_GH=false
else
    HAS_GH=true
    # Check if logged in
    if ! gh auth status &> /dev/null; then
        echo -e "${YELLOW}You need to log in to GitHub CLI.${NC}"
        gh auth login
    fi
fi

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo -e "${BLUE}Initializing git repository...${NC}"
    git init
    echo -e "${GREEN}✓ Git repository initialized${NC}\n"
else
    echo -e "${BLUE}Git repository already initialized${NC}\n"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}No .gitignore found. Creating one...${NC}"
    cat > .gitignore << EOF
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF
    echo -e "${GREEN}✓ .gitignore created${NC}\n"
fi

# Ask for repository name
echo -e "${BLUE}Enter GitHub repository name (default: deep-wordsmith):${NC}"
read repo_name
repo_name=${repo_name:-deep-wordsmith}

# Ask for repository visibility
echo -e "${BLUE}Should the repository be public or private? (public/private, default: public):${NC}"
read repo_visibility
repo_visibility=${repo_visibility:-public}

# Create GitHub repository
if [ "$HAS_GH" = true ]; then
    echo -e "${BLUE}Creating GitHub repository...${NC}"
    gh repo create "$repo_name" --"$repo_visibility" --source=. --remote=origin
    echo -e "${GREEN}✓ GitHub repository created${NC}\n"
else
    echo -e "${YELLOW}Please create a repository on GitHub with the name: ${repo_name}${NC}"
    echo -e "${YELLOW}Then run the following commands to link your local repository:${NC}"
    echo -e "git remote add origin https://github.com/YOUR_USERNAME/${repo_name}.git"
    echo -e "git branch -M main"
    echo -e "git push -u origin main\n"

    # Ask if they've done this
    echo -e "${BLUE}Have you created the repository and added the remote? (y/n):${NC}"
    read remote_added
    if [[ ! "$remote_added" =~ ^[Yy] ]]; then
        echo -e "${YELLOW}Please create the repository and run this script again when ready.${NC}"
        exit 0
    fi
fi

# Stage files
echo -e "${BLUE}Staging files for commit...${NC}"
git add .
echo -e "${GREEN}✓ Files staged${NC}\n"

# Commit files
echo -e "${BLUE}Committing files...${NC}"
git commit -m "Initial commit: Deep Wordsmith application"
echo -e "${GREEN}✓ Files committed${NC}\n"

# Push to GitHub
echo -e "${BLUE}Pushing to GitHub...${NC}"
git branch -M main
git push -u origin main
echo -e "${GREEN}✓ Code pushed to GitHub repository${NC}\n"

# Vercel setup instructions
echo -e "${PURPLE}Next Steps for Vercel Deployment:${NC}"
echo -e "1. Install Vercel CLI: ${YELLOW}npm install -g vercel${NC}"
echo -e "2. Log in to Vercel: ${YELLOW}vercel login${NC}"
echo -e "3. Initialize Vercel project: ${YELLOW}vercel${NC}"
echo -e "4. Deploy to production: ${YELLOW}vercel --prod${NC}"
echo -e "\n${BLUE}Don't forget to set up your environment variables in the Vercel dashboard!${NC}"

echo -e "\n${GREEN}GitHub repository setup complete!${NC}"
echo -e "Repository URL: ${YELLOW}https://github.com/YOUR_USERNAME/${repo_name}${NC}"

# Optional: Open Vercel dashboard
echo -e "\n${BLUE}Would you like to open the Vercel dashboard now? (y/n):${NC}"
read open_vercel
if [[ "$open_vercel" =~ ^[Yy] ]]; then
    open "https://vercel.com/dashboard"
fi