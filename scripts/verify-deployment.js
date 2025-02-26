#!/usr/bin/env node

/**
 * Deep Words - Deployment Verification Script
 *
 * This script checks that everything is configured correctly before deployment.
 * It verifies:
 * - Required environment variables
 * - Image fallback system
 * - Critical file presence
 * - Package.json configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors for prettier output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

console.log(`${colors.magenta}
╔═══════════════════════════════════════════════╗
║                                               ║
║      Deep Words - Deployment Verification     ║
║                                               ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

let errorCount = 0;
let warningCount = 0;

// Helper functions
function checkFile(filePath, critical = true) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    console.log(`${colors.green}✓ ${colors.reset}File exists: ${filePath}`);
    return true;
  } else {
    if (critical) {
      console.log(`${colors.red}✗ ${colors.reset}Critical file missing: ${filePath}`);
      errorCount++;
    } else {
      console.log(`${colors.yellow}! ${colors.reset}Optional file missing: ${filePath}`);
      warningCount++;
    }
    return false;
  }
}

function checkEnvVariable(name, critical = true) {
  const exists = process.env[name] !== undefined;

  if (exists) {
    console.log(`${colors.green}✓ ${colors.reset}Environment variable set: ${name}`);
    return true;
  } else {
    if (critical) {
      console.log(`${colors.red}✗ ${colors.reset}Critical environment variable missing: ${name}`);
      errorCount++;
    } else {
      console.log(`${colors.yellow}! ${colors.reset}Optional environment variable missing: ${name}`);
      warningCount++;
    }
    return false;
  }
}

// Check package.json
console.log(`\n${colors.cyan}Checking package.json configuration...${colors.reset}`);
const packageJson = require('../package.json');

if (packageJson.name === 'deep-words') {
  console.log(`${colors.green}✓ ${colors.reset}Package name is correct: ${packageJson.name}`);
} else {
  console.log(`${colors.red}✗ ${colors.reset}Package name should be 'deep-words' but is '${packageJson.name}'`);
  errorCount++;
}

// Check essential files
console.log(`\n${colors.cyan}Checking essential files...${colors.reset}`);
checkFile('next.config.js');
checkFile('public/words-logo.svg');
checkFile('public/favicon.ico');
checkFile('public/fallback/image-placeholder.svg');
checkFile('public/fallback/language-1.svg');
checkFile('public/fallback/language-2.svg');
checkFile('public/fallback/language-3.svg');

// Check SVG format - it's unlikely to fail if the file exists,
// but good to verify in case we accidentally used a non-SVG file
function checkSvgFormat(filePath) {
  if (!checkFile(filePath)) return false;

  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
    if (content.trim().startsWith('<svg')) {
      console.log(`${colors.green}✓ ${colors.reset}File is valid SVG: ${filePath}`);
      return true;
    } else {
      console.log(`${colors.red}✗ ${colors.reset}File is not a valid SVG: ${filePath}`);
      errorCount++;
      return false;
    }
  } catch (e) {
    console.log(`${colors.red}✗ ${colors.reset}Error reading file: ${filePath}`);
    errorCount++;
    return false;
  }
}

console.log(`\n${colors.cyan}Verifying SVG files format...${colors.reset}`);
checkSvgFormat('public/words-logo.svg');
checkSvgFormat('public/fallback/image-placeholder.svg');
checkSvgFormat('public/fallback/language-1.svg');
checkSvgFormat('public/fallback/language-2.svg');
checkSvgFormat('public/fallback/language-3.svg');

// Check environment configuration
console.log(`\n${colors.cyan}Checking for .env files...${colors.reset}`);
checkFile('.env.local', false);
checkFile('.env.production', false);

// Check build
console.log(`\n${colors.cyan}Checking build...${colors.reset}`);
try {
  console.log('Attempting to build the project (this may take a moment)...');
  // Use the build-check command which has --no-lint flag
  execSync('npm run build-check', {
    stdio: 'pipe'
  });
  console.log(`${colors.green}✓ ${colors.reset}Build completed successfully`);
} catch (error) {
  console.log(`${colors.red}✗ ${colors.reset}Build failed with error: ${error.message}`);
  errorCount++;
}

// Summary
console.log(`\n${colors.cyan}Verification Summary${colors.reset}`);
console.log(`${colors.magenta}═══════════════════════════════════════════════${colors.reset}`);
if (errorCount === 0 && warningCount === 0) {
  console.log(`${colors.green}All checks passed! Your project is ready for deployment.${colors.reset}`);
} else {
  if (errorCount > 0) {
    console.log(`${colors.red}Found ${errorCount} critical issues that must be fixed before deployment.${colors.reset}`);
  }
  if (warningCount > 0) {
    console.log(`${colors.yellow}Found ${warningCount} warnings that you should review.${colors.reset}`);
  }
}
console.log(`${colors.magenta}═══════════════════════════════════════════════${colors.reset}\n`);

// Exit with appropriate code
process.exit(errorCount > 0 ? 1 : 0);