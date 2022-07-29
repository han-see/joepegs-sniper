import { JsonRpcProvider } from "@ethersproject/providers"
import { Wallet } from "ethers"
import { Webhook } from "../utils/webhook.service"
import { MintBot } from "./mint-bot"
require("dotenv").config()

export function initiateBot(
    rpcUrls: string[],
    privateKeys: string[]
): MintBot[] {
    const bots: MintBot[] = []
    const providers: JsonRpcProvider[] = []
    let i = 1

    for (let rpcUrl of rpcUrls) {
        providers.push(new JsonRpcProvider(rpcUrl))
    }

    for (let pk of privateKeys) {
        /* the account needs to be connected to one of the provider just for the contract purposes
        to check the contract, if it's a legit contract or not */
        const account: Wallet = new Wallet(pk, providers[0])
        const webhook: Webhook = new Webhook(`Bot ${i}`)
        bots.push(new MintBot(account, webhook, providers))
        console.log(`Bot ${i} initiated : ${account.address}`)
        i++
    }
    return bots
}

export function initiateManualBot(
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

export async function manualMint(
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
