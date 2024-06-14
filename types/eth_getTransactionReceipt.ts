

export interface eth_getTransactionReceiptResult {
    blockHash: string
    blockNumber: string
    contractAddress: any
    cumulativeGasUsed: string
    effectiveGasPrice: string
    from: string
    gasUsed: string
    logs: Log[]
    logsBloom: string
    status: string
    to: string
    transactionHash: string
    transactionIndex: string
    type: string
  }
  
  export interface Log {
    address: string
    topics: string[]
    data: string
    blockNumber: string
    transactionHash: string
    transactionIndex: string
    blockHash: string
    logIndex: string
    removed: boolean
  }
  