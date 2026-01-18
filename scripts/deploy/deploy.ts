import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🚀 Starting RaffleVault deployment to Base Mainnet...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    if (balance < ethers.parseEther("0.001")) {
        throw new Error("❌ Insufficient balance for deployment. Need at least 0.001 ETH");
    }

    // Deployment parameters
    const platformWallet = deployer.address; // Can be changed to a different address
    const platformFee = 250; // 2.5% in basis points

    console.log("Deployment Parameters:");
    console.log("- Platform Wallet:", platformWallet);
    console.log("- Platform Fee:", platformFee / 100, "%");
    console.log("- Network: Base Mainnet (Chain ID: 8453)\n");

    // Confirm deployment
    console.log("⚠️  WARNING: Deploying to MAINNET!");
    console.log("This will use real ETH. Make sure you want to proceed.\n");

    // Deploy RaffleFactory
    console.log("📝 Deploying RaffleFactory...");
    const RaffleFactory = await ethers.getContractFactory("RaffleFactory");
    const raffleFactory = await RaffleFactory.deploy(platformWallet, platformFee);

    console.log("⏳ Waiting for deployment transaction...");
    await raffleFactory.waitForDeployment();
    const factoryAddress = await raffleFactory.getAddress();

    console.log("✅ RaffleFactory deployed to:", factoryAddress);

    // Wait for a few block confirmations
    console.log("\n⏳ Waiting for block confirmations...");
    await raffleFactory.deploymentTransaction()?.wait(5);

    console.log("✅ Deployment confirmed!\n");

    // Save deployment info
    const deploymentInfo = {
        network: "base-mainnet",
        chainId: 8453,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            RaffleFactory: {
                address: factoryAddress,
                platformWallet: platformWallet,
                platformFee: platformFee,
            }
        },
        transactionHash: raffleFactory.deploymentTransaction()?.hash,
    };

    const deploymentsDir = path.join(__dirname, "../../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `base-mainnet-${Date.now()}.json`;
    fs.writeFileSync(
        path.join(deploymentsDir, filename),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("📄 Deployment info saved to:", filename);
    console.log("\n🎉 Deployment completed successfully!\n");

    console.log("📋 Next Steps:");
    console.log("1. Verify contract on BaseScan:");
    console.log(`   npx hardhat verify --network baseMainnet ${factoryAddress} "${platformWallet}" ${platformFee}`);
    console.log("\n2. Update frontend .env.local:");
    console.log(`   NEXT_PUBLIC_RAFFLE_FACTORY_ADDRESS=${factoryAddress}`);
    console.log("\n3. Test creating a raffle on mainnet");
    console.log("\n4. Update documentation with contract address\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
