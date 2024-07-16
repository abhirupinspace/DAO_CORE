const hre = require("hardhat");

async function main() {
    const GovernanceToken = await hre.ethers.getContractFactory("ERC20");
    const governanceToken = await GovernanceToken.deploy("Governance Token", "GT");
    await governanceToken.deployed();
    console.log("Governance Token deployed to:", governanceToken.address);
    const votingPeriod = 604800;
    const quorumPercentage = 4;
    const AdvancedDAO = await hre.ethers.getContractFactory("AdvancedDAO");
    const advancedDAO = await AdvancedDAO.deploy(governanceToken.address, votingPeriod, quorumPercentage);
    await advancedDAO.deployed();

    console.log("AdvancedDAO deployed to:", advancedDAO.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
