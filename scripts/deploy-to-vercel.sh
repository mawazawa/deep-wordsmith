#!/bin/bash

# Deployment Script for Deep Wordsmith
# This script deploys the application to Vercel with proper configuration

# Colors for formatting
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print banner
echo "========================================="
echo "Deep Wordsmith Vercel Deployment"
echo "========================================="
echo ""

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}Error: Vercel CLI is not installed.${NC}"
  echo "Please install it with: npm install -g vercel"
  exit 1
fi

# Check if user is logged in to Vercel
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}You are not logged in to Vercel.${NC}"
  echo "Please login first:"
  vercel login
fi

# Run deployment verification
echo -e "${YELLOW}Running deployment checks...${NC}"
./scripts/deployment-check.sh
if [ $? -ne 0 ]; then
  echo -e "${RED}Deployment checks failed. Please fix the issues before deploying.${NC}"
  exit 1
fi

# Ask for environment name
read -p "Deploy to which environment? (development/preview/production) [production]: " ENV
ENV=${ENV:-production}

# Set deployment flags based on environment
if [ "$ENV" == "production" ]; then
  DEPLOY_FLAGS="--prod"
elif [ "$ENV" == "preview" ]; then
  DEPLOY_FLAGS="--prebuilt"
else
  DEPLOY_FLAGS=""
fi

# Ask for confirmation
echo ""
echo -e "${YELLOW}This will deploy Deep Wordsmith to Vercel in the ${ENV} environment.${NC}"
read -p "Continue? (y/N): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Deployment canceled."
  exit 0
fi

# Deploy to Vercel
echo -e "${GREEN}Deploying to Vercel (${ENV})...${NC}"
vercel $DEPLOY_FLAGS

# Check deployment status
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Deployment successful!${NC}"

  # Check if environment variables are set on Vercel
  echo -e "${YELLOW}Verifying environment variables...${NC}"

  # List of required variables
  ENV_VARS=("REPLICATE_API_TOKEN" "PERPLEXITY_API_KEY" "GROK_API_KEY" "ANTHROPIC_API_KEY")

  # Instructions for adding env vars
  echo ""
  echo -e "${YELLOW}Make sure these environment variables are set on Vercel:${NC}"
  for VAR in "${ENV_VARS[@]}"; do
    echo " - $VAR"
  done

  echo ""
  echo "You can add them by running:"
  echo "vercel env add <NAME>"

  echo ""
  echo -e "${GREEN}Deployment process completed.${NC}"
else
  echo -e "${RED}Deployment failed.${NC}"
  exit 1
fi