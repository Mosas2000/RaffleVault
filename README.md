# RaffleVault 🎟️

A decentralized raffle marketplace built on Base where anyone can create and participate in transparent, verifiable raffles.

## Features
- 🎲 Create custom raffles with ETH prizes
- 🔒 Provably fair winner selection using Chainlink VRF
- 📊 Transparent on-chain raffle management
- ⚡ Low fees powered by Base L2

## Tech Stack
- Solidity ^0.8.20
- Hardhat + TypeScript
- OpenZeppelin Contracts v5.0.1
- Chainlink VRF
- Base Network

## Project Structure
```
RaffleVault/
├── contracts/              # Smart contracts
│   ├── core/              # Raffle and RaffleFactory
│   ├── interfaces/        # Contract interfaces
│   └── libraries/         # Helper libraries
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── config/           # Configuration
│   └── hooks/            # Custom React hooks
├── test/                  # Smart contract tests
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
└── scripts/              # Deployment scripts
```

## Getting Started

### Smart Contracts
```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Base Sepolia
npm run deploy:sepolia
```

### Frontend
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

See [frontend/README.md](frontend/README.md) for detailed frontend documentation.

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

## License
MIT
