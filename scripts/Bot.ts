import { Provider } from "@ethersproject/providers"
import { BigNumber, Contract, Wallet } from "ethers"
import { Webhook } from "../commons/Webhook"
import { FlatLaunchpegABI } from "../constants"
import { createSignedTx, createTxData } from "../utils/tx"

export interface IMintBot {
    mintFreeFlatJoePeg: (mintTime: number, contractAddress: string) => void
}

export class MintBot implements IMintBot {
    private account: Wallet
    private webhook: Webhook
    private provider: Provider
    private signedTx = ""
    private flatLaunchpeg = FlatLaunchpegABI

    constructor(account: Wallet, webhook: Webhook, provider: Provider) {
        this.account = account
        this.webhook = webhook
        this.provider = provider
    }

    async mintFreeFlatJoePeg(mintTime: number, contractAddress: string) {
        const contract = new Contract(
            contractAddress,
            this.flatLaunchpeg,
            this.account
        )

        contract.provider.getCode(contractAddress).catch((err) => {
            const errorMessage =
                "This is probably a wrong contract address. Please check it again"
            console.error(errorMessage)
            this.webhook.sendMessageToUser(errorMessage)
            console.log(err)
        })

        if (contract !== undefined) {
            // try -1 to offset network
            const timediff = mintTime * 1000 - new Date().getTime() - 1
            // amount of nft to mint
            const args = [BigNumber.from(1)]
            try {
                const txData = await createTxData(
                    this.flatLaunchpeg,
                    "publicSaleMint",
                    args
                )
                this.signedTx = await createSignedTx(
                    this.account,
                    txData,
                    contractAddress,
                    "0"
                )
                console.log(`Tx generated: ${this.signedTx}`)
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
                        provider: Provider,
                        signedTx: string
                    ) {
                        webhook.sendInfoMessage(
                            "Waiting to send transaction before the mint is open"
                        )
                        for (let i = 0; i < 3; i++) {
                            const tx = provider
                                .sendTransaction(signedTx)
                                .then((txResponse) => {
                                    txResponse.wait(1).then((txReceipt) => {
                                        if (txReceipt !== undefined) {
                                            webhook.sendMessageToUser(
                                                `MINT SUCCESS on tries number ${
                                                    i + 1
                                                }`,
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
                                    webhook.sendInfoMessage(`Tx failed ${err}`)
                                })
                        }
                    },
                    timediff,
                    this.webhook,
                    this.provider,
                    this.signedTx
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
