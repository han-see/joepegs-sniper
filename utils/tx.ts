import { BigNumber, Wallet } from "ethers"
import {
    Interface,
    parseEther,
    parseUnits,
    UnsignedTransaction,
} from "ethers/lib/utils"

export async function createSignedTx(
    account: Wallet,
    hexData: string,
    contractAddress: string,
    value: string
): Promise<string> {
    const walletNonce = await account.getTransactionCount()
    const chainId = await account.getChainId()
    const gasLimit = BigNumber.from(400000)
    const maxFeePerGas = parseUnits("5000", "gwei")
    const maxPriorityFeePerGas = BigNumber.from(100)

    const unSignedTx: UnsignedTransaction = {
        to: contractAddress,
        nonce: walletNonce,
        gasLimit: gasLimit,
        maxFeePerGas: maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        data: hexData,
        value: parseEther(value),
        chainId: chainId,
        type: 2,
    }

    // @ts-ignore
    const signedTx = await account.signTransaction(unSignedTx)

    return signedTx
}

export async function createTxData(
    abi: any,
    functionCall: string,
    args: any[]
) {
    const iface = new Interface(abi)
    return iface.encodeFunctionData(functionCall, args)
}
