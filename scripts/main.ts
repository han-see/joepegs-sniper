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
    const listingContractWebhook = new Webhook("New listing")
    const bots: MintBot[] = initiateBot(RPC_URL, JSON.parse(mainPK))

    const eventListener = new EventListener(
        RPC_URL,
        listingContractWebhook,
        bots
    )
    eventListener.listenToEventFromRpcUrl()
    // eventListener.getLastFlatLaunchpeg();
    // Boolin bulls
    // 1657570800
    // 0xcf0f4519F2f55Ef40e2dDDcb7c99893297E40336
    // manualMint(1657570800, "0xcf0f4519F2f55Ef40e2dDDcb7c99893297E40336", bots)
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

function manualMint(
    mintTime: number,
    contractAddress: string,
    bots: MintBot[]
) {
    let counter = 1
    for (const bot of bots) {
        console.log(`Initiating bot ${counter}`)
        bot.mintFreeFlatJoePeg(mintTime, contractAddress)
        counter++
    }
}

runBot()
