require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: "0.8.24",
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      // Local Hardhat network
    },
    ethereum: {
      url: process.env.RPC_URL, // Infura URL for Ethereum mainnet
      accounts: [process.env.PRIVATE_KEY],
    },
    spoila_eth: {
      url: process.env.RPC_URL, // Infura URL for Rinkeby testnet
      accounts: [process.env.PRIVATE_KEY],
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/", // BSC mainnet URL
      accounts: [process.env.PRIVATE_KEY],
    },
    bsc_test: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/", // BSC Testnet URL
      accounts: [process.env.PRIVATE_KEY],
    },

    spoila_base: {
      url: process.env.RPC_URL, // Infura URL for Rinkeby testnet
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.SCAN_API_KEY,
  },
};
