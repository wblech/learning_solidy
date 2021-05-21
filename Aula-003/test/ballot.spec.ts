import { ethers } from "hardhat";
import { Contract, ContractFactory, Signer } from "ethers";
import { expect } from "chai";
import { connect } from "http2";

const proposalA = "propostaA";
const proposalB = "propostaB";

describe("Ballot", function () {
    let accounts: Signer[];
    let contract: Contract;
    let chairPerson: String;

    beforeEach(async function () {
        accounts = await ethers.getSigners();
        chairPerson = await accounts[0].getAddress();

        const BallotContract: ContractFactory = await ethers.getContractFactory(
            "Ballot"
        )
        contract = await BallotContract.deploy(
            [
                ethers.utils.formatBytes32String(proposalA), 
                ethers.utils.formatBytes32String(proposalB)
            ]
        );
        await contract.deployed();
    })

    it("Should create a Ballot with 2 proposals with 0 votes", async function () {
        expect(ethers.utils.parseBytes32String((await contract.proposals(0)).name)).to.equal(proposalA);
        expect((await contract.proposals(0)).voteCount).to.equal(0);
        expect(ethers.utils.parseBytes32String((await contract.proposals(1)).name)).to.equal(proposalB);
        expect((await contract.proposals(1)).voteCount).to.equal(0);
    })

    it("Should give right to vote", async function() {
        let voter = await accounts[1].getAddress();

        await contract.connect(accounts[0]).giveRightToVote(voter);
        expect((await contract.voters(voter)).weight).to.equal(1);
        expect((await contract.voters(voter)).voted).to.equal(false);
    })

    it("Should not give right to vote if not chairman", async function() {
        let voter = await accounts[1].getAddress();

        await expect(contract.connect(accounts[1]).giveRightToVote(voter)).to.be.revertedWith("Only chairperson can give right to vote.")
    })

    it("Should not allow vote twice", async function() {
        let voter = await accounts[1].getAddress();

        await contract.connect(accounts[0]).giveRightToVote(voter);
        await contract.connect(accounts[1]).vote(0);
        await expect(contract.connect(accounts[0]).giveRightToVote(voter)).to.be.revertedWith("The voter already voted.")
    })

    it("It should increase weigth of the delegated person ", async function () {
        let delegator = await accounts[1].getAddress();
        let delegated = await accounts[2].getAddress();

        await contract.connect(accounts[0]).giveRightToVote(delegator);
        await contract.connect(accounts[1]).delegate(delegated);
        expect((await contract.voters(delegated)).weight).to.equal(1);
    })

    it("It should increase voteCount where delegated person voted ", async function () {
        let delegator = await accounts[1].getAddress();
        let delegated = await accounts[2].getAddress();

        await contract.connect(accounts[0]).giveRightToVote(delegator);
        await contract.connect(accounts[0]).giveRightToVote(delegated);
        await contract.connect(accounts[2]).vote(1);
        await contract.connect(accounts[1]).delegate(delegated);
        expect((await contract.proposals(1)).voteCount).to.equal(2);
    })

    it("It should not allow delegate if already voted ", async function () {
        let delegator = await accounts[1].getAddress();
        let delegated = await accounts[2].getAddress();

        await contract.connect(accounts[0]).giveRightToVote(delegator);
        await contract.connect(accounts[1]).vote(0);
        await expect(contract.connect(accounts[1]).delegate(delegated)).to.be.revertedWith("You already voted.");
    })

    it("It should not allow self delegation ", async function () {
        let delegator = await accounts[1].getAddress();

        await contract.connect(accounts[0]).giveRightToVote(delegator);
        await expect(contract.connect(accounts[1]).delegate(delegator)).to.be.revertedWith("Self-delegation is disallowed.");
    })

    it("It should not allow loop in delegation ", async function () {
        let delegator = await accounts[1].getAddress();
        let delegated = await accounts[2].getAddress();

        await contract.connect(accounts[0]).giveRightToVote(delegator);
        await contract.connect(accounts[1]).delegate(delegated);
        await expect(contract.connect(accounts[2]).delegate(delegator)).to.be.revertedWith( "Found loop in delegation.");
    })

    it("It should not allow loop in delegation ", async function () {
        await expect(contract.connect(accounts[1]).vote(1)).to.be.revertedWith("Has no right to vote");
    })

    it("It should not allow vote twice ", async function () {
        let voter = accounts[1].getAddress();

        await contract.connect(accounts[0]).giveRightToVote(voter);
        await contract.connect(accounts[1]).vote(1);
        await expect(contract.connect(accounts[1]).vote(1)).to.be.revertedWith("Already voted.");
    })

    it("It should increase proposal vote", async function () {
        let voter = accounts[1].getAddress();

        await contract.connect(accounts[0]).giveRightToVote(voter);
        await contract.connect(accounts[1]).vote(1);
        expect((await contract.proposals(1)).voteCount).to.equal(1);
    })

    it("It should return the winning proposal number", async function () {
        let voter = accounts[1].getAddress();

        await contract.connect(accounts[0]).giveRightToVote(voter);
        await contract.connect(accounts[1]).vote(1);

        expect(await contract.winningProposal()).to.equal(1);
    })

    it("It should return the winning name", async function () {
        let voter = accounts[1].getAddress();

        await contract.connect(accounts[0]).giveRightToVote(voter);
        await contract.connect(accounts[1]).vote(1);

        expect(ethers.utils.parseBytes32String(await contract.winnerName())).to.equal(proposalB);
    })



})