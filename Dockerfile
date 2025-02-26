# Use Node 20.16-alpine as base image
FROM node:20.16-alpine3.19 AS base

# Install pnpm globally
RUN npm install -g pnpm

# Development stage
FROM base AS development
WORKDIR /node
# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./
# Install all dependencies for development
RUN pnpm install --frozen-lockfile
WORKDIR /node/app

# For live development, the source code will be mounted, so no COPY here
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
WORKDIR /build
# Copy package.json and pnpm-lock.yaml for production
COPY package.json pnpm-lock.yaml ./

# Skip husky prepare script in production
ENV HUSKY=0

# Install production dependencies without running lifecycle scripts
RUN pnpm install --no-frozen-lockfile --prod --ignore-scripts && pnpm store prune && npm cache clean --force

# Copy the entire source code into container
COPY . .

# Build the Next.js application
RUN npm run build

# Document the port that should be published
EXPOSE 3000

# Start the Next.js application in production mode
CMD ["npm", "start"]

# Add labels for better documentation
LABEL org.opencontainers.image.source="https://github.com/mawazawa/deep-words-app"
LABEL org.opencontainers.image.description="Deep Wordsmith - Visual Linguistic Exploration"
LABEL org.opencontainers.image.licenses="MIT"