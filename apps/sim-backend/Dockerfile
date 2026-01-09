# Use official Bun image (Debian-based - compatible with our Bookworm-built binary)
FROM oven/bun:1

WORKDIR /app

# Install required system dependencies for the Movement CLI and health checks
RUN apt-get update && apt-get install -y \
    curl \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy pre-built Movement CLI binary (built on Debian Bookworm)
COPY bin/movement /usr/local/bin/movement
RUN chmod +x /usr/local/bin/movement

# Verify the binary works
RUN /usr/local/bin/movement --version || echo "Warning: CLI version check failed"

# Set the CLI path environment variable
ENV APTOS_CLI_PATH=/usr/local/bin/movement

# Copy package files first for better caching
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Drizzle migrations if needed
RUN bun run db:generate || true

# Expose the port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3005/health || exit 1

# Start the application
CMD ["bun", "run", "start"]
