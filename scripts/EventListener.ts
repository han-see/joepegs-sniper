import { JsonRpcProvider } from "@ethersproject/providers"
import { BigNumber } from "ethers"
import { ethers } from "ethers"
import { Webhook } from "../commons/Webhook"
import { MintBot } from "./Bot"
import { FlatLaunchpegABI } from "../constants"
export interface MempoolResponse {
    blockNumber: string
    from: string
    gas: string
    gasPrice: string
    maxFeePerGas: string
    maxPriorityFeePerGas: string
    hash: string
    input: string
    nonce: string
    to: string
    value: string
    txType: string
}

export interface FlatJoeInitializedEvent {
    allowlistStartTime: BigNumber
    publicSaleStartTime: BigNumber
    allowlistPrice: BigNumber
    salePrice: BigNumber
}
export class EventListener {
    private provider: JsonRpcProvider
    private webhook: Webhook
    private bots: MintBot[]
    private joeFlatLaunchpegTopics: string = ethers.utils.id(
        "Initialized(uint256,uint256,uint256,uint256)"
    )
    private flatLaunchpeg = FlatLaunchpegABI
    private iface = new ethers.utils.Interface(this.flatLaunchpeg)

    // Initialized event from the flatLaunchPeg
    private filterLog = {
        topics: [this.joeFlatLaunchpegTopics],
    }

    constructor(rpcUrl: string, webhook: Webhook, bots: MintBot[]) {
        this.provider = new JsonRpcProvider(rpcUrl)
        this.webhook = webhook
        this.bots = bots
    }

    async listenToEventFromRpcUrl() {
        if (this.provider === undefined) {
            throw "Provider is undefined"
        }

        console.log("Listening to event")
        this.provider.on(this.filterLog, async (log) => {
            console.log(log)
            if (log !== undefined) {
                const txReceipt = await this.provider.getTransactionReceipt(
                    log.transactionHash
                )
                this.webhook.sendMessageToUser(
                    JSON.stringify(log.transactionHash)
                )
                const logs = txReceipt.logs
                for (const bot of this.bots) {
                    for (const log of logs) {
                        if (log.topics[0] === this.joeFlatLaunchpegTopics) {
                            let events = this.iface.parseLog(log)
                            //@ts-ignore
                            const initializedEvent: FlatJoeInitializedEvent =
                                events.args
                            console.log(`--Event found--`)
                            console.log(
                                `Public listing start at ${initializedEvent.publicSaleStartTime.toNumber()}`
                            )
                            console.log(
                                `Minting price ${initializedEvent.salePrice.toNumber()} AVAX`
                            )
                            if (
                                initializedEvent.salePrice.eq(BigNumber.from(0))
                            ) {
                                bot.mintFreeFlatJoePeg(
                                    initializedEvent.publicSaleStartTime.toNumber(),
                                    txReceipt.to
                                )
                            }
                        }
                    }
                }
            }
        })
        this.provider.on("block", (blockNumber) => {
            console.log(`Current blocknumber ${blockNumber}`)
        })
    }

    async getLastFlatLaunchpeg() {
        let currentBlock: number = await this.provider.getBlockNumber()
        let pastBlock: number = currentBlock - 2000
        let isEventFound = false

        while (!isEventFound) {
            console.log(
                `Checking the latest listing Event from block ${currentBlock}`
            )
            // max query set data is 2048 (avax node)
            // max query set data is 2000 (moralis node)
            const getSaleEvent = await this.provider.getLogs({
                fromBlock: pastBlock,
                toBlock: currentBlock,
                ...this.filterLog,
            })
            console.log(getSaleEvent)
            if (getSaleEvent.length === 0) {
                currentBlock = pastBlock
                pastBlock -= 2000
            } else {
                const txReceipt = await this.provider.getTransactionReceipt(
                    getSaleEvent[0].transactionHash
                )
                console.log("TXRECEIPT", txReceipt)
                await this.webhook.sendMessageToUser(
                    JSON.stringify(getSaleEvent),
                    getSaleEvent[0].transactionHash
                )
                isEventFound = true
            }
        }
    }
}
