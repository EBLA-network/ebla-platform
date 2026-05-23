# syntax=docker/dockerfile:1.6

# ============================================================================
# Stage 1: Builder — full toolchain, install all deps, compile everything
# ============================================================================
FROM node:18-slim AS builder

ENV NEXT_TELEMETRY_DISABLED=1 \
    SKIP_PREFLIGHT_CHECK=true \
    YARN_CACHE_FOLDER=/tmp/.yarn-cache

# Native build tools for node-sass + any other node-gyp module.
# These do NOT carry over to the runtime stage.
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifests first for better Docker layer caching.
COPY package.json yarn.lock /app/
COPY packages/ebla-ui/package.json /app/packages/ebla-ui/
COPY services/node-status/package.json /app/services/node-status/

# Install ALL deps (incl. devDeps). node-sass postinstall compiles here.
RUN yarn install --frozen-lockfile --network-timeout 600000

# Copy the rest of the source.
COPY tsconfig.json /app/
COPY packages/ebla-ui /app/packages/ebla-ui
COPY services/node-status /app/services/node-status

# Build ebla-ui first (Rollup) so node-status can import its built lib/.
RUN yarn workspace @ebla-network/ebla-ui build

# Build node-status (Next.js) — produces .next/ directory.
RUN yarn workspace @ebla-network/ebla-node-status build

# Prune node_modules to production-only. --ignore-scripts prevents node-sass
# from rebuilding (we already have its compiled binary from the install above).
RUN yarn install --frozen-lockfile --production --ignore-scripts --network-timeout 600000 \
    && yarn cache clean \
    && rm -rf /tmp/.yarn-cache


# ============================================================================
# Stage 2: Runtime — minimal Node 18 + pre-built artifacts + pruned modules
# ============================================================================
FROM node:18-slim AS runtime

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

WORKDIR /app

# Copy the pruned workspace from the builder. Includes:
# - production-only node_modules (with workspace symlinks intact)
# - packages/ebla-ui/lib (Rollup output, what node-status imports)
# - services/node-status/.next (Next.js build artifacts)
# - all package.json files needed for yarn workspace resolution
COPY --from=builder /app /app

WORKDIR /app/services/node-status

EXPOSE 3000

# Health check — Docker will auto-restart if Next.js hangs
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -q -O /dev/null http://localhost:3000/ || exit 1

CMD ["yarn", "start"]