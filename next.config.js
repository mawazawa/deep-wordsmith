/** @type {import('next').NextConfig} */

// Import bundle analyzer with conditional usage
let withBundleAnalyzer = (config) => config;
if (process.env.ANALYZE === 'true') {
  // Using dynamic import to avoid linter error
  withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true });
}

const nextConfig = {
  reactStrictMode: true,
  // Simplified output options
  output: 'standalone',
  // Disable unused features
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure image domains for Replicate and fallback images
  images: {
    domains: [
      'replicate.delivery',
      'images.unsplash.com',
      'source.unsplash.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbxt.replicate.delivery',
        pathname: '/**',
      }
    ],
    dangerouslyAllowSVG: true, // Enable SVG loading for fallback images
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // External packages that should be treated as server components
  // Using the correct configuration name for Next.js 14
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000']
    },
    // Moving sharp to the correct location in experimental
    serverComponentsExternalPackages: ['sharp']
  },

  // Configure headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Environment variables that should be available to the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    ENABLE_VISUAL_MNEMONICS: process.env.ENABLE_VISUAL_MNEMONICS,
    ENABLE_SEMANTIC_CLUSTERS: process.env.ENABLE_SEMANTIC_CLUSTERS,
    // NODE_OPTIONS removed as it's not allowed in Next.js env config
  },

  // Configure webpack
  webpack: (config) => {
    // Add SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Adjust for large responses from AI models
    config.externals = [...(config.externals || []), 'canvas', 'jsdom'];

    // Increase memory limit for Node.js
    // This is the proper way to set NODE_OPTIONS
    if (process.env.NODE_ENV === 'production') {
      // Only in production to avoid development issues
      process.env.NODE_OPTIONS = '--max-old-space-size=4096';
      console.log('✅ Set Node.js memory limit to 4GB for production build');
    }

    return config;
  },

  // Increase serverless function timeout for AI processing
  serverRuntimeConfig: {
    maxDuration: 60, // 60 seconds for AI calls
  },

  // Set higher timeout for build process
  staticPageGenerationTimeout: 180,
};

// Export the config with bundle analyzer
module.exports = withBundleAnalyzer(nextConfig);