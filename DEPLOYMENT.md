# RaffleVault Deployment Guide

This guide covers deploying RaffleVault contracts to Base Mainnet.

## Prerequisites

Before deploying, ensure you have:

✅ Base Mainnet ETH in your deployer wallet (~0.005 ETH recommended)
✅ BaseScan API key (get from https://basescan.org/myapikey)
✅ Private key of deployer wallet (NEVER commit this!)
✅ Hardhat environment configured

## Environment Setup

Create `.env` file in the root directory:
```env
# Deployer private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Base Mainnet RPC (Alchemy, Infura, or public)
BASE_MAINNET_RPC=https://mainnet.base.org

# BaseScan API key for verification
BASESCAN_API_KEY=your_basescan_api_key

# Platform settings (optional, defaults used if not set)
PLATFORM_WALLET=your_platform_wallet_address
PLATFORM_FEE=250
```

## Pre-Deployment Checklist

- [ ] Contracts fully tested (run `npm test`)
- [ ] `.env` file configured with private key and API keys
- [ ] Deployer wallet has sufficient ETH on Base Mainnet
- [ ] Code reviewed and audited (if applicable)
- [ ] Deployment parameters verified

## Deployment Steps

### 1. Compile Contracts
```bash
npm run compile
```

Verify compilation is successful with no errors.

### 2. Deploy to Base Mainnet
```bash
npm run deploy:mainnet
```

This will:
- Deploy RaffleFactory contract
- Wait for 5 block confirmations
- Save deployment info to `deployments/` directory
- Display contract address and next steps

**Expected output:**
```
🚀 Starting RaffleVault deployment to Base Mainnet...

Deploying contracts with account: 0x...
Account balance: X.XXX ETH

✅ RaffleFactory deployed to: 0x...
📄 Deployment info saved to: base-mainnet-XXXXX.json
```

### 3. Verify on BaseScan

After deployment, verify the contract:
```bash
npm run verify:mainnet
```

This will:
- Read the latest deployment file
- Verify RaffleFactory on BaseScan
- Provide BaseScan link to view verified source code

**Expected output:**
```
✅ Contract verified successfully!
🔗 View on BaseScan: https://basescan.org/address/0x...#code
```

### 4. Update Frontend Configuration

Update `frontend/.env.local` with the deployed contract address:
```env
NEXT_PUBLIC_RAFFLE_FACTORY_ADDRESS=0xYOUR_DEPLOYED_ADDRESS_HERE
```

### 5. Test on Mainnet

Create a test raffle to verify everything works:

1. Connect wallet to Base Mainnet
2. Navigate to /create
3. Create a small test raffle (e.g., 0.001 ETH prize)
4. Verify raffle appears on homepage
5. Test buying tickets
6. Verify transactions on BaseScan

## Deployment Info

All deployments are saved to `deployments/` directory with timestamp.

Example deployment file:
```json
{
  "network": "base-mainnet",
  "chainId": 8453,
  "deployer": "0x...",
  "timestamp": "2026-01-18T...",
  "contracts": {
    "RaffleFactory": {
      "address": "0x...",
      "platformWallet": "0x...",
      "platformFee": 250
    }
  },
  "transactionHash": "0x..."
}
```

## Post-Deployment

### Update Documentation

1. Update README.md with contract address
2. Update frontend documentation
3. Create announcement for launch

### Monitor

- Watch BaseScan for contract interactions
- Monitor platform fees collection
- Track raffle creations

### Security

- Consider transferring RaffleFactory ownership to multisig
- Set up monitoring for unusual activity
- Keep private keys secure

## Troubleshooting

### "Insufficient balance" Error
- Ensure deployer wallet has at least 0.005 ETH on Base Mainnet
- Check you're on the correct network

### "Nonce too high" Error
- Reset MetaMask account or clear transaction history
- Wait a few minutes and try again

### Verification Failed
- Ensure BASESCAN_API_KEY is set in .env
- Wait a few minutes after deployment
- Manually verify using BaseScan UI if needed

### Contract Already Verified
- This is fine! Verification was successful earlier
- View contract on BaseScan to confirm

## Mainnet Addresses

Once deployed, update this section:

**Base Mainnet (Chain ID: 8453)**
- RaffleFactory: `0x...` (Add after deployment)
- Platform Fee: 2.5%
- Platform Wallet: `0x...` (Add after deployment)

## Emergency Procedures

If issues arise post-deployment:

1. **Pause Factory**: Call `pauseFactory()` (owner only)
2. **Update Platform Fee**: Call `updatePlatformFee(newFee)` (owner only)
3. **Change Platform Wallet**: Call `updatePlatformWallet(newWallet)` (owner only)

## Support

For deployment issues:
- Check Hardhat documentation
- Review Base network status
- Open GitHub issue with deployment logs

---

**⚠️ IMPORTANT**: Never commit private keys or sensitive information to version control!
