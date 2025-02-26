# Deep Wordsmith

![Deep Wordsmith](public/words-logo.svg)

A modern web application for exploring words, their etymologies, and visual mnemonics. Built with Next.js, TypeScript, and a minimalist design philosophy.

## Features

- **Word Exploration**: Discover the origins, meanings, and usage trends of words
- **Visual Mnemonics**: Generate visual representations of words to improve memory
- **Waitlist System**: Built-in user collection system for pre-launch marketing
- **Responsive Design**: Beautiful on all devices with a glass-morphism aesthetic

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/deep-wordsmith.git
   cd deep-wordsmith
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. If dependency conflicts occur (rare but possible), resolve them with:
   ```bash
   npm install --force
   ```

4. For persistent dependency issues, use the explain command to understand conflicts:
   ```bash
   npm explain [package-name]
   ```

### Environment Setup

1. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required API keys in `.env.local`:
   ```
   # Required for Perplexity API
   PERPLEXITY_API_KEY=your_perplexity_api_key

   # Required for Grok API
   GROK_API_KEY=your_grok_api_key

   # Required for image generation
   REPLICATE_API_TOKEN=your_replicate_api_token
   REPLICATE_FLUX_MODEL=your_replicate_model_id
   ```

3. For production waitlist functionality, set up Vercel KV:
   ```
   # Required for waitlist storage in production
   KV_REST_API_URL=your_kv_url
   KV_REST_API_TOKEN=your_kv_token
   KV_REST_API_READ_ONLY_TOKEN=your_read_only_token
   ```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

## Architecture

The application follows a clean, modular architecture:

- `src/components`: UI components with a focus on reusability
- `src/hooks`: Custom React hooks for data fetching and state management
- `src/lib`: Core utilities, API services, and configuration
- `src/app`: Next.js App Router pages and API routes

### API Integration

The application integrates with several AI services:

- **Perplexity**: For detailed word exploration and etymology
- **Grok**: For creative word associations and suggestions
- **Replicate**: For image generation based on word concepts

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables
4. Set up Vercel KV for waitlist functionality:
   ```bash
   vercel env add KV_REST_API_URL
   vercel env add KV_REST_API_TOKEN
   vercel env add KV_REST_API_READ_ONLY_TOKEN
   ```

## Advanced Configuration

### Customizing API Services

Each API service can be configured in `src/lib/ai-config.ts`:

```typescript
export const AI_CONFIG = {
  perplexity: {
    // configuration options
  },
  grok: {
    // configuration options
  },
  replicate: {
    // configuration options
  }
};
```

### ESLint Configuration

Modify `.eslintrc.json` to adjust linting rules according to your team's standards.

## Troubleshooting

### Common Issues

- **API Keys Not Working**: Ensure environment variables are correctly set and the APIs have sufficient quota
- **Type Errors**: Run `npm run type-check` to identify and fix TypeScript issues
- **Build Errors**: Check for ESLint errors with `npm run lint`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [SWR](https://swr.vercel.app/)
- [Replicate](https://replicate.com/)
- [Perplexity AI](https://www.perplexity.ai/)
- [Anthropic Claude](https://www.anthropic.com/)
