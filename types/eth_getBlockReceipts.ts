

export interface eth_getBlockReceiptsResult {
    transactionHash: string
    transactionIndex: string
    blockHash: string
    blockNumber: string
    l1BatchTxIndex: string
    l1BatchNumber: string
    from: string
    to: string
    cumulativeGasUsed: string
    gasUsed: string
    contractAddress: any
    logs: Log[]
    l2ToL1Logs: any[]
    status: string
    root: string
    logsBloom: string
    type: string
    effectiveGasPrice: string
  }
  
  export interface Log {
    address: string
    topics: string[]
    data: string
    blockHash: string
    blockNumber: string
    l1BatchNumber: string
    transactionHash: string
    transactionIndex: string
    logIndex: string
    transactionLogIndex: string
    logType: any
    removed: boolean
  }
  