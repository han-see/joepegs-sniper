import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "dotenv/config";
import "solidity-coverage";
import "hardhat-deploy";
import "solidity-coverage";
import { HardhatUserConfig } from "hardhat/config";

const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a";
const AVAX_RPC_URL = process.env.AVAX_RPC_URL || "test";
const FUJI_RPC_URL = process.env.FUJI_RPC_URL || "test";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: AVAX_RPC_URL,
      },
    },
    fuji: {
      chainId: 43113,
      gasPrice: 225000000000,
      url: FUJI_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    avalanche: {
      chainId: 43114,
      gasPrice: 225000000000,
      accounts: [PRIVATE_KEY],
      url: AVAX_RPC_URL,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
