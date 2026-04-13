# Catan.io

Catan multiplayer game, created with Next.js & Peer.js

## How to run the project

There is a `src/config.ts` file that is not committed (listed in `.gitignore`). Create it with at least:

```ts
export default {
  CODE_PREFIX: string, // required — salt for lobby code hashing
  LOBBYRTC_CONNECTION_URL: string, // required — LobbyRTC base URL, e.g. http://localhost:8080
  PEER_SECURE?: boolean, // optional; inferred from https URL when possible
  PEER_DEBUG_LEVEL?: number, // optional, default 0
};
```

PeerJS signaling is served by LobbyRTC on the same host, under the path `/peer`. The client derives host, port, and secure flag from `LOBBYRTC_CONNECTION_URL` (see `src/lib/LobbyRTCClient.ts`).

### LobbyRTC (lobby API + PeerJS)

LobbyRTC is a separate service: [github.com/itaylayzer/lobbyrtc](https://github.com/itaylayzer/lobbyrtc). Build the Docker image from that repository, then start it alongside this app.

**1. Clone and configure**

```bash
git clone https://github.com/itaylayzer/lobbyrtc.git
cd lobbyrtc
```

Create `config/config.json` (JSON array of games; at least one entry is required). Example for Catan:

```json
[
  { "name": "catan", "maxPlayers": 6 }
]
```

See the [LobbyRTC README](https://github.com/itaylayzer/lobbyrtc/blob/main/README.md) for field meanings and optional `.env` (ports, hostnames).

**2. Compile the `build/` folder**

The [upstream Dockerfile](https://github.com/itaylayzer/lobbyrtc/blob/main/Dockerfile) expects a pre-built `build/` directory (see `bun run build` in their `package.json`).

```bash
bun install
bun run build
```

**3. Build and tag the image**

From the same `lobbyrtc` directory (where `Dockerfile` and `build/` live):

```bash
docker build -t lobbyrtc .
```

This matches the `image: lobbyrtc` name used in this repo’s `docker-compose.yaml`.

**4. Run**

From **this** repository (catan.io), after the image exists:

```bash
docker compose up lobbyrtc
```

`docker-compose.yaml` mounts `./lobbyrtc/config` → `/app/config` so the container sees `config/config.json`. Edit files under `lobbyrtc/config/` here, or change the mount to point at the `config` directory inside your LobbyRTC clone.

- HTTP API and PeerJS: [http://localhost:8080](http://localhost:8080) (`/lobbies`, `/peer`, …)
- Operator dashboard: [http://localhost:9000](http://localhost:9000)

API and operational details: [USAGE.md](https://github.com/itaylayzer/lobbyrtc/blob/main/USAGE.md).

**Without Docker:** from the LobbyRTC clone, follow their README (`bun run dev` / `bun run start` after `bun run build`).
