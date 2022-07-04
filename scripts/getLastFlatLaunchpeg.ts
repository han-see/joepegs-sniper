import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "hardhat";
import { Webhook } from "../commons/Webhook";
import { IFlatLaunchpegABI } from "../constants/index";

export async function getLastFlatLaunchpeg(
    provider: JsonRpcProvider,
    webhook: Webhook
) {
    let currentBlock: number = await provider.getBlockNumber();
    let pastBlock: number = currentBlock - 2000;
    let isEventFound = false;

    // Initialized event from the flatLaunchPeg
    const filterLog = {
        topics: [
            ethers.utils.id("Initialized(uint256,uint256,uint256,uint256)"),
        ],
    };

    while (!isEventFound) {
        console.log(
            `Checking the latest listing Event from block ${currentBlock}`
        );
        // max query set data is 2048 (avax node)
        // max query set data is 2000 (moralis node)
        const getSaleEvent = await provider.getLogs({
            fromBlock: pastBlock,
            toBlock: currentBlock,
            ...filterLog,
        });
        console.log(getSaleEvent);
        if (getSaleEvent.length === 0) {
            currentBlock = pastBlock;
            pastBlock -= 2000;
        } else {
            await webhook.sendMessageToUser(
                JSON.stringify(getSaleEvent),
                getSaleEvent[0].transactionHash
            );
            isEventFound = true;
        }
    }
}

export async function listenToListingEvent(
    provider: JsonRpcProvider,
    webhook: Webhook
) {
    // Initialized event from the flatLaunchPeg
    const filterLog = {
        topics: [
            ethers.utils.id("Initialized(uint256,uint256,uint256,uint256)"),
        ],
    };
    console.log("Listening to event");
    while (true) {
        provider.on(filterLog, (listingEvent) => {
            console.log(listingEvent);
            webhook.sendMessageToUser(
                JSON.stringify(listingEvent),
                listingEvent[0].transactionHash
            );
        });
        /* provider.on("blockNumber", (blockNumber) => {
            console.log(`Current blocknumber ${blockNumber}`);
        }); */
    }
}
