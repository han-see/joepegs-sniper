import { Webhook } from "../commons/Webhook"
import { Contract, Wallet } from "ethers"
import { FlatLaunchpegABI } from "../constants"

export interface IMintBot {
    mintFreeFlatJoePeg: (mintTime: number, contractAddress: string) => void
}

export class MintBot implements IMintBot {
    private account: Wallet
    private webhook: Webhook
    private flatLaunchpeg = FlatLaunchpegABI

    constructor(account: Wallet, webhook: Webhook) {
        this.account = account
        this.webhook = webhook
    }

    mintFreeFlatJoePeg(mintTime: number, contractAddress: string) {
        const contract = new Contract(
            contractAddress,
            this.flatLaunchpeg,
            this.account
        )
        if (contract !== undefined) {
            const timediff = mintTime * 1000 - new Date().getTime()
            console.log(timediff)
            console.log(new Date().getTime())
            if (timediff > 0) {
                setTimeout(
                    async function (webhook: Webhook) {
                        for (let i = 0; i < 2; i++) {
                            const tx = await contract.publicSaleMint(1)
                            const txReceipt = await tx.wait()
                            if (txReceipt !== undefined) {
                                webhook.sendMessageToUser(
                                    `MINT SUCCESS on tries number ${
                                        i + 1
                                    } ${JSON.stringify(
                                        txReceipt.transactionHash
                                    )}`
                                )
                                console.log(txReceipt)
                                return
                            }
                        }
                        webhook.sendMessageToUser(
                            "TX failed to mint after 2 tries"
                        )
                    },
                    timediff,
                    this.webhook
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
