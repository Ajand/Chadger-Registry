const hre = require("hardhat");
const ethers = hre.ethers;

let chadgerGoverner,
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

async function main() {
  const signers = await ethers.getSigners();

  console.log(signers.length);

  const governer = signers[1];

  const Vault = await ethers.getContractFactory("Vault");
  const PriceFinder = await ethers.getContractFactory("PriceFinder");
  const ChadgerRegistry = await ethers.getContractFactory("ChadgerRegistry");

  const vaultImplementation = await Vault.deploy();
  const priceFinder = await PriceFinder.deploy();

  const chadgerRegistry = await ChadgerRegistry.deploy();

  await chadgerRegistry.initialize(
    vaultImplementation.address,
    governer.address,
    priceFinder.address
  );

  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken1 = await MockToken.deploy();
  mockToken1.initialize([], [])

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

  await chadgerRegistry
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
    );

  const currentVaults = await chadgerRegistry.getVaultsAddresses();
  const TestStrategy = await ethers.getContractFactory("TestStrategy");

  const testStrategy = await TestStrategy.connect(strategiest1).deploy();

  await testStrategy.initialize(currentVaults[0], [mockToken1.address]);

  await vaultImplementation
    .attach(currentVaults[0])
    .connect(strategiest1)
    .setStrategy(testStrategy.address);

  console.log(`Chadger registry deployed at: ${chadgerRegistry.address}`);

  console.log(await chadgerRegistry.governance())

  //
  // const ChadgerRegistry = await ethers.getContractFactory("ChadgerRegistry");
  //
  // console.log(ChadgerRegistry);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
