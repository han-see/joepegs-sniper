import { JsonRpcProvider } from "@ethersproject/providers";
import { Webhook } from "../commons/Webhook";
import {
    getLastFlatLaunchpeg,
    listenToListingEvent,
} from "./getLastFlatLaunchpeg";

async function main() {
    const provider = new JsonRpcProvider(
        "https://api.avax.network/ext/bc/C/rpc"
    );
    const webhook = new Webhook("New listing");

    await getLastFlatLaunchpeg(provider, webhook);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
