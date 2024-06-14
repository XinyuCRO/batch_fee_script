
import fs from 'fs';
import { BigNumber, ethers } from 'ethers';
import { eth_getBlockByNumber, eth_getBlockReceipts, eth_getTransactionReceipt, zks_L1BatchNumber, zks_getBlockDetails, zks_getL1BatchBlockRange, zks_getL1BatchDetails, zks_getRawBlockTransactions, zks_getTransactionDetails } from './api';
import { formatEther } from 'ethers/lib/utils';
import { PrismaClient } from '@prisma/client';

const getBlockFeeData = async (blockNumber: number) => {

	const receipts = await eth_getBlockReceipts(ethers.utils.hexlify(blockNumber), true);
	const totalFees = receipts.reduce((acc, receipt) => {
		const gasUsed = BigNumber.from(receipt.gasUsed);
		const gasPrice = BigNumber.from(receipt.effectiveGasPrice);
		return acc.add(gasUsed.mul(gasPrice));
	}, BigNumber.from(0));

	return {
		blockNumber,
		totalFees,
		receipts,
	}
}

const getL1FeeData = async (txHash: string) => {
	const receipt = await eth_getTransactionReceipt(txHash);
	const gasUsed = BigNumber.from(receipt.gasUsed);
	const gasPrice = BigNumber.from(receipt.effectiveGasPrice);

	return {
		txHash,
		gasUsed,
		gasPrice,
		totalFee: gasUsed.mul(gasPrice)
	}
}

const getBatchL1FeeData = async (batch: number) => {
	const batchDetail = await zks_getL1BatchDetails(batch);

	let totalBatchL1Fee = BigNumber.from(0);
	let commitFee = BigNumber.from(0);
	let executeFee = BigNumber.from(0);
	let proveFee = BigNumber.from(0);


	if (batchDetail.commitTxHash) {
		const { totalFee } = await getL1FeeData(batchDetail.commitTxHash);
		totalBatchL1Fee = totalBatchL1Fee.add(totalFee);
		commitFee = totalFee;
	}

	if (batchDetail.executeTxHash) {
		const { totalFee } = await getL1FeeData(batchDetail.executeTxHash);
		totalBatchL1Fee = totalBatchL1Fee.add(totalFee);
		executeFee = totalFee;
	}

	if (batchDetail.proveTxHash) {
		const { totalFee } = await getL1FeeData(batchDetail.proveTxHash);
		totalBatchL1Fee = totalBatchL1Fee.add(totalFee);
		proveFee = totalFee;
	}

	return {
		totalBatchL1Fee,
		commitFee,
		executeFee,
		proveFee,
		createdAt: batchDetail.timestamp,
	};
}

interface BatchData {
	batch: number;
	start_block: number;
	end_block: number;
	total_tx: number;
	l2_fee_collected: BigNumber;
	l1_commit_fee: BigNumber;
	l1_execute_fee: BigNumber;
	l1_prove_fee: BigNumber;
	created_at: number;
}

const getBatchFeeData = async (batch: number) => {
	const blockRangeResponse = await zks_getL1BatchBlockRange(batch);
	const start = parseInt(blockRangeResponse[0]);
	const end = parseInt(blockRangeResponse[1]);

	const blockRange = Array.from({ length: end - start + 1 }, (_, i) => start + i);

	const batchFeeData = await Promise.all([...blockRange.map((blockNumber) => getBlockFeeData(blockNumber))]);
	

	const l1Fee = await getBatchL1FeeData(batch);

	const batchTxCount = batchFeeData.reduce((acc, data) => acc + data.receipts.length, 0);
	const totalFeesInBatch = batchFeeData.reduce((acc, data) => acc.add(data.totalFees), BigNumber.from(0));

	const batchData: BatchData = {
		batch,
		start_block: start,
		end_block: end,
		total_tx: batchTxCount,
		l2_fee_collected: totalFeesInBatch,
		l1_commit_fee: l1Fee.commitFee,
		l1_execute_fee: l1Fee.executeFee,
		l1_prove_fee: l1Fee.proveFee,
		created_at: l1Fee.createdAt * 1000,
	};

	console.log(`Batch ${batch}, total block: ${blockRange.length}, total tx: ${batchTxCount},  L2 fees: ${ethers.utils.formatEther(totalFeesInBatch)} baseToken, `, "L1 fee: ", ethers.utils.formatEther(l1Fee.totalBatchL1Fee), "ETH");

	await prisma.batch.upsert({
		create: {
			batch: batchData.batch,
			startBlock: batchData.start_block,
			endBlock: batchData.end_block,
			totalTx: batchData.total_tx,
			l2FeeCollected: batchData.l2_fee_collected.toBigInt(),
			l1CommitFee: batchData.l1_commit_fee.toBigInt(),
			l1ExecuteFee: batchData.l1_execute_fee.toBigInt(),
			l1ProveFee: batchData.l1_prove_fee.toBigInt(),
			createdAt: new Date(batchData.created_at),
		},
		update: {
			batch: batchData.batch,
			startBlock: batchData.start_block,
			endBlock: batchData.end_block,
			totalTx: batchData.total_tx,
			l2FeeCollected: batchData.l2_fee_collected.toBigInt(),
			l1CommitFee: batchData.l1_commit_fee.toBigInt(),
			l1ExecuteFee: batchData.l1_execute_fee.toBigInt(),
			l1ProveFee: batchData.l1_prove_fee.toBigInt(),
			createdAt: new Date(batchData.created_at),
		},
		where: {
			batch: batchData.batch
		}
	})
}

let lastSeen = 0;

const prisma = new PrismaClient({
	log: ['info']
})

const tryFetch = async () => {

	const lastBatch = await zks_L1BatchNumber()
	const lastBatchNumber = parseInt(lastBatch, 16)
	console.log("Last batch: ", lastBatchNumber)

	const batchStart = 3000;
	const batchEnd = lastBatchNumber;

	const batches = Array.from({ length: batchEnd - batchStart + 1 }, (_, i) => batchStart + i);

	for (const batch of batches) {
		await getBatchFeeData(batch);
		lastSeen = batch;
	}

	if (lastSeen >= batchEnd) {
		console.log("Done");
		process.exit(0);
	}
}

function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

const main = async () => {
	// incase the rpc fails, retry automatically
	while (true) {
		try {
			await tryFetch();
		} catch (e) {
			console.log(e);
			await sleep(2000);
		}
	}
}


main();
