import { expect } from "chai";
import { ethers } from "hardhat";


describe("AdvancedDAO", function () {
    let governanceToken: any;
    let advancedDAO: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const GovernanceToken = await ethers.getContractFactory("ERC20");
        governanceToken = await GovernanceToken.deploy("Governance Token", "GT");
        await governanceToken.deployed();

        // Deploy the AdvancedDAO contract
        const votingPeriod = 604800; // 1 week in seconds
        const quorumPercentage = 4; // 4%
        const AdvancedDAO = await ethers.getContractFactory("AdvancedDAO");
        advancedDAO = await AdvancedDAO.deploy(governanceToken.address, votingPeriod, quorumPercentage);
        await advancedDAO.deployed();

        // Distribute governance tokens to addr1 and addr2
        await governanceToken.transfer(addr1.address, ethers.utils.parseEther("1000"));
        await governanceToken.transfer(addr2.address, ethers.utils.parseEther("1000"));
    });

    it("Should create a proposal and vote", async function () {
        await governanceToken.connect(addr1).approve(advancedDAO.address, ethers.utils.parseEther("1000"));
        await advancedDAO.connect(addr1).createProposal("Proposal 1");

        const proposal = await advancedDAO.proposals(1);
        expect(proposal.description).to.equal("Proposal 1");

        await advancedDAO.connect(addr1).vote(1, true);

        const updatedProposal = await advancedDAO.proposals(1);
        expect(updatedProposal.voteCount).to.equal(ethers.utils.parseEther("1000"));
    });

    it("Should execute a proposal", async function () {
        await governanceToken.connect(addr1).approve(advancedDAO.address, ethers.utils.parseEther("1000"));
        await advancedDAO.connect(addr1).createProposal("Proposal 1");

        const proposal = await advancedDAO.proposals(1);
        expect(proposal.description).to.equal("Proposal 1");

        // Fast forward time to after the voting period
        await ethers.provider.send("evm_increaseTime", [604800]);
        await ethers.provider.send("evm_mine");

        await advancedDAO.connect(addr1).vote(1, true);

        const updatedProposal = await advancedDAO.proposals(1);
        expect(updatedProposal.voteCount).to.equal(ethers.utils.parseEther("1000"));

        await advancedDAO.executeProposal(1);
        const executedProposal = await advancedDAO.proposals(1);
        expect(executedProposal.executed).to.equal(true);
    });

    it("Should update voting period", async function () {
        await advancedDAO.updateVotingPeriod(1209600); // 2 weeks in seconds
        const newVotingPeriod = await advancedDAO.votingPeriod();
        expect(newVotingPeriod).to.equal(1209600);
    });

    it("Should update quorum percentage", async function () {
        await advancedDAO.updateQuorumPercentage(10); // 10%
        const newQuorumPercentage = await advancedDAO.quorumPercentage();
        expect(newQuorumPercentage).to.equal(10);
    });

    it("Should not allow non-owners to update settings", async function () {
        await expect(advancedDAO.connect(addr1).updateVotingPeriod(1209600)).to.be.revertedWith("Only owner can perform this action");
        await expect(advancedDAO.connect(addr1).updateQuorumPercentage(10)).to.be.revertedWith("Only owner can perform this action");
    });

    it("Should not allow non-token holders to create proposal or vote", async function () {
        await expect(advancedDAO.connect(addr2).createProposal("Proposal 1")).to.be.revertedWith("Only token holders can perform this action");
        await expect(advancedDAO.connect(addr2).vote(1, true)).to.be.revertedWith("Only token holders can perform this action");
    });
});
