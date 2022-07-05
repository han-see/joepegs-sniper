import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "ethers";
import { ethers } from "hardhat";
import { Webhook } from "../commons/Webhook";
import {
    JOEPEGS_PROXY_CONTRACT,
    SNOWSIGHT_KEY,
    SNOWSIGHT_WS,
} from "../global/config";
import WebSocket from "ws";
export interface MempoolResponse {
    blockNumber: string;
    from: string;
    gas: string;
    gasPrice: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    hash: string;
    input: string;
    nonce: string;
    to: string;
    value: string;
    txType: string;
}
export class EventListener {
    private provider: JsonRpcProvider;
    private webhook: Webhook;
    private account: Wallet;

    // Initialized event from the flatLaunchPeg
    private filterLog = {
        topics: [
            ethers.utils.id("Initialized(uint256,uint256,uint256,uint256)"),
        ],
    };

    constructor(account: Wallet, rpcUrl: string, webhook: Webhook) {
        this.provider = new JsonRpcProvider(rpcUrl);
        this.account = account;
        this.webhook = webhook;
    }

    async listenToEventFromRpcUrl() {
        if (this.provider === undefined) {
            throw "Provider is undefined";
        }

        console.log("Listening to event");
        this.provider.on(this.filterLog, async (log) => {
            console.log(log);
            if (log.length !== 0) {
                const txReceipt = await this.provider.getTransactionReceipt(
                    log[0].transactionHash
                );
                console.log(txReceipt);
                if (
                    txReceipt.to.toLowerCase() ===
                    JOEPEGS_PROXY_CONTRACT.toLowerCase()
                ) {
                    this.webhook.sendMessageToUser(JSON.stringify(log));
                }
            }
        });
        this.provider.on("block", (blockNumber) => {
            console.log(`Current blocknumber ${blockNumber}`);
        });
    }

    async getLastFlatLaunchpeg() {
        let currentBlock: number = await this.provider.getBlockNumber();
        let pastBlock: number = currentBlock - 2000;
        let isEventFound = false;

        while (!isEventFound) {
            console.log(
                `Checking the latest listing Event from block ${currentBlock}`
            );
            // max query set data is 2048 (avax node)
            // max query set data is 2000 (moralis node)
            const getSaleEvent = await this.provider.getLogs({
                fromBlock: pastBlock,
                toBlock: currentBlock,
                ...this.filterLog,
            });
            console.log(getSaleEvent);
            if (getSaleEvent.length === 0) {
                currentBlock = pastBlock;
                pastBlock -= 2000;
            } else {
                const txReceipt = await this.provider.getTransactionReceipt(
                    getSaleEvent[0].transactionHash
                );
                console.log(txReceipt);
                if (
                    txReceipt.to.toLowerCase() ===
                    JOEPEGS_PROXY_CONTRACT.toLowerCase()
                ) {
                    await this.webhook.sendMessageToUser(
                        JSON.stringify(getSaleEvent),
                        getSaleEvent[0].transactionHash
                    );
                    isEventFound = true;
                }
            }
        }
    }

    // not needed
    async listenToListingEventInMempool() {
        if (this.account == undefined) {
            throw "Account is undefined";
        }
        const signed_key = await this.account.signMessage(SNOWSIGHT_KEY);

        const message = JSON.stringify({
            signed_key: signed_key,
            include_finalized: true,
        });

        const ws = new WebSocket(SNOWSIGHT_WS);

        ws.on("open", () => {
            console.log("Ws::open");
            ws.send(
                JSON.stringify({
                    signed_key: signed_key,
                    include_finalized: true,
                })
            );
        });
        console.log("Listening to contract listing event");

        ws.on("message", (data) => {
            this.checkMempoolResponseForSaleEvent(data);
        });
    }

    // not needed yet
    private checkMempoolResponseForSaleEvent(data: any) {
        const mempoolResponse: MempoolResponse = JSON.parse(data.toString());
        /* if (
            mempoolResponse.to === JOEPEGS_FACTORY_CONTRACT.toLowerCase() &&
            mempoolResponse.blockNumber === "0x0"
        ) {
            console.log(new Date().toUTCString());
            console.log(mempoolResponse);
        } */
        console.log(mempoolResponse);
    }
}
