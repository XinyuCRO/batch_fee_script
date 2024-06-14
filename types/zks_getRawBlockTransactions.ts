export interface zks_getRawBlockTransactionsResult {
    common_data: CommonData
    execute: Execute
    received_timestamp_ms: number
    raw_bytes: string
}

export interface CommonData {
    L2?: L2
    L1?: L1
}

export interface L1 {
    sender: string
    serialId: number
    deadlineBlock: number
    layer2TipFee: string
    fullFee: string
    maxFeePerGas: string
    gasLimit: string
    gasPerPubdataLimit: string
    opProcessingType: string
    priorityQueueType: string
    ethHash: string
    ethBlock: number
    canonicalTxHash: string
    toMint: string
    refundRecipient: string
  }

export interface L2 {
    nonce: number
    fee: Fee
    initiatorAddress: string
    signature: number[]
    transactionType: string
    input: Input
    paymasterParams: PaymasterParams
}

export interface Fee {
    gas_limit: string
    max_fee_per_gas: string
    max_priority_fee_per_gas: string
    gas_per_pubdata_limit: string
}

export interface Input {
    hash: string
    data: number[]
}

export interface PaymasterParams {
    paymaster: string
    paymasterInput: any[]
}

export interface Execute {
    contractAddress: string
    calldata: string
    value: string
    factoryDeps: any
}
