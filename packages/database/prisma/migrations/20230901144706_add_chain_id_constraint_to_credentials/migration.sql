/*
  Warnings:

  - The primary key for the `Credential` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserCredentials` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[user_address,course_address,credential_cid,chain_id]` on the table `UserCredentials` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "UserCredentials" DROP CONSTRAINT "UserCredentials_credential_cid_course_address_fkey";

-- DropIndex
DROP INDEX "UserCredentials_user_address_course_address_credential_cid_key";

-- AlterTable
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_pkey",
ADD CONSTRAINT "Credential_pkey" PRIMARY KEY ("course_address", "course_chain_id", "ipfs_cid");

-- AlterTable
ALTER TABLE "UserCredentials" DROP CONSTRAINT "UserCredentials_pkey",
ADD CONSTRAINT "UserCredentials_pkey" PRIMARY KEY ("user_address", "course_address", "token_id", "chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserCredentials_user_address_course_address_credential_cid__key" ON "UserCredentials"("user_address", "course_address", "credential_cid", "chain_id");

-- AddForeignKey
ALTER TABLE "UserCredentials" ADD CONSTRAINT "UserCredentials_credential_cid_course_address_chain_id_fkey" FOREIGN KEY ("credential_cid", "course_address", "chain_id") REFERENCES "Credential"("ipfs_cid", "course_address", "course_chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;
