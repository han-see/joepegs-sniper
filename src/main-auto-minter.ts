import { JsonRpcProvider } from "@ethersproject/providers"
import { Wallet } from "ethers"
import { EventListener } from "./event/event.service"
import { MintBot } from "./bot/bot"
import { privateKeys, RPC_URLS } from "./config"
import { Webhook } from "./utils/webhook.service"

function runBot() {
    const listingContractWebhook = new Webhook("New listing")

    const eventListener = new EventListener(
        RPC_URLS,
        listingContractWebhook,
        privateKeys
    )
    eventListener.listenToEventFromRpcUrl()
    // eventListener.getLastFlatLaunchpeg();
    // listenToListingEventInMempool(JSON.parse(mainPK)[0])
}

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

runBot()
