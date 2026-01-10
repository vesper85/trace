# Trace

A blockchain transaction simulation platform for Movement Network. Trace allows developers to test and simulate transactions before deploying them on-chain.

## 🌐 Production URLs

| Service | URL |
|---------|-----|
| **Website (App)** | https://tracce.lol |
| **Documentation** | https://docs.tracce.lol |
| **Backend API** | https://backend.tracce.lol |

[![Website](https://img.shields.io/badge/Website-tracce.lol-orange)](https://tracce.lol)
[![Docs](https://img.shields.io/badge/Docs-docs.tracce.lol-blue)](https://docs.tracce.lol)
[![API](https://img.shields.io/badge/API-backend.tracce.lol-green)](https://backend.tracce.lol)

## 🚀 Features

- **VirtualNet** - Create isolated virtual networks for testing
- **Transaction Simulator** - Simulate Move transactions without spending real gas
- **Real-time Feedback** - Get instant feedback on transaction outcomes
- **Event Tracking** - Track all events emitted during simulation
- **Write Set Analysis** - Inspect state changes before committing

## 📦 Project Structure

This is a [Turborepo](https://turbo.build/repo) monorepo containing:

### Apps

| App | Description | Tech Stack |
|-----|-------------|------------|
| `apps/web` | Main web application | Next.js 16, React 19, TailwindCSS |
| `apps/docs` | Documentation site | Next.js 14, Nextra |
| `apps/sim-backend` | Simulation API backend | Bun, Elysia, Drizzle ORM |

### Packages

| Package | Description |
|---------|-------------|
| `@repo/ui` | Shared React component library |
| `@repo/eslint-config` | ESLint configurations |
| `@repo/typescript-config` | Shared TypeScript configurations |

## 📦 Related Repositories

| Repository | URL |
|------------|-----|
| **Movement Core (Fork)** | https://github.com/vesper85/movement-core-new |


## 🛠️ Getting Started

### Prerequisites

- Node.js >= 18
- [pnpm](https://pnpm.io/) >= 9.0.0
- [Bun](https://bun.sh/) (for sim-backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/vesper85/trace.git
cd trace

# Install dependencies
pnpm install
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm turbo dev --filter=web
pnpm turbo dev --filter=docs
pnpm turbo dev --filter=sim-backend
```

### Build

```bash
# Build all apps
pnpm build

# Build specific app
pnpm turbo build --filter=web
```

## 🔧 Movement CLI Binary

The sim-backend requires the Movement CLI binary for transaction simulation. It's stored in:

```
apps/sim-backend/bin/movement
```

### Building from Source

```bash
# Clone the Movement repo (forked)
git clone https://github.com/vesper85/movement-core-new.git
cd movement-core-new

# Build the CLI (requires Rust)
cargo build --release -p movement

# Binary will be at: target/release/movement
```

Pre-built binaries are available at [Movement Releases](https://github.com/movementlabsxyz/movement/releases).

## 🚀 Quick API Test

```bash
# Health check
curl https://backend.tracce.lol/health

# Create a session
curl -X POST https://backend.tracce.lol/sessions/init \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "network": "movement-mainnet"}'
```

## 📚 Documentation

- [Overview](https://docs.tracce.lol/)
- [Getting Started](https://docs.tracce.lol/getting-started)
- [Simulator](https://docs.tracce.lol/simulator)
- [VirtualNet](https://docs.tracce.lol/virtualnet)
- [API Reference](https://docs.tracce.lol/api-reference)
- [Examples](https://docs.tracce.lol/examples)

## 🏗️ Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Overview

| App | Platform |
|-----|----------|
| `apps/web` | Vercel |
| `apps/docs` | Vercel |
| `apps/sim-backend` | Railway/Azure |

## 💬 Contact

| Platform | Link |
|----------|------|
| **Twitter/X** | [@beanbagjunkie](https://x.com/beanbagjunkie) |
| **Telegram** | [@beanbagjunkie](https://t.me/beanbagjunkie) |

## 📄 License

MIT
