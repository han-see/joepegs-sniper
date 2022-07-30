import { Provider } from "@ethersproject/providers"
import { BigNumber, Contract, Wallet } from "ethers"
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
            console.error(errorMessage)
            this.webhook.sendMessageToUser(errorMessage)
        }

        if (contract !== undefined) {
            // this is to send the tx earlier to offset the network latency.
            // we're gonna send tx every 1 sec with different nonce to different providers
            const timediff = mintTime * 1000 - new Date().getTime() - 6
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
                console.log(`Tx generated: ${this.signedTxs[0]}`)
                this.webhook.sendInfoMessage(`Tx preparation completed`)
            } catch (err) {
                console.log(err)
                this.webhook.sendMessageToUser(
                    `Error during creating tx: ${err}`
                )
            }
            if (timediff > 0) {
                setTimeout(
                    async function (
                        webhook: Webhook,
                        providers: Provider[],
                        signedTxs: string[]
                    ) {
                        webhook.sendInfoMessage(
                            "Waiting to send transaction before the mint is open"
                        )
                        for (let signedTx of signedTxs) {
                            for (let provider of providers) {
                                const tx = provider
                                    .sendTransaction(signedTx)
                                    .then((txResponse) => {
                                        txResponse.wait(1).then((txReceipt) => {
                                            if (txReceipt !== undefined) {
                                                webhook.sendMessageToUser(
                                                    `MINT SUCCESS on tries number`,
                                                    JSON.stringify(
                                                        txReceipt.transactionHash
                                                    )
                                                )
                                                console.log(txReceipt)
                                                return
                                            }
                                        })
                                    })
                                    .catch((err) => {
                                        webhook.sendInfoMessage(
                                            `Tx failed ${err}`
                                        )
                                    })
                            }
                            // sleep for 1s before sending the next tx
                            sleep(1000)
                        }
                    },
                    timediff,
                    this.webhook,
                    this.providers,
                    this.signedTxs
                )
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
