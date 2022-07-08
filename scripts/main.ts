import { Wallet } from "ethers";
import { Webhook } from "../commons/Webhook";
import { EventListener } from "./EventListener";
import { JsonRpcProvider } from "@ethersproject/providers";
import { MintBot } from "./Bot";
require("dotenv").config();

function runBot() {
    const isTest = process.argv[2] === "test" ? true : false;
    const mainPK = isTest ? process.env.TEST_PK! : process.env.PRIVATE_KEY!;
    const RPC_URL = isTest
        ? process.env.TEST_RPC!
        : process.env.MORALIS_RPC_URL!;
    const mainAccount: Wallet = new Wallet(
        mainPK!,
        new JsonRpcProvider(RPC_URL)
    );
    const listingContractWebhook = new Webhook("New listing");
    const bots: MintBot[] = initiateBot(RPC_URL, mainPK);

    const eventListener = new EventListener(
        RPC_URL,
        listingContractWebhook,
        bots
    );
    eventListener.listenToEventFromRpcUrl();
    // eventListener.getLastFlatLaunchpeg();
}

function initiateBot(rpcUrl: string, pk: string): MintBot[] {
    //TODO change this
    const bots: MintBot[] = [];
    const account: Wallet = new Wallet(pk, new JsonRpcProvider(rpcUrl));
    const webhook: Webhook = new Webhook("Bot 1");
    const bot = new MintBot(account, webhook);
    bots.push(bot);

    return bots;
}

runBot();
