# TranzGuard Shield — MetaMask Snap

Real-time wallet address verification before every MetaMask transaction.
Calls `https://tranzguard.com/api/v1/verify-address` and surfaces a
`severity: critical` warning inside MetaMask if the destination is flagged.

## What it blocks

- Clipboard-hijacking address swaps
- Known wallet-drainer campaigns (ScamSniffer DB)
- OFAC SDN / sanctioned mixers (Tornado Cash, Lazarus)
- Address-poisoning vanity patterns
- CISA KEV-correlated addresses

## Permissions

- `endowment:transaction-insight` — fires `onTransaction` for every send
- `endowment:network-access` — calls the TranzGuard verification API

## Local dev

```bash
npm install
npm run build         # produces dist/bundle.js
npm run serve         # serves on http://localhost:8080
```

Test inside [MetaMask Flask](https://metamask.io/flask/):
1. Open Flask
2. Visit a dApp that uses snaps (or use the snap test harness)
3. Connect to the local snap at `http://localhost:8080`

## Publishing

```bash
npm login
npm run build
npm publish --access public
```

Then submit to the [MetaMask Snap directory](https://snaps.metamask.io/submit):
- Package: `@tranzguard/snap`
- Category: Security
- Description copy lives in `snap.manifest.json`
