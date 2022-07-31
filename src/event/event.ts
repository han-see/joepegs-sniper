import { JsonRpcProvider } from "@ethersproject/providers"
import { BigNumber, ethers } from "ethers"
import { initiateBot } from "../mint-bot/mint-bot.service"
import { Webhook } from "../utils/webhook.service"
import { FlatLaunchpegABI } from "../web3"
import { FlatJoeInitializedEvent } from "./interfaces/event.interface"

export class EventListener {
    private provider: JsonRpcProvider
    private webhook: Webhook
    private rpcUrls: string[]
    private privateKeys: string[]
    private joeFlatLaunchpegTopics: string = ethers.utils.id(
        "Initialized(uint256,uint256,uint256,uint256)"
    )
    private flatLaunchpeg = FlatLaunchpegABI
    private iface = new ethers.utils.Interface(this.flatLaunchpeg)

    // Initialized event from the flatLaunchPeg
    private filterLog = {
        topics: [this.joeFlatLaunchpegTopics],
    }

    constructor(rpcUrls: string[], webhook: Webhook, privateKeys: string[]) {
        this.provider = new JsonRpcProvider(rpcUrls[0])
        this.webhook = webhook
        this.privateKeys = privateKeys
        this.rpcUrls = rpcUrls
    }

    async listenToEventFromRpcUrl() {
        if (this.provider === undefined) {
            throw "Provider is undefined"
        }

        console.log("Listening to event")
        this.provider.on(this.filterLog, async (log) => {
            console.log(log)
            if (log !== undefined) {
                this.webhook.sendMessageToUser(
                    "Event found",
                    log.transactionHash
                )
                const bots = await initiateBot(this.rpcUrls, this.privateKeys)
                const events = this.iface.parseLog(log)
                /* eslint @typescript-eslint/ban-ts-comment: "off" */
                // @ts-ignore
                const initializedEvent = events.args as FlatJoeInitializedEvent
                const info = `Flat Joe event found. Public listing start at ${initializedEvent.publicSaleStartTime.toNumber()}. Minting price ${initializedEvent.salePrice.toNumber()} AVAX`
                this.webhook.sendInfoMessage(info)
                console.log(info)
                if (initializedEvent.salePrice.eq(BigNumber.from(0)))
                    for (const i in bots) {
                        {
                            const saleTime =
                                initializedEvent.publicSaleStartTime.toNumber()
                            const contractAddress = log.address
                            this.webhook.sendInfoMessage(`Initiating Bot ${i}:
                            Contract Address: ${contractAddress}
                            Sale Time: ${saleTime}`)
                            bots[i].mintFreeFlatJoePeg(
                                saleTime,
                                contractAddress
                            )
                        }
                    }
            }
        })
        this.provider.on("block", (blockNumber) => {
            if (parseInt(blockNumber) % 5000 == 0) {
                console.log(`Current blocknumber ${blockNumber}`)
            }
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
