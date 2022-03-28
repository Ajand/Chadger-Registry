const { expect } = require("chai");
const { ethers } = require("hardhat");

function addMonths(date, months) {
  date.setMonth(date.getMonth() + months);
  return date;
}

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
    2;
    chadgerGoverner = signers[10];

    const Vault = await ethers.getContractFactory("Vault");
    const PriceFinder = await ethers.getContractFactory("PriceFinder");

    const ChadgerRegistry = await ethers.getContractFactory("ChadgerRegistry");

    vaultImplementation = await Vault.deploy();
    const priceFinder = await PriceFinder.deploy();

    chadgerRegistry = await ChadgerRegistry.deploy();

    await expect(
      chadgerRegistry.initialize(
        vaultImplementation.address,
        chadgerGoverner.address,
        priceFinder.address
      )
    ).to.not.be.reverted;
  });

  it("Governer must be able to change initilization params after init but only governer ", async function () {
    signers = await ethers.getSigners();

    const Vault = await ethers.getContractFactory("Vault");
    const newVaultImplementation = await Vault.deploy();
    const PriceFinder = await ethers.getContractFactory("PriceFinder");
    const newPriceFinder = await PriceFinder.deploy();

    const newGoverner = signers[19];

    await expect(
      chadgerRegistry.changeVaultImplementation(newVaultImplementation.address)
    ).to.be.revertedWith("only governance");

    await expect(
      chadgerRegistry.changePriceFinder(newPriceFinder.address)
    ).to.be.revertedWith("only governance");

    await expect(
      chadgerRegistry.changeGovernance(newGoverner.address)
    ).to.be.revertedWith("only governance");

    await expect(
      chadgerRegistry
        .connect(chadgerGoverner)
        .changeVaultImplementation(newVaultImplementation.address)
    )
      .to.emit(chadgerRegistry, "VaultImplementationChanged")
      .withArgs(newVaultImplementation.address);

    await expect(
      chadgerRegistry
        .connect(chadgerGoverner)
        .changePriceFinder(newPriceFinder.address)
    )
      .to.emit(chadgerRegistry, "PriceFinderChanged")
      .withArgs(newPriceFinder.address);

    await expect(
      chadgerRegistry
        .connect(chadgerGoverner)
        .changeGovernance(newGoverner.address)
    )
      .to.emit(chadgerRegistry, "GovernanceChanged")
      .withArgs(newGoverner.address);

    chadgerGoverner = newGoverner;

    const vaultImplementation = await chadgerRegistry.vaultImplementation();
    const governance = await chadgerRegistry.governance();
    const priceFinder = await chadgerRegistry.priceFinder();

    expect(vaultImplementation).to.equal(newVaultImplementation.address);
    expect(governance).to.equal(newGoverner.address);
    expect(priceFinder).to.equal(newPriceFinder.address);
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
    ).to.be.revertedWith("no implementation");
  });

  it("Must throw for getting a vault detail that does not exists", async function () {
    await expect(chadgerRegistry.getVaultDetails(guardian1)).to.be.revertedWith(
      "no vault exists"
    );
  });

  it("Must be able to get a vault addresses", async function () {
    const currentVaults = await chadgerRegistry.getVaultsAddresses();
    expect(currentVaults.length).to.equal(1);
  });

  it("Must be able to get a vault details", async function () {
    const currentVaults = await chadgerRegistry.getVaultsAddresses();
    const firstVaultDetails = await chadgerRegistry.getVaultDetails(
      currentVaults[0]
    );

    expect(firstVaultDetails.strategist).to.equal(strategiest1.address);
    expect(firstVaultDetails.status).to.equal(0);
    expect(firstVaultDetails.metaPointer).to.equal(metaPointer1);
    expect(String(firstVaultDetails.tvl)).to.equal(String(0));
    expect(firstVaultDetails.vaultAddress).to.equal(currentVaults[0]);
    expect(firstVaultDetails.token).to.equal(mockToken1.address);
    expect(firstVaultDetails.keeper).to.equal(keeper1);
    expect(firstVaultDetails.guardian).to.equal(guardian1);
    expect(firstVaultDetails.treasury).to.equal(treasury1);
    expect(firstVaultDetails.badgerTree).to.equal(badgerTree1);
    expect(firstVaultDetails.name).to.equal(name1);
    expect(firstVaultDetails.symbol).to.equal(symbol1);
    expect(String(firstVaultDetails.performanceFeeGovernance)).to.equal(
      String(performanceFeeGovernance1)
    );
    expect(String(firstVaultDetails.performanceFeeStrategist)).to.equal(
      String(performanceFeeStrategist1)
    );
    expect(String(firstVaultDetails.withdrawalFee)).to.equal(
      String(withdrawalFee1)
    );
    expect(String(firstVaultDetails.managementFee)).to.equal(
      String(managementFee1)
    );
    expect(String(firstVaultDetails.strategy)).to.equal(
      String("0x0000000000000000000000000000000000000000")
    );
  });

  it("Must be able to get user balance for a vault", async function () {
    const currentVaults = await chadgerRegistry.getVaultsAddresses();
    const firstVaultDetails = await chadgerRegistry.getVaultDetails(
      currentVaults[0]
    );

    const userBalance = await chadgerRegistry.getUserVaultBalance(
      currentVaults[0],
      strategiest1.address
    );

    expect(String(userBalance.token)).to.equal(firstVaultDetails.token);
    expect(String(userBalance.amount)).to.equal(String(0));
    expect(String(userBalance.usd)).to.equal(String(0));
  });

  it("Must be able to get user balance for all vaults", async function () {
    const userBalance = await chadgerRegistry.getUserBalance(
      strategiest1.address
    );

    expect(userBalance.length).to.equal(1);
  });

  it("Let's set strategy", async function () {
    const currentVaults = await chadgerRegistry.getVaultsAddresses();
    const TestStrategy = await ethers.getContractFactory("TestStrategy");

    strategiest1 = signers[14];

    const testStrategy = await TestStrategy.connect(strategiest1).deploy();

    await testStrategy.initialize(currentVaults[0], [mockToken1.address]);

    await expect(
      vaultImplementation
        .attach(currentVaults[0])
        .connect(strategiest1)
        .setStrategy(testStrategy.address)
    )
      .to.emit(vaultImplementation.attach(currentVaults[0]), "SetStrategy")
      .withArgs(testStrategy.address);

    const firstVaultDetails = await chadgerRegistry.getVaultDetails(
      currentVaults[0]
    );

    expect(String(firstVaultDetails.strategy)).to.equal(testStrategy.address);
  });

  it("Only gorverner must be able to change the status of a vault", async function () {
    const currentVaults = await chadgerRegistry.getVaultsAddresses();

    await expect(
      chadgerRegistry.changeVaultStatus(currentVaults[0], 2)
    ).to.be.revertedWith("only governance");

    await expect(
      chadgerRegistry
        .connect(chadgerGoverner)
        .changeVaultStatus(currentVaults[0], 1)
    )
      .to.emit(chadgerRegistry, "VaultStatusChanged")
      .withArgs(currentVaults[0], 1);

    const firstVaultDetails = await chadgerRegistry.getVaultDetails(
      currentVaults[0]
    );

    expect(String(firstVaultDetails.status)).to.equal(String(1));
  });

  it("Let's test the APR calculator", async function () {
    const aYearAgo = parseInt(addMonths(new Date(), -12) / 1000);
    const sixMonthAgo = parseInt(addMonths(new Date(), -6) / 1000);
    const futureDate = parseInt(addMonths(new Date(), 1) / 1000);

    expect(
      String(await chadgerRegistry.calculateAPR(200, 0, sixMonthAgo))
    ).to.equal("0");

    expect(
      String(await chadgerRegistry.calculateAPR(200, 1000, futureDate))
    ).to.equal("0");

    expect(
      String(await chadgerRegistry.calculateAPR(0, 1000, aYearAgo))
    ).to.equal("0");

    expect(
      String(await chadgerRegistry.calculateAPR(0, 1000, aYearAgo))
    ).to.equal("0");

    expect(
      String(await chadgerRegistry.calculateAPR(1000, 1000, aYearAgo))
    ).to.equal("10000");

    expect(
      String(await chadgerRegistry.calculateAPR(1000, 1000, sixMonthAgo))
    ).to.equal("20000");

    expect(
      String(await chadgerRegistry.calculateAPR(200, 1000, sixMonthAgo))
    ).to.equal("4000");
  });

  it("Let's test the APR calculator", async function () {
    const currentVaults = await chadgerRegistry.getVaultsAddresses();

    await mockToken1.mint(signers[0].address, 400000);
    await mockToken1.approve(currentVaults[0], 400000);
    //console.log(vaultImplementation.attach(currentVaults[0])["deposit"]);
    await vaultImplementation
      .attach(currentVaults[0])
      ["deposit(uint256)"](400000);

    await vaultImplementation
      .attach(currentVaults[0])
      .connect(strategiest1)
      .earn();

    await network.provider.send("evm_increaseTime", [3600 * 24 * 60]);
    await network.provider.send("evm_mine");
    const VaultAPR2Month = await chadgerRegistry.getVaultAPR(currentVaults[0]);

    await network.provider.send("evm_increaseTime", [3600 * 24 * 60]);
    await network.provider.send("evm_mine");

    const VaultAPR4Month = await chadgerRegistry.getVaultAPR(currentVaults[0]);

    expect(String(VaultAPR2Month[1].apr.div(VaultAPR4Month[1].apr))).to.equal(
      String(2)
    );
  });
});
