import { Wallet } from "ethers"
import { Logger } from "tslog"
import WebSocket from "ws"
import { SNOWSIGHT_KEY, SNOWSIGHT_WS } from "../config/index"
import { MempoolResponse } from "./interfaces/mempool.interface"

export async function listenToListingEventInMempool(pk: string) {
    const account: Wallet = new Wallet(pk)
    const signed_key = await account.signMessage(SNOWSIGHT_KEY)
    const log: Logger = new Logger()

    const message = JSON.stringify({
        signed_key: signed_key,
        include_finalized: true,
    })

    const ws = new WebSocket(SNOWSIGHT_WS)

    ws.on("open", () => {
        ws.send(message)
    })

    log.info("Listening to sell listing event")

    ws.on("message", (data) => {
        const mempoolResponse: MempoolResponse = JSON.parse(data.toString())
        log.info(mempoolResponse)
        log.silly(+mempoolResponse.blockNumber)
    })
}
