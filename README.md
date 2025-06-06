# Catan.io

Catan multiplayer game, created with Next.js & Peer.js \
The game is currently playable, [missing players global/private offer trade system](#todo)

## How to run the project

theres `src/config.ts` file that is hidden (inside .gitignore file), that his structure is:

```ts
export default {
	CODE_PREFIX: <string>, // required
	PEER_SERVER_HOST: <string?>, // optional
	PEER_SERVER_PORT: <number?>, // optional, default 443
	PEER_SECURE: <boolean?>, // optional, default false
	PEER_DEBUG_LEVEL: <number?>, // optional, default 0
};
```

to run the peer-js server locally run the following command:

```bash
npx peer --port 9000
```

## TODO

-   players trade: animations for all reasons & validations
-   states: use acordion for height animations
