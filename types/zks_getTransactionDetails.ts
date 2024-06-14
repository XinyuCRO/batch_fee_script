export interface zks_getTransactionDetailsResult {
    isL1Originated: boolean
    status: string
    fee: string
    gasPerPubdata: string
    initiatorAddress: string
    receivedAt: string
    ethCommitTxHash: string
    ethProveTxHash: string
    ethExecuteTxHash: string

    hash: string
  }
  