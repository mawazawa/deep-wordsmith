// Advanced debugging and validation rules for Claude 3.7 Sonnet integration
Cursor.registerValidationRule({
  name: 'type-safety-check',
  language: 'typescript',
  async validate(code) {
    const response = await Cursor.ai.query({
      engine: 'claude-3.7-sonnet',
      prompt: `Analyze this TypeScript code for type safety:\n\n${code}`,
      temperature: 0.2
    });
    return response.includes('TYPE_SAFE') ? true : response;
  },
  autoFix: true
});

// React hooks validation
Cursor.registerValidationRule({
  name: 'react-hooks-rules',
  language: ['typescript', 'tsx'],
  pattern: /use[A-Z]\w+/,
  async validate(code) {
    const response = await Cursor.ai.query({
      engine: 'claude-3.7-sonnet',
      prompt: `Check if this React hook follows the Rules of Hooks:\n\n${code}`,
      temperature: 0.1
    });
    return response.includes('HOOKS_COMPLIANT') ? true : response;
  },
  autoFix: true,
  fixTemplate: 'react-hook-fix'
});

// Performance optimization suggestions
Cursor.registerAnalyzer({
  name: 'performance-analyzer',
  language: ['typescript', 'tsx', 'javascript', 'jsx'],
  async analyze(code, filePath) {
    // Only analyze files that are likely to impact performance
    if (!filePath.includes('/components/') && !filePath.includes('/hooks/')) {
      return null;
    }

    const response = await Cursor.ai.query({
      engine: 'claude-3.7-sonnet',
      prompt: `Analyze this code for performance issues, focusing on React rendering optimization:\n\n${code}`,
      temperature: 0.3
    });

    return {
      suggestions: response,
      severity: 'info',
      position: 'gutter'
    };
  },
  throttle: 5000 // Only run every 5 seconds to preserve M1 resources
});

// Memory leak detection for useEffect
Cursor.registerAnalyzer({
  name: 'memory-leak-detector',
  language: ['typescript', 'tsx'],
  pattern: /useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*?return\s+\(\)\s*=>\s*\{[\s\S]*?\}\s*\}/,
  async analyze(code) {
    const response = await Cursor.ai.query({
      engine: 'claude-3.7-sonnet',
      prompt: `Check if this useEffect cleanup function properly prevents memory leaks:\n\n${code}`,
      temperature: 0.2
    });

    if (response.includes('POTENTIAL_MEMORY_LEAK')) {
      return {
        suggestions: response,
        severity: 'warning',
        position: 'inline'
      };
    }

    return null;
  }
});

// Console log detector for production code
Cursor.registerLinter({
  name: 'console-log-detector',
  language: ['typescript', 'tsx', 'javascript', 'jsx'],
  pattern: /console\.(log|debug|info)/,
  lint(match, context) {
    // Don't flag console logs in test files
    if (context.filePath.includes('/test/') || context.filePath.includes('.test.')) {
      return null;
    }

    return {
      message: 'Console statement detected in production code',
      severity: 'warning',
      fix: {
        type: 'replace',
        replacement: '// ' + match[0]
      }
    };
  }
});
