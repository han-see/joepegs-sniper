import { Wallet } from "ethers"
import { Webhook } from "../commons/Webhook"
import { EventListener } from "./EventListener"
import { JsonRpcProvider } from "@ethersproject/providers"
import { MintBot } from "./Bot"
require("dotenv").config()

function runBot() {
    const isTest = process.argv[2] === "test" ? true : false
    const mainPK = isTest ? process.env.TEST_PK! : process.env.PRIVATE_KEY!
    const RPC_URL = isTest ? process.env.TEST_RPC! : process.env.AVAX_RPC_URL!
    const bots: MintBot[] = initiateBot(RPC_URL, JSON.parse(mainPK))

    manualMint(
        1657570800,
        "0xcf0f4519F2f55Ef40e2dDDcb7c99893297E40336",
        bots,
        new JsonRpcProvider(RPC_URL),
        new Webhook("Manual bot")
    )
}

function initiateBot(rpcUrl: string, privateKeys: string[]): MintBot[] {
    const bots: MintBot[] = []
    let i = 1
    for (let pk of privateKeys) {
        const account: Wallet = new Wallet(pk, new JsonRpcProvider(rpcUrl))
        const webhook: Webhook = new Webhook(`Bot ${i}`)
        const bot = new MintBot(account, webhook)
        bots.push(bot)
        console.log(`Bot ${i} initiated : ${account.address}`)
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
        // to kill the process on manual minting
        process.kill(process.pid, "SIGTERM")
    }
}

runBot()
