require("dotenv").config()

export const SNOWSIGHT_WS = "ws://mempool-stream.snowsight.chainsight.dev:8589"

// Snowsight key
export const SNOWSIGHT_KEY =
    "Sign this message to authenticate your wallet with Snowsight."

export const JOEPEGS_FACTORY_CONTRACT =
    "0x7bfd7192e76d950832c77bb412aae841049d8d9b"

export const JOEPEGS_PROXY_CONTRACT =
    "0x64c4607AD853999EE5042Ba8377BfC4099C273DE"

export const isTest = process.argv[2] === "test" ? true : false
export const privateKeys: string[] = JSON.parse(
    isTest ? process.env.TEST_PK! : process.env.PRIVATE_KEY!
)
export const RPC_URLS: string[] = JSON.parse(
    isTest ? process.env.TEST_RPC! : process.env.RPC_URLS!
)
