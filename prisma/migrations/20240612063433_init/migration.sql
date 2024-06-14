-- CreateTable
CREATE TABLE "Batch" (
    "batch" INTEGER NOT NULL,
    "startBlock" INTEGER NOT NULL,
    "endBlock" INTEGER NOT NULL,
    "totalTx" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "l2FeeCollected" BIGINT NOT NULL,
    "l1CommitFee" BIGINT NOT NULL,
    "l1ExecuteFee" BIGINT NOT NULL,
    "l1ProveFee" BIGINT NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("batch")
);
