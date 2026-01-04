# Use official Bun image
FROM oven/bun:1

WORKDIR /app

# Copy package files first for better caching
COPY apps/sim-backend/package.json ./apps/sim-backend/
COPY apps/sim-backend/bun.lock* ./apps/sim-backend/

WORKDIR /app/apps/sim-backend

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY apps/sim-backend/. .

# Generate Drizzle migrations if needed
RUN bun run db:generate || true

# Expose the port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3005/health || exit 1

# Start the application
CMD ["bun", "run", "start"]
