import { JsonRpcProvider } from "@ethersproject/providers"
import { Wallet } from "ethers"
import { privateKeys, RPC_URLS } from "../global/config"
import { Webhook } from "../global/Webhook"
import { MintBot } from "./Bot"
import { EventListener } from "./EventListener"

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
