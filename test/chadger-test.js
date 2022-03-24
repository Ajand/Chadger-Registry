const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chadger Tests", function () {
  let chadgerRegistry, signers, chadgerGoverner, vaultImplementation;

  it("Should be able to initialize contract with proper contract", async function () {
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
