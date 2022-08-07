import { Logger } from "tslog"
import { isTest, privateKeys, RPC_URLS } from "./config/index"
import { EventListener } from "./event/event"
import { Webhook } from "./utils/webhook.service"

const log: Logger = new Logger()

function runBot() {
    const listingContractWebhook = new Webhook("New listing")

    log.info(`Test : ${isTest}`)
    log.info(`RPC URLS : ${RPC_URLS}`)

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
