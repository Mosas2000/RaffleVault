import { expect } from "chai";
import { ethers } from "hardhat";
import { RaffleFactory, Raffle } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RaffleFactory Contract", function () {
    let raffleFactory: RaffleFactory;
    let owner: SignerWithAddress;
    let platformWallet: SignerWithAddress;
    let creator1: SignerWithAddress;
    let creator2: SignerWithAddress;

    const PLATFORM_FEE = 250; // 2.5%
    const TICKET_PRICE = ethers.parseEther("0.01");
    const MAX_TICKETS = 100n;
    const DURATION = 7n * 24n * 60n * 60n; // 7 days
    const MINIMUM_TICKETS = 10n;
    const PRIZE_AMOUNT = ethers.parseEther("1");

    beforeEach(async function () {
        [owner, platformWallet, creator1, creator2] = await ethers.getSigners();

        const RaffleFactoryContract = await ethers.getContractFactory("RaffleFactory");
        raffleFactory = await RaffleFactoryContract.deploy(platformWallet.address, PLATFORM_FEE);
    });

    describe("Deployment", function () {
        it("Should deploy with correct platform wallet", async function () {
            expect(await raffleFactory.platformWallet()).to.equal(platformWallet.address);
        });

        it("Should deploy with correct platform fee", async function () {
            expect(await raffleFactory.platformFee()).to.equal(PLATFORM_FEE);
        });

        it("Should deploy and set raffle implementation", async function () {
            const implAddress = await raffleFactory.raffleImplementation();
            expect(implAddress).to.not.equal(ethers.ZeroAddress);
            expect(ethers.isAddress(implAddress)).to.be.true;
        });

        it("Should set deployer as owner", async function () {
            expect(await raffleFactory.owner()).to.equal(owner.address);
        });

        it("Should revert if platform wallet is zero address", async function () {
            const RaffleFactoryContract = await ethers.getContractFactory("RaffleFactory");
            await expect(
                RaffleFactoryContract.deploy(ethers.ZeroAddress, PLATFORM_FEE)
            ).to.be.revertedWithCustomError(raffleFactory, "InvalidPlatformWallet");
        });

        it("Should revert if platform fee exceeds 10%", async function () {
            const RaffleFactoryContract = await ethers.getContractFactory("RaffleFactory");
            await expect(
                RaffleFactoryContract.deploy(platformWallet.address, 1001)
            ).to.be.revertedWithCustomError(raffleFactory, "InvalidPlatformFee");
        });
    });

    describe("Raffle Creation", function () {
        it("Should create a raffle successfully", async function () {
            const tx = await raffleFactory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const receipt = await tx.wait();
            expect(receipt).to.not.be.null;
        });

        it("Should emit RaffleCreated event", async function () {
            await expect(
                raffleFactory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                )
            ).to.emit(raffleFactory, "RaffleCreated");
        });

        it("Should track created raffles", async function () {
            await raffleFactory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const totalRaffles = await raffleFactory.getTotalRaffles();
            expect(totalRaffles).to.equal(1);
        });

        it("Should track raffles by creator", async function () {
            await raffleFactory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const creatorRaffles = await raffleFactory.getRafflesByCreator(creator1.address);
            expect(creatorRaffles.length).to.equal(1);
        });

        it("Should create multiple raffles", async function () {
            await raffleFactory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            await raffleFactory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const totalRaffles = await raffleFactory.getTotalRaffles();
            expect(totalRaffles).to.equal(2);
        });

        it("Should track raffles for different creators", async function () {
            await raffleFactory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            await raffleFactory.connect(creator2).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const creator1Raffles = await raffleFactory.getRafflesByCreator(creator1.address);
            const creator2Raffles = await raffleFactory.getRafflesByCreator(creator2.address);

            expect(creator1Raffles.length).to.equal(1);
            expect(creator2Raffles.length).to.equal(1);
        });

        it("Should create raffle with correct parameters", async function () {
            const tx = await raffleFactory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const receipt = await tx.wait();
            const event = receipt?.logs.find((log: any) => {
                try {
                    return raffleFactory.interface.parseLog(log)?.name === "RaffleCreated";
                } catch {
                    return false;
                }
            });

            const parsedEvent = raffleFactory.interface.parseLog(event as any);
            const raffleAddress = parsedEvent?.args[0];

            const raffle = await ethers.getContractAt("Raffle", raffleAddress);
            expect(await raffle.creator()).to.equal(creator1.address);
            expect(await raffle.ticketPrice()).to.equal(TICKET_PRICE);
            expect(await raffle.maxTickets()).to.equal(MAX_TICKETS);
        });
    });

    describe("Admin Functions", function () {
        it("Should update platform wallet", async function () {
            const newWallet = creator1.address;
            await raffleFactory.updatePlatformWallet(newWallet);
            expect(await raffleFactory.platformWallet()).to.equal(newWallet);
        });

        it("Should emit PlatformWalletUpdated event", async function () {
            const newWallet = creator1.address;
            await expect(raffleFactory.updatePlatformWallet(newWallet))
                .to.emit(raffleFactory, "PlatformWalletUpdated")
                .withArgs(platformWallet.address, newWallet);
        });

        it("Should revert if non-owner tries to update platform wallet", async function () {
            await expect(
                raffleFactory.connect(creator1).updatePlatformWallet(creator1.address)
            ).to.be.revertedWithCustomError(raffleFactory, "OwnableUnauthorizedAccount");
        });

        it("Should update platform fee", async function () {
            const newFee = 500; // 5%
            await raffleFactory.updatePlatformFee(newFee);
            expect(await raffleFactory.platformFee()).to.equal(newFee);
        });

        it("Should emit PlatformFeeUpdated event", async function () {
            const newFee = 500;
            await expect(raffleFactory.updatePlatformFee(newFee))
                .to.emit(raffleFactory, "PlatformFeeUpdated")
                .withArgs(PLATFORM_FEE, newFee);
        });

        it("Should revert if non-owner tries to update platform fee", async function () {
            await expect(
                raffleFactory.connect(creator1).updatePlatformFee(500)
            ).to.be.revertedWithCustomError(raffleFactory, "OwnableUnauthorizedAccount");
        });

        it("Should revert if platform fee exceeds 10%", async function () {
            await expect(
                raffleFactory.updatePlatformFee(1001)
            ).to.be.revertedWithCustomError(raffleFactory, "InvalidPlatformFee");
        });
    });

    describe("Pause Functionality", function () {
        it("Should pause the factory", async function () {
            await raffleFactory.pauseFactory();
            expect(await raffleFactory.paused()).to.be.true;
        });

        it("Should unpause the factory", async function () {
            await raffleFactory.pauseFactory();
            await raffleFactory.unpauseFactory();
            expect(await raffleFactory.paused()).to.be.false;
        });

        it("Should prevent raffle creation when paused", async function () {
            await raffleFactory.pauseFactory();
            await expect(
                raffleFactory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(raffleFactory, "EnforcedPause");
        });

        it("Should revert if non-owner tries to pause", async function () {
            await expect(
                raffleFactory.connect(creator1).pauseFactory()
            ).to.be.revertedWithCustomError(raffleFactory, "OwnableUnauthorizedAccount");
        });

        it("Should revert if non-owner tries to unpause", async function () {
            await raffleFactory.pauseFactory();
            await expect(
                raffleFactory.connect(creator1).unpauseFactory()
            ).to.be.revertedWithCustomError(raffleFactory, "OwnableUnauthorizedAccount");
        });
    });

    describe("View Functions", function () {
        it("Should return empty array for new creator", async function () {
            const raffles = await raffleFactory.getRafflesByCreator(creator1.address);
            expect(raffles.length).to.equal(0);
        });

        it("Should return correct total raffles count", async function () {
            expect(await raffleFactory.getTotalRaffles()).to.equal(0);

            await raffleFactory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            expect(await raffleFactory.getTotalRaffles()).to.equal(1);
        });

        it("Should return all raffles", async function () {
            await raffleFactory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            await raffleFactory.connect(creator2).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const allRaffles = await raffleFactory.getAllRaffles();
            expect(allRaffles.length).to.equal(2);
        });
    });
});
