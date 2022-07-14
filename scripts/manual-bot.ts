import { Wallet } from "ethers"
import { Webhook } from "../commons/Webhook"
import { JsonRpcProvider } from "@ethersproject/providers"
import { MintBot } from "./Bot"
require("dotenv").config()

function runBot() {
    const isTest = process.argv[2] === "test" ? true : false
    const contractAddress = process.env.ADDRESS || "0x"
    const timestamp = parseInt(process.env.TIMESTAMP || "0")
    const botName = process.env.BOTNAME || "NFT"

    const mainPK = isTest ? process.env.TEST_PK! : process.env.PRIVATE_KEY!
    const RPC_URL = isTest ? process.env.TEST_RPC! : process.env.AVAX_RPC_URL!
    const bots: MintBot[] = initiateBot(RPC_URL, JSON.parse(mainPK), botName)

    console.log("Contract Address: ", contractAddress)
    console.log("Mint open on: ", timestamp)

    manualMint(
        timestamp,
        contractAddress,
        bots,
        new JsonRpcProvider(RPC_URL),
        new Webhook(`${botName} Manual bot`)
    )
}

function initiateBot(
    rpcUrl: string,
    privateKeys: string[],
    botName: string
): MintBot[] {
    const bots: MintBot[] = []
    let i = 1
    for (let pk of privateKeys) {
        const provider = new JsonRpcProvider(rpcUrl)
        const account: Wallet = new Wallet(pk, provider)
        const webhook: Webhook = new Webhook(`${botName} Manual Bot ${i}`)
        const bot = new MintBot(account, webhook, provider)
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
