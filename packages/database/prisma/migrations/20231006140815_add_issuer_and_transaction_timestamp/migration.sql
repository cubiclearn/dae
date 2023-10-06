/*
  Warnings:

  - You are about to drop the `Transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "UserCredentials" ADD COLUMN     "issuer" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "Transactions";

-- CreateTable
CREATE TABLE "PendingTransactions" (
    "transaction_hash" TEXT NOT NULL,
    "user_address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,

    CONSTRAINT "PendingTransactions_pkey" PRIMARY KEY ("transaction_hash")
);
