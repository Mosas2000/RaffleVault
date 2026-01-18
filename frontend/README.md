# RaffleVault Frontend

Web interface for RaffleVault - a decentralized raffle marketplace on Base blockchain.

## Features

✅ **Browse Raffles** - View all active and completed raffles
✅ **Create Raffles** - Launch your own raffle with custom parameters
✅ **Buy Tickets** - Purchase tickets for raffles you want to enter
✅ **My Raffles** - Track raffles you've created and participated in
✅ **Wallet Integration** - Connect with RainbowKit (MetaMask, WalletConnect, etc.)
✅ **Real-time Updates** - Live data from Base blockchain
✅ **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: wagmi + viem
- **Wallet**: RainbowKit
- **Network**: Base (Mainnet & Sepolia)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
```

### Environment Variables

Create `.env.local` file:
```env
# Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_RAFFLE_FACTORY_ADDRESS=0x...

# Optional
NEXT_PUBLIC_ENABLE_TESTNETS=false
```

Get your WalletConnect Project ID: https://cloud.walletconnect.com

### Development
```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure
```
frontend/
├── app/                    # Next.js App Router pages
│   ├── create/            # Create raffle page
│   ├── my-raffles/        # User's raffles page
│   ├── raffle/[address]/  # Raffle detail page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── providers.tsx      # Web3 providers
│   ├── error.tsx          # Error boundary
│   ├── loading.tsx        # Loading page
│   └── not-found.tsx      # 404 page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── RaffleCard.tsx     # Raffle card display
│   ├── RaffleGrid.tsx     # Raffle grid layout
│   ├── BuyTicketsModal.tsx # Buy tickets modal
│   ├── Loading.tsx        # Loading states
│   └── EmptyState.tsx     # Empty state UI
├── config/                # Configuration
│   ├── wagmi.ts           # wagmi configuration
│   ├── contracts.ts       # Contract addresses
│   └── abis/              # Contract ABIs
└── hooks/                 # Custom hooks
    └── useRaffleData.ts   # Contract read hooks
```

## Features Detail

### Browse Raffles
- View all active raffles in a grid layout
- See prize amount, ticket price, and progress
- Filter by status (active/ended)
- Real-time updates

### Create Raffle
- Set prize amount
- Configure ticket price
- Set maximum tickets
- Choose duration (1-30 days)
- Set minimum tickets threshold

### Buy Tickets
- Purchase multiple tickets at once
- See total cost before buying
- Transaction confirmation
- Auto-refresh after purchase

### My Raffles
- View raffles you've created
- Track your participated raffles
- See your ticket counts
- Monitor raffle status

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

Build and deploy the `.next` directory:
```bash
npm run build
# Deploy .next folder to your platform
```

## Smart Contract Integration

The frontend interacts with:
- **RaffleFactory**: Creates new raffles
- **Raffle**: Individual raffle contracts

Contract addresses are configured in `config/contracts.ts`

ABIs are located in `config/abis/`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Join our Discord community

---

Built with ❤️ on Base
