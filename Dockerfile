# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# ── Stage 2: build the Next.js app ───────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Placeholder values so the build doesn't throw on missing env vars.
# These are never used at runtime — real values come from the container environment.
ARG TURSO_DATABASE_URL=libsql://build-placeholder.turso.io
ARG AUTH_SECRET=build-placeholder-secret-must-be-at-least-32-chars

ENV TURSO_DATABASE_URL=$TURSO_DATABASE_URL
ENV AUTH_SECRET=$AUTH_SECRET
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: minimal production image ────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Next.js standalone output — self-contained server
COPY --from=builder /app/public                  ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

# Migration files + runner script
COPY --from=builder /app/db/migrations           ./db/migrations
COPY --from=builder /app/scripts/migrate.mjs     ./scripts/migrate.mjs
COPY --from=builder /app/scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
