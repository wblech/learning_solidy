import { ethers } from "hardhat";
import { Contract, ContractFactory, Signer } from "ethers";
import { expect } from "chai";

const TOKEN_SYMBOL = "AAA";
const TOKEN_NAME = "Lorem Ipsum";

describe("Token", function () {
  let accounts: Signer[];
  let contract: Contract;
  let ownerAddress: String;

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    ownerAddress = await accounts[0].getAddress();
    const TokenContract: ContractFactory = await ethers.getContractFactory(
      "MeuToken"
    );
    contract = await TokenContract.deploy(TOKEN_SYMBOL, TOKEN_NAME);
    await contract.deployed();
  });

  it("Should deploy and set Symbol and Name correctly", async function () {
    expect(await contract.symbol()).to.equal(TOKEN_SYMBOL);
    expect(await contract.name()).to.equal(TOKEN_NAME);
  });

  it("Should have zero balance for the owner when deployed", async function () {
    expect(await contract.balanceOf(ownerAddress)).to.equal(0);
  });

  it("Should deploy with zero TotalSupply", async function () {
    expect(await contract.totalSupply()).to.equal(0);
  });

  it("Should not allow anyone to mint tokens", async function () {
    await expect(contract.connect(accounts[1]).mint(ownerAddress, ethers.utils.parseEther("1"))).to.be.revertedWith("MeuToken: Mensagem de erro");
  });

  it("Should update balance when tokens are minted", async function () {
    await contract.mint(ownerAddress, ethers.utils.parseEther("1"));
    expect(await contract.balanceOf(ownerAddress)).to.equal(ethers.utils.parseEther("1"));
    await contract.mint(ownerAddress, ethers.utils.parseEther("1"));
    expect(await contract.balanceOf(ownerAddress)).to.equal(ethers.utils.parseEther("2"));
  });

  it("Should update TotalSupply when tokens are minted", async function () {
    await contract.mint(ownerAddress, ethers.utils.parseEther("1"));
    expect(await contract.totalSupply()).to.equal(ethers.utils.parseEther("1"));
  });

  it("Should not mint to address zero", async function () {
    await expect(contract.mint(ethers.constants.AddressZero, ethers.utils.parseEther("1"))).to.be.revertedWith("MeuToken: Can not mint to address zero");
  });

  it("Should not allow transfering to address zero", async function () {
    await contract.mint(ownerAddress, ethers.utils.parseEther("1"));
    await expect(contract.connect(accounts[0]).transfer(ethers.constants.AddressZero, ethers.utils.parseEther("1"))).to.be.revertedWith("MeuToken: Can not transfer to address zero");
  });

  it("Should transfer between different addresses", async function () {
    let sender = await accounts[1].getAddress();
    let receiver = await accounts[2].getAddress();

    await contract.mint(sender, ethers.utils.parseEther("1"));
    await contract.connect(accounts[1]).approve(receiver, ethers.utils.parseEther("1"))
    await contract.connect(accounts[1]).transfer(receiver, ethers.utils.parseEther("1"));

    expect(await contract.balanceOf(sender)).to.equal(0);
    expect(await contract.balanceOf(receiver)).to.equal(ethers.utils.parseEther("1"));
  });

  // it("Should update both balances after a transfer", async function () {
  //   expect(false).to.equal(true);
  // });

  it("Should not transfer more than balance", async function () {
    let sender = await accounts[1].getAddress();
    let receiver = await accounts[2].getAddress();
    await contract.connect(accounts[0]).mint(sender, ethers.utils.parseEther("1"));
    await expect(contract.connect(accounts[1]).transfer(receiver, ethers.utils.parseEther("2"))).to.be.revertedWith("MeuToken: Not enought balance");
  });

  it("Should have zero allowance from the owner to any other address when deployed", async function () {
    expect(await contract.allowances(accounts[1].getAddress(), accounts[2].getAddress())).to.equal(0);
  });

  it("Should update allowance from owner to spender when value approved for spender", async function () {
    let spender = await accounts[2].getAddress();

    await contract.connect(accounts[1]).approve(spender, ethers.utils.parseEther("1"))

    expect(await contract.allowances(accounts[1].getAddress(), accounts[2].getAddress())).to.equal(ethers.utils.parseEther("1"));
  });

  it("Should not allow spender to spend the owners tokens above allowed", async function () {
    let sender = await accounts[1].getAddress();
    let receiver = await accounts[2].getAddress();

    await contract.connect(accounts[0]).mint(sender, ethers.utils.parseEther("1"));
    await expect(contract.connect(accounts[1]).transfer(receiver, ethers.utils.parseEther("1"))).to.be.revertedWith( "MeuToken: Not allowed to transfer this amount") ;

  });

  it("Should reduce allowance from the owner to the spender when tokens are spent", async function () {
    let sender = await accounts[1].getAddress();
    let receiver = await accounts[2].getAddress();

    await contract.mint(sender, ethers.utils.parseEther("2"));
    await contract.connect(accounts[1]).approve(receiver, ethers.utils.parseEther("2"))
    await contract.connect(accounts[1]).transfer(receiver, ethers.utils.parseEther("1"));

    expect(await contract.allowances(accounts[1].getAddress(), accounts[2].getAddress())).to.equal(ethers.utils.parseEther("1"));
  });
});
