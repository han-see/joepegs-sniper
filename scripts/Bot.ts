import { JsonRpcProvider } from "@ethersproject/providers";
import { Webhook } from "discord.js";
import { Wallet } from "ethers";

export class Bot {
    private provider: JsonRpcProvider;
    private account: Wallet;
    private webhook: Webhook;

    constructor(account: Wallet, rpcUrl: string, webhook: Webhook) {
        this.provider = new JsonRpcProvider(rpcUrl);
        this.account = account;
        this.webhook = webhook;
    }
}
