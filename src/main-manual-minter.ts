import { JsonRpcProvider } from "@ethersproject/providers"
import { Logger } from "tslog"
import {
    botName,
    contractAddress,
    privateKeys,
    RPC_URLS,
    timestamp,
} from "./config/index"
import { MintBot } from "./mint-bot/mint-bot"
import { initiateManualBot, manualMint } from "./mint-bot/mint-bot.service"
import { Webhook } from "./utils/webhook.service"

const log: Logger = new Logger()

function runBot() {
    const bots: MintBot[] = initiateManualBot(RPC_URLS, privateKeys, botName)

    log.info("Contract Address: ", contractAddress)
    log.info("Mint open on: ", timestamp)

    manualMint(
        timestamp,
        contractAddress,
        bots,
        new JsonRpcProvider(RPC_URLS[0]),
        new Webhook(`${botName} Manual bot`)
    )
}

runBot()
