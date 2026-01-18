import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🔍 Starting contract verification on BaseScan...\n");

    // Read latest deployment file
    const deploymentsDir = path.join(__dirname, "../../deployments");
    const files = fs.readdirSync(deploymentsDir)
        .filter(f => f.startsWith("base-mainnet"))
        .sort()
        .reverse();

    if (files.length === 0) {
        throw new Error("No deployment files found. Deploy contracts first.");
    }

    const latestFile = files[0];
    console.log("📄 Reading deployment from:", latestFile);

    const deploymentData = JSON.parse(
        fs.readFileSync(path.join(deploymentsDir, latestFile), "utf-8")
    );

    const factoryAddress = deploymentData.contracts.RaffleFactory.address;
    const platformWallet = deploymentData.contracts.RaffleFactory.platformWallet;
    const platformFee = deploymentData.contracts.RaffleFactory.platformFee;

    console.log("\nContract Details:");
    console.log("- Address:", factoryAddress);
    console.log("- Platform Wallet:", platformWallet);
    console.log("- Platform Fee:", platformFee, "basis points\n");

    console.log("⏳ Verifying RaffleFactory on BaseScan...");

    try {
        await run("verify:verify", {
            address: factoryAddress,
            constructorArguments: [platformWallet, platformFee],
            contract: "contracts/core/RaffleFactory.sol:RaffleFactory",
        });

        console.log("\n✅ Contract verified successfully!");
        console.log(`🔗 View on BaseScan: https://basescan.org/address/${factoryAddress}#code\n`);
    } catch (error: any) {
        if (error.message.includes("Already Verified")) {
            console.log("\n✅ Contract already verified on BaseScan");
            console.log(`🔗 View on BaseScan: https://basescan.org/address/${factoryAddress}#code\n`);
        } else {
            throw error;
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
