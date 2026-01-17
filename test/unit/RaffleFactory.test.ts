import { expect } from "chai";
import { ethers } from "hardhat";
import { RaffleFactory, Raffle } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RaffleFactory Contract", function () {
    let factory: RaffleFactory;
    let owner: SignerWithAddress;
    let platformWallet: SignerWithAddress;
    let creator1: SignerWithAddress;
    let creator2: SignerWithAddress;
    let user: SignerWithAddress;

    const PLATFORM_FEE = 250n; // 2.5%
    const TICKET_PRICE = ethers.parseEther("0.01");
    const MAX_TICKETS = 100n;
    const DURATION = 7n * 24n * 60n * 60n; // 7 days
    const MINIMUM_TICKETS = 10n;
    const PRIZE_AMOUNT = ethers.parseEther("1");

    beforeEach(async function () {
        [owner, platformWallet, creator1, creator2, user] = await ethers.getSigners();

        const RaffleFactoryContract = await ethers.getContractFactory("RaffleFactory");
        factory = await RaffleFactoryContract.deploy(platformWallet.address, PLATFORM_FEE);
    });

    describe("Deployment", function () {
        it("Should deploy with correct parameters", async function () {
            expect(await factory.platformWallet()).to.equal(platformWallet.address);
            expect(await factory.platformFee()).to.equal(PLATFORM_FEE);
            expect(await factory.isPaused()).to.be.false;
            expect(await factory.owner()).to.equal(owner.address);
        });

        it("Should set correct duration constants", async function () {
            expect(await factory.MIN_DURATION()).to.equal(3600n); // 1 hour
            expect(await factory.MAX_DURATION()).to.equal(30n * 24n * 60n * 60n); // 30 days
        });

        it("Should initialize with zero raffles", async function () {
            expect(await factory.getTotalRaffles()).to.equal(0);
            const allRaffles = await factory.getAllRaffles();
            expect(allRaffles).to.have.lengthOf(0);
        });

        it("Should revert if platform wallet is zero address", async function () {
            const RaffleFactoryContract = await ethers.getContractFactory("RaffleFactory");
            await expect(
                RaffleFactoryContract.deploy(ethers.ZeroAddress, PLATFORM_FEE)
            ).to.be.revertedWithCustomError(RaffleFactoryContract, "InvalidPlatformWallet");
        });

        it("Should revert if platform fee exceeds 10%", async function () {
            const RaffleFactoryContract = await ethers.getContractFactory("RaffleFactory");
            const invalidFee = 1001n; // 10.01%
            await expect(
                RaffleFactoryContract.deploy(platformWallet.address, invalidFee)
            ).to.be.revertedWithCustomError(RaffleFactoryContract, "InvalidPlatformFee");
        });

        it("Should allow platform fee of exactly 10%", async function () {
            const RaffleFactoryContract = await ethers.getContractFactory("RaffleFactory");
            const maxFee = 1000n; // 10%
            const newFactory = await RaffleFactoryContract.deploy(platformWallet.address, maxFee);
            expect(await newFactory.platformFee()).to.equal(maxFee);
        });
    });

    describe("Raffle Creation", function () {
        it("Should create a raffle with valid parameters", async function () {
            const tx = await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            await expect(tx).to.not.be.reverted;
            expect(await factory.getTotalRaffles()).to.equal(1);
        });



        it("Should track raffle in allRaffles array", async function () {
            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const allRaffles = await factory.getAllRaffles();
            expect(allRaffles).to.have.lengthOf(1);
            expect(allRaffles[0]).to.be.properAddress;
        });

        it("Should track raffle by creator", async function () {
            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const creatorRaffles = await factory.getRafflesByCreator(creator1.address);
            expect(creatorRaffles).to.have.lengthOf(1);
            expect(creatorRaffles[0]).to.be.properAddress;
        });

        it("Should mark raffle as valid", async function () {
            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const allRaffles = await factory.getAllRaffles();
            const raffleAddress = allRaffles[0];
            expect(await factory.isValidRaffle(raffleAddress)).to.be.true;
        });

        it("Should deploy raffle with correct parameters", async function () {
            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const allRaffles = await factory.getAllRaffles();
            const raffleAddress = allRaffles[0];

            const Raffle = await ethers.getContractFactory("Raffle");
            const raffle = Raffle.attach(raffleAddress) as Raffle;

            expect(await raffle.creator()).to.equal(creator1.address);
            expect(await raffle.ticketPrice()).to.equal(TICKET_PRICE);
            expect(await raffle.maxTickets()).to.equal(MAX_TICKETS);
            expect(await raffle.minimumTickets()).to.equal(MINIMUM_TICKETS);
            expect(await raffle.prizeAmount()).to.equal(PRIZE_AMOUNT);
            expect(await raffle.platformWallet()).to.equal(platformWallet.address);
        });

        it("Should handle multiple raffles from same creator", async function () {
            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const creatorRaffles = await factory.getRafflesByCreator(creator1.address);
            expect(creatorRaffles).to.have.lengthOf(2);
            expect(await factory.getTotalRaffles()).to.equal(2);
        });

        it("Should handle raffles from multiple creators", async function () {
            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            await factory.connect(creator2).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            expect(await factory.getTotalRaffles()).to.equal(2);

            const creator1Raffles = await factory.getRafflesByCreator(creator1.address);
            const creator2Raffles = await factory.getRafflesByCreator(creator2.address);

            expect(creator1Raffles).to.have.lengthOf(1);
            expect(creator2Raffles).to.have.lengthOf(1);
            expect(creator1Raffles[0]).to.not.equal(creator2Raffles[0]);
        });

        it("Should revert if ticket price is zero", async function () {
            await expect(
                factory.connect(creator1).createRaffle(
                    0,
                    MAX_TICKETS,
                    DURATION,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(factory, "InvalidTicketPrice");
        });

        it("Should revert if max tickets is zero", async function () {
            await expect(
                factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    0,
                    DURATION,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(factory, "InvalidMaxTickets");
        });

        it("Should revert if max tickets is one", async function () {
            await expect(
                factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    1,
                    DURATION,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(factory, "InvalidMaxTickets");
        });

        it("Should revert if duration is less than 1 hour", async function () {
            const shortDuration = 3599n; // 59 minutes 59 seconds
            await expect(
                factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    shortDuration,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(factory, "InvalidDuration");
        });

        it("Should revert if duration is more than 30 days", async function () {
            const longDuration = 31n * 24n * 60n * 60n; // 31 days
            await expect(
                factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    longDuration,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(factory, "InvalidDuration");
        });

        it("Should allow duration of exactly 1 hour", async function () {
            const minDuration = 3600n; // 1 hour
            await expect(
                factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    minDuration,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                )
            ).to.not.be.reverted;
        });

        it("Should allow duration of exactly 30 days", async function () {
            const maxDuration = 30n * 24n * 60n * 60n; // 30 days
            await expect(
                factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    maxDuration,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                )
            ).to.not.be.reverted;
        });

        it("Should revert if minimum tickets is zero", async function () {
            await expect(
                factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    0,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(factory, "InvalidMinimumTickets");
        });

        it("Should revert if minimum tickets exceeds max tickets", async function () {
            await expect(
                factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MAX_TICKETS + 1n,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(factory, "InvalidMinimumTickets");
        });

        it("Should revert if no prize amount is sent", async function () {
            await expect(
                factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MINIMUM_TICKETS,
                    { value: 0 }
                )
            ).to.be.revertedWithCustomError(factory, "InvalidPrizeAmount");
        });

        it("Should revert if factory is paused", async function () {
            await factory.connect(owner).pauseFactory();

            await expect(
                factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(factory, "FactoryIsPaused");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            // Create some raffles for testing
            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            await factory.connect(creator2).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );
        });

        describe("getTotalRaffles", function () {
            it("Should return correct total raffle count", async function () {
                expect(await factory.getTotalRaffles()).to.equal(3);
            });

            it("Should increment when new raffle is created", async function () {
                await factory.connect(creator2).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                );

                expect(await factory.getTotalRaffles()).to.equal(4);
            });
        });

        describe("getRafflesByCreator", function () {
            it("Should return raffles for creator1", async function () {
                const raffles = await factory.getRafflesByCreator(creator1.address);
                expect(raffles).to.have.lengthOf(2);
            });

            it("Should return raffles for creator2", async function () {
                const raffles = await factory.getRafflesByCreator(creator2.address);
                expect(raffles).to.have.lengthOf(1);
            });

            it("Should return empty array for address with no raffles", async function () {
                const raffles = await factory.getRafflesByCreator(user.address);
                expect(raffles).to.have.lengthOf(0);
            });
        });

        describe("getAllRaffles", function () {
            it("Should return all raffle addresses", async function () {
                const raffles = await factory.getAllRaffles();
                expect(raffles).to.have.lengthOf(3);
            });

            it("Should return raffles in creation order", async function () {
                const creator1Raffles = await factory.getRafflesByCreator(creator1.address);
                const allRaffles = await factory.getAllRaffles();

                expect(allRaffles[0]).to.equal(creator1Raffles[0]);
                expect(allRaffles[1]).to.equal(creator1Raffles[1]);
            });
        });

        describe("getRafflesPaginated", function () {
            it("Should return first page of raffles", async function () {
                const raffles = await factory.getRafflesPaginated(0, 2);
                expect(raffles).to.have.lengthOf(2);
            });

            it("Should return second page of raffles", async function () {
                const raffles = await factory.getRafflesPaginated(2, 2);
                expect(raffles).to.have.lengthOf(1);
            });

            it("Should return empty array if offset exceeds total", async function () {
                const raffles = await factory.getRafflesPaginated(10, 5);
                expect(raffles).to.have.lengthOf(0);
            });

            it("Should handle limit exceeding remaining raffles", async function () {
                const raffles = await factory.getRafflesPaginated(1, 10);
                expect(raffles).to.have.lengthOf(2);
            });

            it("Should return correct raffles for pagination", async function () {
                const allRaffles = await factory.getAllRaffles();
                const page1 = await factory.getRafflesPaginated(0, 2);
                const page2 = await factory.getRafflesPaginated(2, 2);

                expect(page1[0]).to.equal(allRaffles[0]);
                expect(page1[1]).to.equal(allRaffles[1]);
                expect(page2[0]).to.equal(allRaffles[2]);
            });

            it("Should handle zero limit", async function () {
                const raffles = await factory.getRafflesPaginated(0, 0);
                expect(raffles).to.have.lengthOf(0);
            });
        });

        describe("isValidRaffle", function () {
            it("Should return true for valid raffle addresses", async function () {
                const allRaffles = await factory.getAllRaffles();
                for (const raffleAddress of allRaffles) {
                    expect(await factory.isValidRaffle(raffleAddress)).to.be.true;
                }
            });

            it("Should return false for invalid addresses", async function () {
                expect(await factory.isValidRaffle(user.address)).to.be.false;
                expect(await factory.isValidRaffle(ethers.ZeroAddress)).to.be.false;
            });
        });
    });

    describe("Admin Functions", function () {
        describe("updatePlatformFee", function () {
            it("Should allow owner to update platform fee", async function () {
                const newFee = 300n; // 3%
                await expect(factory.connect(owner).updatePlatformFee(newFee))
                    .to.not.be.reverted;

                expect(await factory.platformFee()).to.equal(newFee);
            });

            it("Should emit PlatformFeeUpdated event", async function () {
                const newFee = 300n;
                await expect(factory.connect(owner).updatePlatformFee(newFee))
                    .to.emit(factory, "PlatformFeeUpdated")
                    .withArgs(PLATFORM_FEE, newFee);
            });

            it("Should revert if fee exceeds 10%", async function () {
                const invalidFee = 1001n;
                await expect(
                    factory.connect(owner).updatePlatformFee(invalidFee)
                ).to.be.revertedWithCustomError(factory, "InvalidPlatformFee");
            });

            it("Should allow setting fee to 0%", async function () {
                await expect(factory.connect(owner).updatePlatformFee(0))
                    .to.not.be.reverted;

                expect(await factory.platformFee()).to.equal(0);
            });

            it("Should allow setting fee to exactly 10%", async function () {
                const maxFee = 1000n;
                await expect(factory.connect(owner).updatePlatformFee(maxFee))
                    .to.not.be.reverted;

                expect(await factory.platformFee()).to.equal(maxFee);
            });

            it("Should revert if called by non-owner", async function () {
                await expect(
                    factory.connect(user).updatePlatformFee(300n)
                ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
            });
        });

        describe("updatePlatformWallet", function () {
            it("Should allow owner to update platform wallet", async function () {
                const newWallet = user.address;
                await expect(factory.connect(owner).updatePlatformWallet(newWallet))
                    .to.not.be.reverted;

                expect(await factory.platformWallet()).to.equal(newWallet);
            });

            it("Should emit PlatformWalletUpdated event", async function () {
                const newWallet = user.address;
                await expect(factory.connect(owner).updatePlatformWallet(newWallet))
                    .to.emit(factory, "PlatformWalletUpdated")
                    .withArgs(platformWallet.address, newWallet);
            });

            it("Should revert if new wallet is zero address", async function () {
                await expect(
                    factory.connect(owner).updatePlatformWallet(ethers.ZeroAddress)
                ).to.be.revertedWithCustomError(factory, "InvalidPlatformWallet");
            });

            it("Should revert if called by non-owner", async function () {
                await expect(
                    factory.connect(user).updatePlatformWallet(user.address)
                ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
            });

            it("Should affect new raffles created after update", async function () {
                const newWallet = user.address;
                await factory.connect(owner).updatePlatformWallet(newWallet);

                await factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                );

                const allRaffles = await factory.getAllRaffles();
                const raffleAddress = allRaffles[0];

                const Raffle = await ethers.getContractFactory("Raffle");
                const raffle = Raffle.attach(raffleAddress) as Raffle;

                expect(await raffle.platformWallet()).to.equal(newWallet);
            });
        });

        describe("pauseFactory", function () {
            it("Should allow owner to pause factory", async function () {
                await expect(factory.connect(owner).pauseFactory())
                    .to.not.be.reverted;

                expect(await factory.isPaused()).to.be.true;
            });

            it("Should emit FactoryPaused event", async function () {
                await expect(factory.connect(owner).pauseFactory())
                    .to.emit(factory, "FactoryPaused");
            });

            it("Should prevent raffle creation when paused", async function () {
                await factory.connect(owner).pauseFactory();

                await expect(
                    factory.connect(creator1).createRaffle(
                        TICKET_PRICE,
                        MAX_TICKETS,
                        DURATION,
                        MINIMUM_TICKETS,
                        { value: PRIZE_AMOUNT }
                    )
                ).to.be.revertedWithCustomError(factory, "FactoryIsPaused");
            });

            it("Should revert if called by non-owner", async function () {
                await expect(
                    factory.connect(user).pauseFactory()
                ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
            });
        });

        describe("unpauseFactory", function () {
            beforeEach(async function () {
                await factory.connect(owner).pauseFactory();
            });

            it("Should allow owner to unpause factory", async function () {
                await expect(factory.connect(owner).unpauseFactory())
                    .to.not.be.reverted;

                expect(await factory.isPaused()).to.be.false;
            });

            it("Should emit FactoryUnpaused event", async function () {
                await expect(factory.connect(owner).unpauseFactory())
                    .to.emit(factory, "FactoryUnpaused");
            });

            it("Should allow raffle creation after unpause", async function () {
                await factory.connect(owner).unpauseFactory();

                await expect(
                    factory.connect(creator1).createRaffle(
                        TICKET_PRICE,
                        MAX_TICKETS,
                        DURATION,
                        MINIMUM_TICKETS,
                        { value: PRIZE_AMOUNT }
                    )
                ).to.not.be.reverted;
            });

            it("Should revert if called by non-owner", async function () {
                await expect(
                    factory.connect(user).unpauseFactory()
                ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
            });
        });
    });

    describe("Edge Cases", function () {
        it("Should handle creating many raffles", async function () {
            const count = 10;
            for (let i = 0; i < count; i++) {
                await factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MINIMUM_TICKETS,
                    { value: PRIZE_AMOUNT }
                );
            }

            expect(await factory.getTotalRaffles()).to.equal(count);
            const creatorRaffles = await factory.getRafflesByCreator(creator1.address);
            expect(creatorRaffles).to.have.lengthOf(count);
        });

        it("Should handle different prize amounts", async function () {
            const smallPrize = ethers.parseEther("0.1");
            const largePrize = ethers.parseEther("100");

            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: smallPrize }
            );

            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: largePrize }
            );

            expect(await factory.getTotalRaffles()).to.equal(2);
        });

        it("Should handle different ticket prices", async function () {
            const cheapTicket = ethers.parseEther("0.001");
            const expensiveTicket = ethers.parseEther("1");

            await factory.connect(creator1).createRaffle(
                cheapTicket,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            await factory.connect(creator1).createRaffle(
                expensiveTicket,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            expect(await factory.getTotalRaffles()).to.equal(2);
        });

        it("Should handle minimum tickets equal to max tickets", async function () {
            await expect(
                factory.connect(creator1).createRaffle(
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MAX_TICKETS,
                    { value: PRIZE_AMOUNT }
                )
            ).to.not.be.reverted;
        });

        it("Should maintain separate raffle lists per creator", async function () {
            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            await factory.connect(creator2).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const creator1Raffles = await factory.getRafflesByCreator(creator1.address);
            const creator2Raffles = await factory.getRafflesByCreator(creator2.address);

            expect(creator1Raffles).to.have.lengthOf(1);
            expect(creator2Raffles).to.have.lengthOf(1);
            expect(creator1Raffles[0]).to.not.equal(creator2Raffles[0]);
        });
    });

    describe("Integration", function () {
        it("Should create raffle that can accept ticket purchases", async function () {
            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            const allRaffles = await factory.getAllRaffles();
            const raffleAddress = allRaffles[0];

            const Raffle = await ethers.getContractFactory("Raffle");
            const raffle = Raffle.attach(raffleAddress) as Raffle;

            // Buy tickets
            const ticketAmount = 5n;
            const payment = TICKET_PRICE * ticketAmount;

            await expect(
                raffle.connect(user).buyTickets(ticketAmount, { value: payment })
            ).to.not.be.reverted;

            expect(await raffle.totalTicketsSold()).to.equal(ticketAmount);
            expect(await raffle.getTicketCount(user.address)).to.equal(ticketAmount);
        });

        it("Should create multiple independent raffles", async function () {
            await factory.connect(creator1).createRaffle(
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                { value: PRIZE_AMOUNT }
            );

            await factory.connect(creator1).createRaffle(
                ethers.parseEther("0.02"),
                50n,
                DURATION,
                5n,
                { value: ethers.parseEther("2") }
            );

            const allRaffles = await factory.getAllRaffles();
            const Raffle = await ethers.getContractFactory("Raffle");

            const raffle1 = Raffle.attach(allRaffles[0]) as Raffle;
            const raffle2 = Raffle.attach(allRaffles[1]) as Raffle;

            expect(await raffle1.ticketPrice()).to.equal(TICKET_PRICE);
            expect(await raffle2.ticketPrice()).to.equal(ethers.parseEther("0.02"));

            expect(await raffle1.maxTickets()).to.equal(MAX_TICKETS);
            expect(await raffle2.maxTickets()).to.equal(50n);
        });
    });
});
