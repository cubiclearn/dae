-- CreateTable
CREATE TABLE "TransactionsVerifications" (
    "transaction_hash" TEXT NOT NULL,
    "user_address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "action" TEXT NOT NULL,

    CONSTRAINT "TransactionsVerifications_pkey" PRIMARY KEY ("transaction_hash")
);
