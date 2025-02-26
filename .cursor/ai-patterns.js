Cursor.defineCodePattern({
  name: 'react-hook-pattern',
  language: 'typescript',
  pattern: /use[A-Z]\w+/,
  action: {
    type: 'claude-codegen',
    template: 'react-advanced-hook',
    positioning: 'surround'
  },
  hotkey: '⌘⇧H'
});

Cursor.defineCodePattern({
  name: 'glassmorphic-style',
  language: 'typescript',
  pattern: /glass-effect/,
  action: {
    type: 'claude-stylegen',
    variant: 'visionos-enhanced',
    positioning: 'inline'
  }
});

// Add Next.js App Router pattern
Cursor.defineCodePattern({
  name: 'next-app-route',
  language: 'typescript',
  pattern: /export\s+(async\s+)?(function|const)\s+(GET|POST|DELETE|PUT|PATCH)/i,
  action: {
    type: 'claude-routegen',
    template: 'next-route-handler',
    positioning: 'surround'
  },
  hotkey: '⌘⇧R'
});

// Add Tailwind component pattern
Cursor.defineCodePattern({
  name: 'tailwind-component',
  language: 'typescript',
  pattern: /className=["|']([\w\s-]*)/,
  action: {
    type: 'claude-uigen',
    template: 'tailwind-component',
    positioning: 'inline'
  },
  hotkey: '⌘⇧C'
});
