require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const ALCHEMY_API_KEY = "vfhvTxxlrhwKNnsWfOgxYBKLQyNVuAFj";
const ALCHEMY_RINKBEY_KEY = "ECaZlPQuREMJ9QDkhYT4c3tkY9or3xDD";

const ROPSTEN_PRIVATE_KEY =
  "d0a5b9f20617262054f23da0006eea27c7f7db709baf8568d2b29aede82422df";

const secondaryRopstenAccounts = [
  "c707c774141757060600032ce358208857d1eca210cf3b894d9c86d55f89e109",
  "29d6d8e96f07c8f59e21a0c205c97d63483700052930ac98cb59b79c34b708e4",
  "6a2bf7af6c33de26c4a780b273691f2ebe3a13756a841289e612686a93ed9516",
  "ecf16074a4dd5c0a3d7cd5c09fbe13858c6200d13d66ad6b3848aa7c6d6657d3",
  "af2e2a63656e665264f0325f5e997a5f14e14f4f0ac2e363ecf9b46da700f2e7",
  "ebc02cd2bfd9e2e8529346a740d53104ee2facdfef6143eb8e5e7e69288e25cc",
  "6594ba1c3beee6d9bb9ec8cbc8003312a731de167edeb41853d93b16670edb9d",
  "485645cb3bb62d6b1aa1c27aba606986a6559dd8a1599d9a6397a330b426d1d9",
  "9cb52b390b73bc611b0fe74f54dbc30a4bc1d37bf3a2ffaf8dbf795701697a24",
  "0d4adc1d95ac2cd827a05afd64ebc19af300e74ab749fa6ee00740d7bdcdebf6",
  "476644d4c9c9cd0b1b291fdae2ad58d0309cbd6b3936b5d3d3e513179b935df6",
  "164a3372f95f0093b60010310d30ec52af25bac10840d07327cc7add09b1dd36",
  "5ee16cffe83c9f24922deca272de3a1d62d11853e1c3edf9624fb3612209cbd8",
  "c304504c1bb58fe300afdb7bf2f908d6b15c6d52e3fc09a990bfed1e77e0d8ea",
  "f8801ca9477e122d52e1c8d27f8fb7486b3fc6641c33057333509dff35081ced",
  "975fe38a9772729b297a9263333a69701c7464bf316b53df4d28d0dfcf21d316",
  "c95ef7388aa6dd59b8ddc82a28816c464976ab255846b6cffb0ab64536100b13",
  "27e7b81c7db2a1b8054be051220e4caf02ea3249cafa779cfa32bb70d2a2bdc3",
  "4b80472f495c9cc73e6bf803939cb2cf9f385da5e85c5adb26fc5eb92c95b021",
  "facd525bdbfa8e9e72152b3f643d9786b100b62d5de4758f141648028e3dd874",
  "6e9b2bd188889a39ff449733a609ea93d4c8eabcfc066a4277f2de090f9c78b1",
  "f21d34416b88a9b0e6423a48bc6d16e9dc9fbc6ab48162e909ca63192bafc287",
  "7fa901a6ecbb0baa0dcf8a07677ee55b39f9f72bdfcc4811298958cd8ea1881a",
  "9d11c1796582e91440f52b280a2e87725892b4641da87e080f43da954df398c5",
  "fe9ed5939445e63890e23d2ee1e6a484c94c101f1d17158b703088d4ff01be93",
];

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      // allowUnlimitedContractSize: true,
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${ROPSTEN_PRIVATE_KEY}`, ...secondaryRopstenAccounts],
      gasPrice: 15000000000,
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${ROPSTEN_PRIVATE_KEY}`, ...secondaryRopstenAccounts],
      //gasPrice: 5000000000,
    },
  },
};
