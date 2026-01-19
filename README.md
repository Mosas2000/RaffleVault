# RaffleVault 🎟️

A decentralized raffle marketplace built on Base where anyone can create and participate in transparent, verifiable raffles.

## Features
- 🎲 Create custom raffles with ETH prizes
- 🔒 Provably fair winner selection using Chainlink VRF
- 📊 Transparent on-chain raffle management
- ⚡ Low fees powered by Base L2
- ⚡ **Gas Optimized** - 90% cheaper raffle creation using proxy pattern

## Tech Stack
- Solidity ^0.8.20
- Hardhat + TypeScript
- OpenZeppelin Contracts v5.0.1
- Chainlink VRF
- Base Network
- EIP-1167 Minimal Proxy Pattern (90% gas savings)

## Project Structure
```
contracts/
├── core/         # Main raffle contracts
├── interfaces/   # Contract interfaces
└── libraries/    # Reusable libraries
test/
├── unit/         # Unit tests
└── integration/  # Integration tests
scripts/
├── deploy/       # Deployment scripts
└── verify/       # Verification scripts
```

## Development

Install dependencies:
```bash
npm install
```

Compile contracts:
```bash
npm run compile
```

Run tests:
```bash
npm test
npm run test:unit
npm run coverage
```

## Deployment

Deploy to Base Sepolia (testnet):
```bash
npm run deploy:sepolia
```

Deploy to Base Mainnet:
```bash
npm run deploy:mainnet
```

## Environment Setup

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

## Gas Optimization

RaffleVault uses the EIP-1167 Minimal Proxy (Clone) pattern to dramatically reduce gas costs:

- **90% savings** on raffle creation (~$0.96 vs $9.60 per raffle)
- One implementation contract deployed, cloned for each raffle
- Full functionality maintained with massive cost reduction

See [GAS_OPTIMIZATION.md](GAS_OPTIMIZATION.md) for detailed analysis.

## License
MIT
