import { Provider } from "@ethersproject/providers"
import { BigNumber, Contract, Wallet } from "ethers"
import { Logger } from "tslog"
import {
    createSignedTxs,
    createTxData,
    isContractValid,
    sleep,
} from "../utils/web3.service"
import { Webhook } from "../utils/webhook.service"
import { FlatLaunchpegABI } from "../web3"
import { IMintBot } from "./interfaces/mint-bot.interface"

export class MintBot implements IMintBot {
    private log = new Logger()
    private account: Wallet
    private webhook: Webhook
    private providers: Provider[]
    private signedTxs: string[] = []
    private flatLaunchpeg = FlatLaunchpegABI
    private mintTries = 5

    constructor(account: Wallet, webhook: Webhook, providers: Provider[]) {
        this.account = account
        this.webhook = webhook
        this.providers = providers
    }

    async mintFreeFlatJoePeg(mintTime: number, contractAddress: string) {
        const contract = new Contract(
            contractAddress,
            this.flatLaunchpeg,
            this.account
        )

        if (!(await isContractValid(contract, contractAddress))) {
            const errorMessage =
                "This is probably a wrong contract address. Please check it again"
            this.log.error(errorMessage)
            this.webhook.sendMessageToUser(errorMessage)
        }

        if (contract !== undefined) {
            // this is to send the tx earlier to offset the network latency.
            // we're gonna send tx every 1 sec with different nonce to different providers
            const timediff = mintTime * 1000 - Date.now() - 6000
            // amount of nft to mint
            const args = [BigNumber.from(1)]
            try {
                const txData = await createTxData(
                    this.flatLaunchpeg,
                    "publicSaleMint",
                    args
                )
                this.signedTxs = await createSignedTxs(
                    this.account,
                    txData,
                    contractAddress,
                    "0",
                    this.mintTries
                )
                this.log.info(`Tx generated: ${this.signedTxs[0]}`)
                this.webhook.sendInfoMessage(`Tx preparation completed`)
            } catch (err) {
                this.log.error(err)
                this.webhook.sendMessageToUser(
                    `Error during creating tx: ${err}`
                )
            }
            if (timediff > 0) {
                this.webhook.sendInfoMessage(
                    "Waiting to send transaction before the mint is open"
                )
                this.log.debug(timediff)
                await sleep(timediff)
                for (const signedTx of this.signedTxs) {
                    for (const provider of this.providers) {
                        this.log.info(`Sending tx`)
                        const tx = provider
                            .sendTransaction(signedTx)
                            .then((txResponse) => {
                                txResponse
                                    .wait(1)
                                    .then((txReceipt) => {
                                        if (txReceipt !== undefined) {
                                            this.webhook.sendMessageToUser(
                                                `MINT SUCCESS on tries number`,
                                                JSON.stringify(
                                                    txReceipt.transactionHash
                                                )
                                            )
                                            this.log.info(txReceipt)
                                            return
                                        }
                                    })
                                    .catch((error) => {
                                        this.log.error(error)
                                        this.webhook.sendInfoMessage(
                                            `Tx failed ${error}`
                                        )
                                    })
                            })
                            .catch((err) => {
                                this.log.error(err)
                                this.webhook.sendInfoMessage(`Tx failed ${err}`)
                            })
                    }
                    // sleep for 1s before sending the next tx
                    await sleep(1000)
                }
            } else {
                this.webhook.sendMessageToUser(
                    "Timediff is wrong. Please check the contract"
                )
            }
        } else {
            this.webhook.sendMessageToUser("Error during contract initiation")
        }
    }
}
