import { BigNumber, Contract, Wallet } from "ethers"
import {
    Interface,
    parseEther,
    parseUnits,
    UnsignedTransaction,
} from "ethers/lib/utils"
import { promisify } from "util"

export async function createSignedTxs(
    account: Wallet,
    hexData: string,
    contractAddress: string,
    value: string,
    txAmount: number
): Promise<string[]> {
    const signedTxs: string[] = []
    let walletNonce = await account.getTransactionCount()
    const chainId = await account.getChainId()
    const gasLimit = BigNumber.from(400000)
    const maxFeePerGas = parseUnits("5000", "gwei")
    const maxPriorityFeePerGas = BigNumber.from(100)

    for (let i = 0; i < txAmount; i++) {
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
        signedTxs.push(signedTx)
        walletNonce++
    }

    return signedTxs
}

export async function createTxData(
    abi: any,
    functionCall: string,
    args: any[]
) {
    const iface = new Interface(abi)
    return iface.encodeFunctionData(functionCall, args)
}

export const isContractValid = async (
    contract: Contract,
    contractAddress: string
): Promise<boolean> => {
    return (await contract.provider.getCode(contractAddress)) != undefined
}

export const sleep = promisify(setTimeout)
