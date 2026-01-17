import { expect } from "chai";
import { ethers } from "hardhat";
import { Raffle } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Raffle Contract", function () {
    let raffle: Raffle;
    let creator: SignerWithAddress;
    let platformWallet: SignerWithAddress;
    let buyer1: SignerWithAddress;
    let buyer2: SignerWithAddress;
    let buyer3: SignerWithAddress;

    const TICKET_PRICE = ethers.parseEther("0.01");
    const MAX_TICKETS = 100n;
    const DURATION = 7n * 24n * 60n * 60n; // 7 days in seconds
    const MINIMUM_TICKETS = 10n;
    const PRIZE_AMOUNT = ethers.parseEther("1");

    beforeEach(async function () {
        [creator, platformWallet, buyer1, buyer2, buyer3] = await ethers.getSigners();

        const RaffleFactory = await ethers.getContractFactory("Raffle");
        raffle = await RaffleFactory.connect(creator).deploy(
            creator.address,
            TICKET_PRICE,
            MAX_TICKETS,
            DURATION,
            MINIMUM_TICKETS,
            platformWallet.address,
            { value: PRIZE_AMOUNT }
        );
    });

    describe("Deployment", function () {
        it("Should deploy with correct parameters", async function () {
            expect(await raffle.creator()).to.equal(creator.address);
            expect(await raffle.ticketPrice()).to.equal(TICKET_PRICE);
            expect(await raffle.maxTickets()).to.equal(MAX_TICKETS);
            expect(await raffle.minimumTickets()).to.equal(MINIMUM_TICKETS);
            expect(await raffle.prizeAmount()).to.equal(PRIZE_AMOUNT);
            expect(await raffle.platformWallet()).to.equal(platformWallet.address);
            expect(await raffle.state()).to.equal(0); // RaffleState.Active
        });

        it("Should set correct end time", async function () {
            const currentTime = await time.latest();
            const endTime = await raffle.endTime();
            expect(endTime).to.be.closeTo(BigInt(currentTime) + DURATION, 5n);
        });

        it("Should initialize with zero tickets sold", async function () {
            expect(await raffle.totalTicketsSold()).to.equal(0);
            expect(await raffle.getTotalParticipants()).to.equal(0);
        });



        it("Should revert if ticket price is zero", async function () {
            const RaffleFactory = await ethers.getContractFactory("Raffle");
            await expect(
                RaffleFactory.connect(creator).deploy(
                    creator.address,
                    0,
                    MAX_TICKETS,
                    DURATION,
                    MINIMUM_TICKETS,
                    platformWallet.address,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(RaffleFactory, "InvalidTicketPrice");
        });

        it("Should revert if max tickets is less than or equal to 1", async function () {
            const RaffleFactory = await ethers.getContractFactory("Raffle");
            await expect(
                RaffleFactory.connect(creator).deploy(
                    creator.address,
                    TICKET_PRICE,
                    1,
                    DURATION,
                    MINIMUM_TICKETS,
                    platformWallet.address,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(RaffleFactory, "InvalidMaxTickets");
        });

        it("Should revert if duration is less than 1 hour", async function () {
            const RaffleFactory = await ethers.getContractFactory("Raffle");
            const shortDuration = 30n * 60n; // 30 minutes
            await expect(
                RaffleFactory.connect(creator).deploy(
                    creator.address,
                    TICKET_PRICE,
                    MAX_TICKETS,
                    shortDuration,
                    MINIMUM_TICKETS,
                    platformWallet.address,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(RaffleFactory, "InvalidDuration");
        });

        it("Should revert if duration is more than 30 days", async function () {
            const RaffleFactory = await ethers.getContractFactory("Raffle");
            const longDuration = 31n * 24n * 60n * 60n; // 31 days
            await expect(
                RaffleFactory.connect(creator).deploy(
                    creator.address,
                    TICKET_PRICE,
                    MAX_TICKETS,
                    longDuration,
                    MINIMUM_TICKETS,
                    platformWallet.address,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(RaffleFactory, "InvalidDuration");
        });

        it("Should revert if minimum tickets is zero", async function () {
            const RaffleFactory = await ethers.getContractFactory("Raffle");
            await expect(
                RaffleFactory.connect(creator).deploy(
                    creator.address,
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    0,
                    platformWallet.address,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(RaffleFactory, "InvalidMinimumTickets");
        });

        it("Should revert if minimum tickets exceeds max tickets", async function () {
            const RaffleFactory = await ethers.getContractFactory("Raffle");
            await expect(
                RaffleFactory.connect(creator).deploy(
                    creator.address,
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MAX_TICKETS + 1n,
                    platformWallet.address,
                    { value: PRIZE_AMOUNT }
                )
            ).to.be.revertedWithCustomError(RaffleFactory, "InvalidMinimumTickets");
        });

        it("Should revert if no prize amount is sent", async function () {
            const RaffleFactory = await ethers.getContractFactory("Raffle");
            await expect(
                RaffleFactory.connect(creator).deploy(
                    creator.address,
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MINIMUM_TICKETS,
                    platformWallet.address,
                    { value: 0 }
                )
            ).to.be.revertedWithCustomError(RaffleFactory, "InvalidPayment");
        });
    });

    describe("Ticket Purchase", function () {
        it("Should allow buying tickets with correct payment", async function () {
            const ticketAmount = 5n;
            const payment = TICKET_PRICE * ticketAmount;

            await expect(
                raffle.connect(buyer1).buyTickets(ticketAmount, { value: payment })
            ).to.not.be.reverted;

            expect(await raffle.totalTicketsSold()).to.equal(ticketAmount);
            expect(await raffle.getTicketCount(buyer1.address)).to.equal(ticketAmount);
        });

        it("Should emit TicketPurchased event", async function () {
            const ticketAmount = 3n;
            const payment = TICKET_PRICE * ticketAmount;

            await expect(
                raffle.connect(buyer1).buyTickets(ticketAmount, { value: payment })
            )
                .to.emit(raffle, "TicketPurchased")
                .withArgs(buyer1.address, ticketAmount, ticketAmount);
        });

        it("Should add buyer to participants on first purchase", async function () {
            const ticketAmount = 2n;
            const payment = TICKET_PRICE * ticketAmount;

            expect(await raffle.getTotalParticipants()).to.equal(0);

            await raffle.connect(buyer1).buyTickets(ticketAmount, { value: payment });

            expect(await raffle.getTotalParticipants()).to.equal(1);
            const participants = await raffle.getParticipants();
            expect(participants[0]).to.equal(buyer1.address);
        });

        it("Should not add buyer to participants on subsequent purchases", async function () {
            const ticketAmount = 2n;
            const payment = TICKET_PRICE * ticketAmount;

            await raffle.connect(buyer1).buyTickets(ticketAmount, { value: payment });
            expect(await raffle.getTotalParticipants()).to.equal(1);

            await raffle.connect(buyer1).buyTickets(ticketAmount, { value: payment });
            expect(await raffle.getTotalParticipants()).to.equal(1);
            expect(await raffle.getTicketCount(buyer1.address)).to.equal(ticketAmount * 2n);
        });

        it("Should handle multiple buyers correctly", async function () {
            const ticketAmount = 3n;
            const payment = TICKET_PRICE * ticketAmount;

            await raffle.connect(buyer1).buyTickets(ticketAmount, { value: payment });
            await raffle.connect(buyer2).buyTickets(ticketAmount, { value: payment });
            await raffle.connect(buyer3).buyTickets(ticketAmount, { value: payment });

            expect(await raffle.getTotalParticipants()).to.equal(3);
            expect(await raffle.totalTicketsSold()).to.equal(ticketAmount * 3n);

            const participants = await raffle.getParticipants();
            expect(participants).to.have.lengthOf(3);
            expect(participants).to.include(buyer1.address);
            expect(participants).to.include(buyer2.address);
            expect(participants).to.include(buyer3.address);
        });

        it("Should revert if ticket amount is zero", async function () {
            await expect(
                raffle.connect(buyer1).buyTickets(0, { value: 0 })
            ).to.be.revertedWithCustomError(raffle, "InvalidTicketAmount");
        });

        it("Should revert if payment is insufficient", async function () {
            const ticketAmount = 5n;
            const insufficientPayment = TICKET_PRICE * (ticketAmount - 1n);

            await expect(
                raffle.connect(buyer1).buyTickets(ticketAmount, { value: insufficientPayment })
            ).to.be.revertedWithCustomError(raffle, "InvalidPayment");
        });

        it("Should revert if payment is excessive", async function () {
            const ticketAmount = 5n;
            const excessivePayment = TICKET_PRICE * (ticketAmount + 1n);

            await expect(
                raffle.connect(buyer1).buyTickets(ticketAmount, { value: excessivePayment })
            ).to.be.revertedWithCustomError(raffle, "InvalidPayment");
        });

        it("Should revert if purchase exceeds max tickets", async function () {
            const ticketAmount = MAX_TICKETS + 1n;
            const payment = TICKET_PRICE * ticketAmount;

            await expect(
                raffle.connect(buyer1).buyTickets(ticketAmount, { value: payment })
            ).to.be.revertedWithCustomError(raffle, "ExceedsMaxTickets");
        });

        it("Should revert if cumulative purchases exceed max tickets", async function () {
            const firstPurchase = 60n;
            const secondPurchase = 50n;

            await raffle.connect(buyer1).buyTickets(firstPurchase, {
                value: TICKET_PRICE * firstPurchase
            });

            await expect(
                raffle.connect(buyer2).buyTickets(secondPurchase, {
                    value: TICKET_PRICE * secondPurchase
                })
            ).to.be.revertedWithCustomError(raffle, "ExceedsMaxTickets");
        });

        it("Should allow buying exactly max tickets", async function () {
            const payment = TICKET_PRICE * MAX_TICKETS;

            await expect(
                raffle.connect(buyer1).buyTickets(MAX_TICKETS, { value: payment })
            ).to.not.be.reverted;

            expect(await raffle.totalTicketsSold()).to.equal(MAX_TICKETS);
        });

        it("Should revert if raffle has ended", async function () {
            await time.increase(DURATION + 1n);

            const ticketAmount = 5n;
            const payment = TICKET_PRICE * ticketAmount;

            await expect(
                raffle.connect(buyer1).buyTickets(ticketAmount, { value: payment })
            ).to.be.revertedWithCustomError(raffle, "RaffleEnded");
        });


    });

    describe("View Functions", function () {
        beforeEach(async function () {
            // Setup: Buy some tickets
            await raffle.connect(buyer1).buyTickets(5n, { value: TICKET_PRICE * 5n });
            await raffle.connect(buyer2).buyTickets(3n, { value: TICKET_PRICE * 3n });
        });

        describe("getRaffleInfo", function () {
            it("Should return correct raffle information", async function () {
                const info = await raffle.getRaffleInfo();

                expect(info._creator).to.equal(creator.address);
                expect(info._ticketPrice).to.equal(TICKET_PRICE);
                expect(info._maxTickets).to.equal(MAX_TICKETS);
                expect(info._prizeAmount).to.equal(PRIZE_AMOUNT);
                expect(info._minimumTickets).to.equal(MINIMUM_TICKETS);
                expect(info._totalTicketsSold).to.equal(8n);
                expect(info._state).to.equal(0); // RaffleState.Active
                expect(info._winner).to.equal(ethers.ZeroAddress);
            });
        });

        describe("getParticipants", function () {
            it("Should return all participants", async function () {
                const participants = await raffle.getParticipants();

                expect(participants).to.have.lengthOf(2);
                expect(participants[0]).to.equal(buyer1.address);
                expect(participants[1]).to.equal(buyer2.address);
            });

            it("Should return empty array when no participants", async function () {
                const RaffleFactory = await ethers.getContractFactory("Raffle");
                const newRaffle = await RaffleFactory.connect(creator).deploy(
                    creator.address,
                    TICKET_PRICE,
                    MAX_TICKETS,
                    DURATION,
                    MINIMUM_TICKETS,
                    platformWallet.address,
                    { value: PRIZE_AMOUNT }
                );

                const participants = await newRaffle.getParticipants();
                expect(participants).to.have.lengthOf(0);
            });
        });

        describe("getTicketCount", function () {
            it("Should return correct ticket count for buyers", async function () {
                expect(await raffle.getTicketCount(buyer1.address)).to.equal(5n);
                expect(await raffle.getTicketCount(buyer2.address)).to.equal(3n);
            });

            it("Should return zero for non-participants", async function () {
                expect(await raffle.getTicketCount(buyer3.address)).to.equal(0);
            });
        });

        describe("isActive", function () {
            it("Should return true when raffle is active and not ended", async function () {
                expect(await raffle.isActive()).to.be.true;
            });

            it("Should return false when raffle has ended", async function () {
                await time.increase(DURATION + 1n);
                expect(await raffle.isActive()).to.be.false;
            });
        });

        describe("getTimeRemaining", function () {
            it("Should return correct time remaining", async function () {
                const timeRemaining = await raffle.getTimeRemaining();
                expect(timeRemaining).to.be.closeTo(DURATION, 5n);
            });

            it("Should return zero when raffle has ended", async function () {
                await time.increase(DURATION + 1n);
                expect(await raffle.getTimeRemaining()).to.equal(0);
            });

            it("Should decrease over time", async function () {
                const initialTime = await raffle.getTimeRemaining();

                await time.increase(3600n); // 1 hour

                const laterTime = await raffle.getTimeRemaining();
                expect(laterTime).to.be.lt(initialTime);
                expect(initialTime - laterTime).to.be.closeTo(3600n, 5n);
            });
        });

        describe("getTotalParticipants", function () {
            it("Should return correct number of participants", async function () {
                expect(await raffle.getTotalParticipants()).to.equal(2);
            });

            it("Should not increase on repeat purchases", async function () {
                await raffle.connect(buyer1).buyTickets(2n, { value: TICKET_PRICE * 2n });
                expect(await raffle.getTotalParticipants()).to.equal(2);
            });

            it("Should increase when new buyer joins", async function () {
                await raffle.connect(buyer3).buyTickets(1n, { value: TICKET_PRICE });
                expect(await raffle.getTotalParticipants()).to.equal(3);
            });
        });
    });



    describe("Edge Cases", function () {
        it("Should handle buying 1 ticket", async function () {
            await expect(
                raffle.connect(buyer1).buyTickets(1n, { value: TICKET_PRICE })
            ).to.not.be.reverted;

            expect(await raffle.getTicketCount(buyer1.address)).to.equal(1n);
        });

        it("Should handle large ticket purchases", async function () {
            const largeAmount = 50n;
            const payment = TICKET_PRICE * largeAmount;

            await expect(
                raffle.connect(buyer1).buyTickets(largeAmount, { value: payment })
            ).to.not.be.reverted;

            expect(await raffle.getTicketCount(buyer1.address)).to.equal(largeAmount);
        });

        it("Should handle multiple small purchases from same buyer", async function () {
            for (let i = 0; i < 5; i++) {
                await raffle.connect(buyer1).buyTickets(1n, { value: TICKET_PRICE });
            }

            expect(await raffle.getTicketCount(buyer1.address)).to.equal(5n);
            expect(await raffle.getTotalParticipants()).to.equal(1);
        });

        it("Should correctly track tickets when approaching max", async function () {
            const firstPurchase = MAX_TICKETS - 5n;
            await raffle.connect(buyer1).buyTickets(firstPurchase, {
                value: TICKET_PRICE * firstPurchase
            });

            const secondPurchase = 5n;
            await raffle.connect(buyer2).buyTickets(secondPurchase, {
                value: TICKET_PRICE * secondPurchase
            });

            expect(await raffle.totalTicketsSold()).to.equal(MAX_TICKETS);

            await expect(
                raffle.connect(buyer3).buyTickets(1n, { value: TICKET_PRICE })
            ).to.be.revertedWithCustomError(raffle, "ExceedsMaxTickets");
        });

        it("Should maintain correct state with zero participants", async function () {
            const RaffleFactory = await ethers.getContractFactory("Raffle");
            const newRaffle = await RaffleFactory.connect(creator).deploy(
                creator.address,
                TICKET_PRICE,
                MAX_TICKETS,
                DURATION,
                MINIMUM_TICKETS,
                platformWallet.address,
                { value: PRIZE_AMOUNT }
            );

            expect(await newRaffle.getTotalParticipants()).to.equal(0);
            expect(await newRaffle.totalTicketsSold()).to.equal(0);
            expect(await newRaffle.isActive()).to.be.true;
        });
    });

    describe("Gas Optimization Tests", function () {
        it("Should not add duplicate participants", async function () {
            // First purchase - should add to participants
            await raffle.connect(buyer1).buyTickets(1n, { value: TICKET_PRICE });
            const participantsAfterFirst = await raffle.getParticipants();

            // Second purchase - should NOT add to participants
            await raffle.connect(buyer1).buyTickets(1n, { value: TICKET_PRICE });
            const participantsAfterSecond = await raffle.getParticipants();

            expect(participantsAfterFirst.length).to.equal(participantsAfterSecond.length);
            expect(participantsAfterSecond.length).to.equal(1);
        });
    });
});
