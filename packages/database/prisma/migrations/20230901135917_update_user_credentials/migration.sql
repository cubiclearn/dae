/*
  Warnings:

  - The primary key for the `Credential` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Credential` table. All the data in the column will be lost.
  - The primary key for the `UserCredentials` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `credential_id` on the `UserCredentials` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_address,course_address,credential_cid]` on the table `UserCredentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `credential_cid` to the `UserCredentials` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserCredentials" DROP CONSTRAINT "UserCredentials_credential_id_fkey";

-- DropIndex
DROP INDEX "Credential_course_address_ipfs_cid_key";

-- DropIndex
DROP INDEX "UserCredentials_user_address_credential_id_key";

-- AlterTable
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Credential_pkey" PRIMARY KEY ("course_address", "ipfs_cid");

-- AlterTable
ALTER TABLE "UserCredentials" DROP CONSTRAINT "UserCredentials_pkey",
DROP COLUMN "credential_id",
ADD COLUMN     "credential_cid" TEXT NOT NULL,
ADD CONSTRAINT "UserCredentials_pkey" PRIMARY KEY ("user_address", "course_address", "token_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserCredentials_user_address_course_address_credential_cid_key" ON "UserCredentials"("user_address", "course_address", "credential_cid");

-- AddForeignKey
ALTER TABLE "UserCredentials" ADD CONSTRAINT "UserCredentials_credential_cid_course_address_fkey" FOREIGN KEY ("credential_cid", "course_address") REFERENCES "Credential"("ipfs_cid", "course_address") ON DELETE RESTRICT ON UPDATE CASCADE;
