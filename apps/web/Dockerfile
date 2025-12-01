# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8.15.0

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/web ./apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build core package first
WORKDIR /app/packages/core
RUN pnpm build

# Build web app
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy Next.js standalone build
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js using standalone server
CMD ["node", "apps/web/server.js"]
