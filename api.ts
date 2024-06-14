import { createClient } from 'redis'; // v4
import { NotEmptyStorageValue, buildStorage, canStale } from 'axios-cache-interceptor';
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { RPCResponse } from './types';
import { zks_getL1BatchBlockRangeResult } from './types/zks_getL1BatchBlockRange';
import { zks_getRawBlockTransactionsResult } from './types/zks_getRawBlockTransactions';
import { zks_getBlockDetailsResult } from './types/zks_getBlockDetails';
import { zks_getTransactionDetailsResult } from './types/zks_getTransactionDetails';
import { eth_getTransactionReceiptResult } from './types/eth_getTransactionReceipt';
import { zks_getL1BatchDetailsResult } from './types/zks_getL1BatchDetails';
import { eth_getBlockByNumberResult } from './types/eth_getBlockByNumber';
import { ETH_SEPOLIA_L1_RPC_URL, ZKS_RPC_URL } from './keys';

const client = createClient({
	url: "redis://@127.0.0.1",
});

const redisStorage = buildStorage({
    async find(key: string) {
        if (!client.isOpen) await client.connect();
        const result = await client.get(`axios-cache:${key}`);
		if (!result) return null;
        return JSON.parse(result);
    },

    async set(key, value) {
        if (!client.isOpen) await client.connect();
        await client.set(`axios-cache:${key}`, JSON.stringify(value));
    },

    async remove(key) {
        if (!client.isOpen) await client.connect();
        await client.del(`axios-cache:${key}`);
    },
});

const axios = Axios.create();
const api = setupCache(axios, {
    // storage: redisStorage,
});

export const eth_getBlockReceipts = async (blockNumber: string, l2 = false) => {
	const method = "eth_getBlockReceipts";
	if (l2) {
		return await request_zks<eth_getTransactionReceiptResult[]>(method, [blockNumber]);
	}
	return await request_eth_l1<eth_getTransactionReceiptResult[]>(method, [blockNumber]);
}

export const eth_getTransactionReceipt = async (txHash: string, l2 = false) => {
	const method = "eth_getTransactionReceipt";
	if (l2) {
		return await request_zks<eth_getTransactionReceiptResult>(method, [txHash]);
	}
	return await request_eth_l1<eth_getTransactionReceiptResult>(method, [txHash]);
}

export const eth_getBlockByNumber = async (blockNumber: string, l2 = false) => {
	const method = "eth_getBlockByNumber";
	if (l2) {
		return await request_zks<eth_getBlockByNumberResult>(method, [blockNumber, false]);
	}
	return await request_eth_l1<eth_getBlockByNumberResult>(method, [blockNumber, false]);
}

export const zks_L1BatchNumber = async () => {
	const method = "zks_L1BatchNumber";
	return await request_zks<string>(method, []);
}

export const zks_getL1BatchDetails = async (batch: number) => {
	const method = "zks_getL1BatchDetails";

	// the result may change
	const result = await request_zks<zks_getL1BatchDetailsResult>(method, [batch], true);
	if (result.commitTxHash && result.proveTxHash && result.executeTxHash) {
		return result;
	}

	// need to refetch the result
	console.log(`Batch #${batch} are not complete, refetching...`)
	return await request_zks<zks_getL1BatchDetailsResult>(method, [batch], false);
}

export const zks_getTransactionDetails = async (txHash: string) => {
	const method = "zks_getTransactionDetails";
	const result = await request_zks<zks_getTransactionDetailsResult>(method, [txHash]);

	result.hash = txHash;

	return result
}

export const zks_getBlockDetails = async (blockNumber: number) => {
	const method = "zks_getBlockDetails";
	return await request_zks<zks_getBlockDetailsResult>(method, [blockNumber]);
}

export const zks_getL1BatchBlockRange = async (blockNumber: number) => {
	const method = "zks_getL1BatchBlockRange";
	return await request_zks<zks_getL1BatchBlockRangeResult>(method, [blockNumber]);
}

export const zks_getRawBlockTransactions = async (blockNumber: number) => {
	const method = "zks_getRawBlockTransactions";
	return await request_zks<zks_getRawBlockTransactionsResult[]>(method, [blockNumber]);
}

const request_eth_l1 = async <T>(method: string, params: any[]) => {
	return await requestRPC<T>(ETH_SEPOLIA_L1_RPC_URL, method, params);
}

const request_zks = async <T>(method: string, params: any[], useCache = true) => {
	return await requestRPC<T>(ZKS_RPC_URL, method, params, useCache);
}

const requestRPC = async <T>(RPC_ROOT: string, method: string, params: any[], useCache = true) => {
	const key = `${method}_${params.join('_')}`;
	if (useCache) {
		const cache = await getCached<T>(key);
		if (cache) {		
			return cache;
		}
	}

	const response = await axios<RPCResponse<T>>({
		"method": "POST",
		"url": RPC_ROOT,
		"headers": {
			"Content-Type": "application/json",
		},
		"data": {
			"jsonrpc": "2.0",
			"id": 1,
			"method": method,
			"params": params
		}
	})

	if (response.data.error) {
		const message = `${response.data.error.message}, ${response.data.error.data}`
		throw new Error(message);
	}

	const result = response.data.result;
	await saveCache(key, result);
	return result;
}

const getCached = async <T>(key: string) => {
	const cache = await api.storage.get(key);	
	if (cache && cache.state !== 'empty') {
		return cache as T;
	}
	return null;
}

const saveCache = async (key: string, value: any) => {
	if (value) {
		await api.storage.set(key, value);	
	}
}
