


export interface eth_getBlockByNumberResult {
    hash: string
    parentHash: string
    sha3Uncles: string
    miner: string
    stateRoot: string
    transactionsRoot: string
    receiptsRoot: string
    number: string
    l1BatchNumber: string
    gasUsed: string
    gasLimit: string
    baseFeePerGas: string
    extraData: string
    logsBloom: string
    timestamp: string
    l1BatchTimestamp: string
    difficulty: string
    totalDifficulty: string
    sealFields: any[]
    uncles: any[]
    transactions: string[]
    size: string
    mixHash: string
    nonce: string
  }