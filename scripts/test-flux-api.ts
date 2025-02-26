/**
 * Replicate Test Script for Flux Model
 * This script can be used to test the Replicate API with Flux model directly without going through the UI
 *
 * Usage:
 * 1. Set the REPLICATE_API_TOKEN environment variable
 * 2. Run this script with ts-node:
 *    npx ts-node scripts/test-flux-api.ts "your prompt here"
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Get API token from environment or .env file
const apiToken = process.env.REPLICATE_API_TOKEN;
const fluxModel = process.env.REPLICATE_FLUX_MODEL || 'black-forest-labs/flux-1.1-pro';

async function generateImage(prompt: string) {
  console.log(`🔍 Testing Replicate API with prompt: "${prompt}"`);

  if (!apiToken) {
    console.error('❌ No REPLICATE_API_TOKEN found in environment variables');
    console.log('Please set the REPLICATE_API_TOKEN environment variable and try again');
    return;
  }

  try {
    console.log('Initializing Replicate client...');
    const replicate = new Replicate({
      auth: apiToken,
    });

    const enhancedPrompt = `${prompt}, high quality, detailed, 4k, professional, clear visualization, educational, minimalist style, elegant design`;

    console.log(`🤖 Sending request to Replicate for model: ${fluxModel}`);
    console.log('This may take a moment...');

    const output = await replicate.run(
      fluxModel as `${string}/${string}` | `${string}/${string}:${string}`,
      {
        input: {
          prompt: enhancedPrompt,
          prompt_upsampling: true,
          width: 512,
          height: 512,
          num_inference_steps: 25,
          scheduler: "K_EULER",
          guidance_scale: 7.5,
        },
      }
    );

    // Handle the output based on its type
    let imageUrl = '';
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      console.error('❌ Unexpected response format from Replicate:', output);
      return;
    }

    console.log('✅ Success! Image URL:', imageUrl);

    // Download the image
    if (imageUrl) {
      await downloadImage(imageUrl, prompt);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function downloadImage(url: string, prompt: string) {
  try {
    console.log('Downloading image...');

    const response = await fetch(url);
    const buffer = await response.buffer();

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'test-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Save the image
    const sanitizedPrompt = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const outputPath = path.join(outputDir, `${sanitizedPrompt}_${Date.now()}.png`);
    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ Image saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error downloading image:', error);
  }
}

// Main execution
const prompt = process.argv[2];
if (!prompt) {
  console.error('❌ Please provide a prompt as a command line argument');
  console.log('Example: npx ts-node scripts/test-flux-api.ts "a beautiful landscape"');
  process.exit(1);
}

generateImage(prompt);