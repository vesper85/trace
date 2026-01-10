# Important Links

## 🌐 Production URLs

| Service | URL |
|---------|-----|
| **Website (App)** | https://tracce.lol |
| **Documentation** | https://docs.tracce.lol |
| **Backend API** | https://backend.tracce.lol |

## 📦 Repositories

| Repository | URL |
|------------|-----|
| **Trace (This Repo)** | https://github.com/vesper85/trace |
| **Movement Repo** | https://github.com/vesper85/movement-core-new |

## 💬 Socials (ME)

| Platform | Link |
|----------|------|
| **Twitter/X** | https://x.com/beanbagjunkie |
| **Telegram** | https://t.me/beanbagjunkie |
| **WhatsApp** | +91 9607671964 |

## 🔧 Movement CLI Binary

The Movement CLI binary is required for the simulation backend. It's stored in:

```
apps/sim-backend/bin/movement
```

### Building the Movement CLI

To build the Movement CLI from source:

```bash
# Clone the Movement repo
git clone https://github.com/movementlabsxyz/movement.git
cd movement

# Build the CLI (requires Rust)
cargo build --release -p movement

# Binary will be at: target/release/movement
```

### Downloading Pre-built Binary

Check the [Movement Releases](https://github.com/movementlabsxyz/movement/releases) page for pre-built binaries.

## 🚀 Quick API Test

```bash
# Health check
curl https://backend.tracce.lol/health

# Create a session
curl -X POST https://backend.tracce.lol/sessions/init \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "network": "movement-mainnet"}'
```

## 📚 Documentation Pages

- [Overview](https://docs.tracce.lol/)
- [Getting Started](https://docs.tracce.lol/getting-started)
- [Simulator](https://docs.tracce.lol/simulator)
- [VirtualNet](https://docs.tracce.lol/virtualnet)
- [API Reference](https://docs.tracce.lol/api-reference)
- [Examples](https://docs.tracce.lol/examples)
