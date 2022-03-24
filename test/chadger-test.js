const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chadger Tests", function () {
  let chadgerRegistry,
    signers,
    chadgerGoverner,
    vaultImplementation,
    mockToken1,
    keeper1,
    guardian1,
    treasury1,
    badgerTree1,
    withdrawalFee1,
    managementFee1,
    performanceFeeGovernance1,
    performanceFeeStrategist1,
    name1,
    symbol1,
    metaPointer1,
    strategiest1;

  it("Must be able to initialize contract with proper contract", async function () {
    signers = await ethers.getSigners();

    chadgerGoverner = signers[10];

    const Vault = await ethers.getContractFactory("Vault");

    const ChadgerRegistry = await ethers.getContractFactory("ChadgerRegistry");

    vaultImplementation = await Vault.deploy();

    chadgerRegistry = await ChadgerRegistry.deploy();

    await expect(
      chadgerRegistry.initialize(
        vaultImplementation.address,
        chadgerGoverner.address
      )
    ).to.not.be.reverted;
  });

  it("Must be able to add new contract to registery", async function () {
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken1 = await MockToken.deploy();

    strategiest1 = signers[14];

    keeper1 = signers[11].address;
    guardian1 = signers[12].address;
    treasury1 = signers[13].address;
    badgerTree1 = signers[14].address;
    name1 = "firstVault";
    symbol1 = "FVT";
    performanceFeeGovernance1 = 1200;
    performanceFeeStrategist1 = 800;
    withdrawalFee1 = 25;
    managementFee1 = 20;
    metaPointer1 =
      "This is going to be changed by an ipfs url that will contain the vault metadata";

    await expect(
      chadgerRegistry
        .connect(strategiest1)
        .addVault(
          mockToken1.address,
          keeper1,
          guardian1,
          treasury1,
          badgerTree1,
          name1,
          symbol1,
          [
            performanceFeeGovernance1,
            performanceFeeStrategist1,
            withdrawalFee1,
            managementFee1,
          ],
          metaPointer1
        )
    ).to.emit(chadgerRegistry, "VaultAdded");
  });

  it("Must not be able to add new vault before initialization", async function () {
    const ChadgerRegistry = await ethers.getContractFactory("ChadgerRegistry");

    const chadgerRegistry2 = await ChadgerRegistry.deploy();


    await expect(
      chadgerRegistry2
        .connect(strategiest1)
        .addVault(
          mockToken1.address,
          keeper1,
          guardian1,
          treasury1,
          badgerTree1,
          name1,
          symbol1,
          [
            performanceFeeGovernance1,
            performanceFeeStrategist1,
            withdrawalFee1,
            managementFee1,
          ],
          metaPointer1
        )
    ).to.be.revertedWith("Vault implementation does not exists.");
  });

  // let's add vault getter
});

/*
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const sac = await ethers.getContractFactory("SettAccessControl");

    await sac.deploy()

    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});

*/
