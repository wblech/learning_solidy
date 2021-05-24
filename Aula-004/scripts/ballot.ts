import { ethers } from "hardhat";

async function main() {
    const [BallotContractFactory, ERC20FactoryContractFactory] = await Promise.all([
        ethers.getContractFactory("Ballot"),
        ethers.getContractFactory("ERC20Factory"),
    ])
    
    const [BallotContract, FactoryContract] = await Promise.all([
        BallotContractFactory.deploy(),
        ERC20FactoryContractFactory.deploy()
    ])

    await Promise.all([
        BallotContract.deployed(),
        FactoryContract.deployed()
    ])

    console.log(BallotContract.deployTransaction);
    console.log(FactoryContract.deployTransaction);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });