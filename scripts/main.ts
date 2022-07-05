import { Wallet } from "ethers";
import { Webhook } from "../commons/Webhook";
import { EventListener } from "./EventListener";

function runBot() {
    const mainPK = process.env.PRIVATE_KEY;
    const MORALIS_RPC_URL = process.env.MORALIS_RPC_URL!;
    const mainAccount: Wallet = new Wallet(mainPK!);
    const listingContractWebhook = new Webhook("New listing");

    const eventListener = new EventListener(
        mainAccount,
        MORALIS_RPC_URL,
        listingContractWebhook
    );
    eventListener.getLastFlatLaunchpeg();
}

runBot();
