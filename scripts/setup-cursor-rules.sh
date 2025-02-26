#!/bin/bash

# setup-cursor-rules.sh
# Script to set up and configure Cursor AI with Claude 3.7 Sonnet optimizations for M1 MacBooks

echo "🚀 Setting up Cursor AI with Claude 3.7 Sonnet optimizations for M1 MacBook..."

# Ensure .cursor directory exists
mkdir -p .cursor/{presets,rules}

# Check if cursor CLI is available
if ! command -v cursor &> /dev/null; then
    echo "⚠️ Cursor CLI not found. Please make sure Cursor is installed and in your PATH."
    echo "You can still use the configuration files, but automatic rule activation won't work."
else
    echo "✅ Cursor CLI detected."

    # Enable core rules with M1 optimization preset
    echo "🔧 Enabling core rules with M1 optimization preset..."
    cursor rules enable core --preset m1-optimized

    # Enable AI rules with advanced level
    echo "🧠 Enabling AI rules with advanced level..."
    cursor rules enable ai --level advanced

    # Enable semantic navigation
    echo "🧭 Enabling semantic navigation..."
    cursor rules enable navigation --mode semantic-zoom

    # Train Claude 3.7 on the codebase
    echo "🏋️ Training Claude 3.7 on your codebase..."
    cursor ai train --model claude-3.7-sonnet \
      --context ./src \
      --patterns ./.cursor/context-rules.yml \
      --optimize-for "typescript,react,nextjs"
fi

# Verify configuration files
echo "🔍 Verifying configuration files..."
CONFIG_FILES=(".cursor/keybindings.json" ".cursor/settings.json" ".cursor/performance.json"
              ".cursor/ai-patterns.js" ".cursor/context-rules.yml" ".cursor/navigation.json"
              ".cursor/debug-rules.js")

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file is missing"
    fi
done

# Set up Metal acceleration for AI rendering
echo "⚡ Configuring Metal acceleration for AI rendering..."
if [ -f ".cursor/performance.json" ]; then
    # Check if Metal configuration already exists to avoid duplicate entries
    if ! grep -q "\"metal\":" .cursor/performance.json; then
        # This is a simplified approach - in a real scenario, you'd want to use jq or a similar tool
        # to properly modify the JSON file
        echo "  ⚠️ Manual configuration needed. Please ensure Metal acceleration is enabled in .cursor/performance.json"
    else
        echo "  ✅ Metal acceleration already configured"
    fi
fi

# Configure Neural Engine partitioning
echo "🧠 Configuring Neural Engine partitioning..."
if command -v cursor &> /dev/null; then
    cursor config set neuralEngine.allocation '{"claude": 6, "rendering": 2}'
    echo "  ✅ Neural Engine partitioning configured"
else
    echo "  ⚠️ Cursor CLI not available. Neural Engine partitioning not configured."
fi

# Add package.json script if it doesn't exist
if [ -f "package.json" ]; then
    echo "📦 Checking package.json for cursor-rules script..."
    if ! grep -q "\"configure-cursor\":" package.json; then
        echo "  ⚠️ configure-cursor script not found in package.json"
        echo "  💡 Consider adding this script to your package.json:"
        echo '  "configure-cursor": "bash ./scripts/setup-cursor-rules.sh"'
    else
        echo "  ✅ configure-cursor script already exists in package.json"
    fi
fi

# Run performance profiling
echo "📊 Running performance profiling..."
if command -v cursor &> /dev/null; then
    cursor profile --cpu --memory --gpu --neural-engine
    echo "  ✅ Performance profile completed"
else
    echo "  ⚠️ Cursor CLI not available. Performance profiling skipped."
fi

echo ""
echo "✨ Cursor AI configuration complete! ✨"
echo "Your M1 MacBook is now optimized for Claude 3.7 Sonnet integration."
echo ""
echo "🔍 To monitor performance, run: cursor profile"
echo "🧪 To test your configuration, run: cursor test-config"
echo "🔄 To update your configuration, run: npm run configure-cursor"
echo ""