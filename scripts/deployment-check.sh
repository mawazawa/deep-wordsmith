#!/bin/bash

# Deployment Verification Script for Deep Wordsmith
# This script checks if the application is ready for deployment

# Colors for formatting
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to check if command succeeded
check_success() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1 passed${NC}"
    return 0
  else
    echo -e "${RED}✗ $1 failed${NC}"
    return 1
  fi
}

# Print banner
echo "========================================="
echo "Deep Wordsmith Deployment Verification"
echo "========================================="
echo ""

# Check if required environment variables are present
echo "Checking environment variables..."
required_vars=("REPLICATE_API_TOKEN" "PERPLEXITY_API_KEY" "GROK_API_KEY" "ANTHROPIC_API_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
  echo -e "${GREEN}✓ All required environment variables are set${NC}"
else
  echo -e "${RED}✗ Missing environment variables: ${missing_vars[*]}${NC}"
  echo -e "${YELLOW}Please set these variables before deployment${NC}"
fi

# Check for TypeScript errors
echo ""
echo "Checking TypeScript compilation..."
npx tsc --noEmit
check_success "TypeScript compilation"

# Check for linting errors
echo ""
echo "Checking linting..."
npx eslint --ext .js,.jsx,.ts,.tsx ./src
check_success "ESLint"

# Build the project
echo ""
echo "Testing production build..."
npm run build
build_success=$?
check_success "Production build"

echo ""
if [ $build_success -eq 0 ]; then
  echo -e "${GREEN}✓ Application is ready for deployment!${NC}"
  exit 0
else
  echo -e "${RED}✗ Application is not ready for deployment. Please fix the errors above.${NC}"
  exit 1
fi