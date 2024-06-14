

export interface zks_getBlockDetailsResult {
    number: number
    l1BatchNumber: number
    timestamp: number
    l1TxCount: number
    l2TxCount: number
    rootHash: string
    status: string
    commitTxHash: string
    committedAt: string
    proveTxHash: string
    provenAt: string
    executeTxHash: string
    executedAt: string
    l1GasPrice: number
    l2FairGasPrice: number
    baseSystemContractsHashes: BaseSystemContractsHashes
    operatorAddress: string
    protocolVersion: string
}

export interface BaseSystemContractsHashes {
    bootloader: string
    default_aa: string
}
