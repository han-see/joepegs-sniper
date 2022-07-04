import { JsonRpcProvider, WebSocketProvider } from "@ethersproject/providers";
import { Webhook } from "../commons/Webhook";
import {
    getLastFlatLaunchpeg,
    listenToListingEvent,
} from "./getLastFlatLaunchpeg";

async function main() {
    const provider = new JsonRpcProvider(process.env.MORALIS_RPC_URL!);
    const webhook = new Webhook("New listing");

    await listenToListingEvent(provider, webhook);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
