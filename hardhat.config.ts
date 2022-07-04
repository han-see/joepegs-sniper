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

const FUJI_PRIVATE_KEY =
  process.env.FUJI_PRIVATE_KEY ||
  "0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: "https://api.avax.network/ext/bc/C/rpc",
      },
    },
    fuji: {
      chainId: 43113,
      gasPrice: 225000000000,
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [FUJI_PRIVATE_KEY],
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
