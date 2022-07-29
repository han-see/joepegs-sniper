import { BigNumber } from "ethers/lib/ethers"

export interface FlatJoeInitializedEvent {
    allowlistStartTime: BigNumber
    publicSaleStartTime: BigNumber
    allowlistPrice: BigNumber
    salePrice: BigNumber
}
