import { Wallet } from "ethers";
import { Webhook } from "../commons/Webhook";
import { EventListener } from "./EventListener";
import { JsonRpcProvider } from "@ethersproject/providers";
import { MintBot } from "./Bot";
require("dotenv").config();

function runBot() {
    const mainPK = process.env.PRIVATE_KEY;
    const MORALIS_RPC_URL = process.env.MORALIS_RPC_URL!;
    const mainAccount: Wallet = new Wallet(
        mainPK!,
        new JsonRpcProvider(MORALIS_RPC_URL)
    );
    const listingContractWebhook = new Webhook("New listing");
    const bots: MintBot[] = initiateBot();

    const eventListener = new EventListener(
        MORALIS_RPC_URL,
        listingContractWebhook,
        bots
    );
    eventListener.listenToEventFromRpcUrl();
    //eventListener.getLastFlatLaunchpeg();
}

function initiateBot(): MintBot[] {
    //TODO change this
    const bots: MintBot[] = [];
    const mainPK = process.env.PRIVATE_KEY;
    const MORALIS_RPC_URL = process.env.MORALIS_RPC_URL!;
    const account: Wallet = new Wallet(
        mainPK!,
        new JsonRpcProvider(MORALIS_RPC_URL)
    );
    const webhook: Webhook = new Webhook("Bot 1");
    const bot = new MintBot(account, webhook);
    bots.push(bot);

    return bots;
}

runBot();
