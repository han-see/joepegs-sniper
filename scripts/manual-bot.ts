import { JsonRpcProvider } from "@ethersproject/providers"
import { Wallet } from "ethers"
import { privateKeys, RPC_URLS } from "../global/config"
import { Webhook } from "../global/Webhook"
import { MintBot } from "./Bot"
require("dotenv").config()

function runBot() {
    const contractAddress = process.env.ADDRESS || "0x"
    const timestamp = parseInt(process.env.TIMESTAMP || "0")
    const botName = process.env.BOTNAME || "NFT"
    const bots: MintBot[] = initiateManualBot(RPC_URLS, privateKeys, botName)

    console.log("Contract Address: ", contractAddress)
    console.log("Mint open on: ", timestamp)

    manualMint(
        timestamp,
        contractAddress,
        bots,
        new JsonRpcProvider(RPC_URLS[0]),
        new Webhook(`${botName} Manual bot`)
    )
}

function initiateManualBot(
    rpcUrls: string[],
    privateKeys: string[],
    botName: string
): MintBot[] {
    const bots: MintBot[] = []
    const providers: JsonRpcProvider[] = []
    let i = 1

    for (let rpcUrl of rpcUrls) {
        providers.push(new JsonRpcProvider(rpcUrl))
    }

    for (let pk of privateKeys) {
        const account: Wallet = new Wallet(pk, providers[0])
        const webhook: Webhook = new Webhook(`${botName} Manual Bot ${i}`)
        const bot = new MintBot(account, webhook, providers)
        bots.push(bot)
        console.log(`${botName} Manual Bot ${i} initiated : ${account.address}`)
        i++
    }
    return bots
}

async function manualMint(
    mintTime: number,
    contractAddress: string,
    bots: MintBot[],
    provider: JsonRpcProvider,
    webhook: Webhook
) {
    let counter = 1
    for (const bot of bots) {
        console.log(`Initiating bot ${counter}`)
        bot.mintFreeFlatJoePeg(mintTime, contractAddress)
        counter++
    }

    const blockNumber = await provider.getBlockNumber()
    const blockTimestamp = (await provider.getBlock(blockNumber)).timestamp
    if (blockTimestamp > mintTime) {
        console.log("Mint time is in the past. Turning off manual minting.")
        await webhook.sendMessageToUser(
            `Manual minting time for ${contractAddress} is in the past. Turning off manual bot`
        )
        process.exit(1)
    }
}

runBot()
