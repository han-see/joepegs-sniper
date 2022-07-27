import { Wallet } from "ethers"
import WebSocket from "ws"
import { SNOWSIGHT_KEY, SNOWSIGHT_WS } from "../global/config"
import { MempoolResponse } from "./EventListener"

export async function listenToListingEventInMempool(pk: string) {
    const account: Wallet = new Wallet(pk)
    const signed_key = await account.signMessage(SNOWSIGHT_KEY)

    const message = JSON.stringify({
        signed_key: signed_key,
        include_finalized: true,
    })

    const ws = new WebSocket(SNOWSIGHT_WS)

    ws.on("open", () => {
        ws.send(message)
    })

    console.log("Listening to sell listing event")

    ws.on("message", (data) => {
        const mempoolResponse: MempoolResponse = JSON.parse(data.toString())
        //console.log(mempoolResponse)
        console.log(+mempoolResponse.blockNumber)
    })
}
