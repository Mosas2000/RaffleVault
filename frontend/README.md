# RaffleVault Frontend

Web interface for RaffleVault - a decentralized raffle marketplace on Base.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- wagmi + viem (Web3)
- RainbowKit (Wallet connection)

## Development

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_RAFFLE_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility functions
├── public/                # Static assets
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```
