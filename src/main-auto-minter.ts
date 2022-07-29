import { privateKeys, RPC_URLS } from "./config/index"
import { EventListener } from "./event/event"
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

runBot()
