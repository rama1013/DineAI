FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
# Install deps using npm (cache layer)
RUN npm ci --only=production --ignore-scripts

# Development dependencies
FROM base AS dev-deps
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Development stage
FROM base AS dev-deps-runtime
COPY --from=dev-deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./
COPY next.config.ts postcss.config.mjs tsconfig.json eslint.config.mjs ./
COPY public ./public
COPY src ./src
COPY assets ./assets
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production build
FROM base AS builder
COPY --from=dev-deps /app/node_modules ./node_modules
# Copy config and non-frequently changed assets first for better cache usage
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./
COPY eslint.config.mjs ./
COPY public ./public
COPY assets ./assets
# Copy package.json for build scripts
COPY package.json ./
# Copy source code last (changes most frequently)
COPY src ./src
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_STANDALONE=true
ENV SKIP_ENV_VALIDATION=1
ENV CI=true
# Build using npm with production optimizations (skip type checking and linting)
RUN npm run build:prod

# Production runtime
FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/assets ./assets
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
