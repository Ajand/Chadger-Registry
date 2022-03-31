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

// rinkeby addresses
async function main() {
  const signers = await ethers.getSigners();

  console.log(signers.length);

  const governer = signers[0];

  const Vault = await ethers.getContractFactory("Vault");
  const PriceFinder = await ethers.getContractFactory("PriceFinder");
  const ChadgerRegistry = await ethers.getContractFactory("ChadgerRegistry");

  const vaultImplementationAddress =
    "0xdd6f072e8d3aa979a63f73a35254e2f339574d44"; //await Vault.deploy();

  const priceFinderAddress = "0xe2bb10ad05e2b5865a451ce94e1c0d3c17ef9189"; //await PriceFinder.deploy();
  // priceFinder.wait()2

  const chadgerAddress = "0x38b90de7b389cab8f303a622323be0712a96d604";
  const chadgerRegistry = ChadgerRegistry.attach(chadgerAddress);
  //await chadgerRegistry.initialize(
  //  vaultImplementationAddress,
  //  governer.address,
  //  priceFinderAddress
  //);

  //tx1.wait();

  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken1Address = "0x5B194B477AF009A5ACa6694c9230937D9E7434FC"; //await MockToken.deploy();
  const mockToken1 = MockToken.attach(mockToken1Address);
  //const tx2 = await mockToken1.initialize([], []);

  strategiest1 = signers[0];

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
  metaPointer1 = "bafkreien7tebl6bfhfzdyo5qun4matophsoqraf6vn5ibarg5mozztvfim";

  const tx3 = await chadgerRegistry
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

  const testStrategyAddress = "0xe02852d0eb21e5354393a13d7d45e978ac8cea69";

  const testStrategy =
    TestStrategy.connect(strategiest1).attach(testStrategyAddress);

  // const tx4 = await testStrategy.initialize(currentVaults[0], [
  //   mockToken1.address,
  // ]);
  //
  //tx4.wait();

  //await Vault.attach(currentVaults[0])
  //  .connect(strategiest1)
  //  .setStrategy(testStrategy.address);

   console.log(`Chadger registry deployed at: ${chadgerRegistry.address}`);

  console.log(await chadgerRegistry.governance());

  //const meAddress = "0x4A87a2A017Be7feA0F37f03F3379d43665486Ff8"
//
  //const tx5 = await mockToken1.mint(meAddress, '5000000000000000000');
 // tx5.wait();
  //const tx6 = await mockToken1.approve(currentVaults[0], 400000);
  //tx6.wait();
  //console.log(vaultImplementation.attach(currentVaults[0])["deposit"]);
 //const tx7 = await Vault
 //   .attach(currentVaults[0])
 //   ["deposit(uint256)"](400000);
//
 // tx7.wait();

  // const tx8 = await Vault
  //  .attach(currentVaults[0])
  //  .connect(strategiest1)
  //  .earn();
//
  //tx8.wait();
  //
  // const ChadgerRegistry = await ethers.getContractFactory("ChadgerRegistry");
  //
  // console.log(ChadgerRegistry); */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
