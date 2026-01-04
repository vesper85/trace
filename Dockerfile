# Use official Bun image
FROM oven/bun:1

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace configuration files (package.json now includes workspaces field)
COPY package.json pnpm-workspace.yaml ./

# Copy the typescript-config package (workspace dependency)
COPY packages/typescript-config ./packages/typescript-config/

# Copy sim-backend package files
COPY apps/sim-backend/package.json apps/sim-backend/bun.lock* ./apps/sim-backend/

# Install dependencies for sim-backend from root context
# Bun needs to see the workspace structure to resolve @repo/typescript-config
# Using --cwd ensures we install only for sim-backend, but workspace is still recognized
RUN bun install --cwd apps/sim-backend

# Change to sim-backend directory
WORKDIR /app/apps/sim-backend

# Copy sim-backend source code
COPY apps/sim-backend/. .

# Generate Drizzle migrations if needed
RUN bun run db:generate || true

#sd

# Expose the port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3005/health || exit 1

# Start the application
CMD ["bun", "run", "start"]
