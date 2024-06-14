
export interface RPCResponse<T> {
    jsonrpc: string
    result: T
    id: number
    error: {
        code: number
        message: string
        data: string
    }
}