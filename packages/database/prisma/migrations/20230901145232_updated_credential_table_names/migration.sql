/*
  Warnings:

  - The primary key for the `UserCredentials` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chain_id` on the `UserCredentials` table. All the data in the column will be lost.
  - You are about to drop the column `credential_cid` on the `UserCredentials` table. All the data in the column will be lost.
  - You are about to drop the column `discord_handle` on the `UserCredentials` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `UserCredentials` table. All the data in the column will be lost.
  - You are about to drop the column `token_id` on the `UserCredentials` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_address,course_address,credential_ipfs_cid,course_chain_id]` on the table `UserCredentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `course_chain_id` to the `UserCredentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credential_ipfs_cid` to the `UserCredentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credential_token_id` to the `UserCredentials` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserCredentials" DROP CONSTRAINT "UserCredentials_course_address_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "UserCredentials" DROP CONSTRAINT "UserCredentials_credential_cid_course_address_chain_id_fkey";

-- DropIndex
DROP INDEX "UserCredentials_user_address_course_address_credential_cid__key";

-- AlterTable
ALTER TABLE "UserCredentials" DROP CONSTRAINT "UserCredentials_pkey",
DROP COLUMN "chain_id",
DROP COLUMN "credential_cid",
DROP COLUMN "discord_handle",
DROP COLUMN "email",
DROP COLUMN "token_id",
ADD COLUMN     "course_chain_id" INTEGER NOT NULL,
ADD COLUMN     "credential_ipfs_cid" TEXT NOT NULL,
ADD COLUMN     "credential_token_id" INTEGER NOT NULL,
ADD COLUMN     "user_discord_handle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "user_email" TEXT NOT NULL DEFAULT '',
ADD CONSTRAINT "UserCredentials_pkey" PRIMARY KEY ("user_address", "course_address", "credential_token_id", "course_chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserCredentials_user_address_course_address_credential_ipfs_key" ON "UserCredentials"("user_address", "course_address", "credential_ipfs_cid", "course_chain_id");

-- AddForeignKey
ALTER TABLE "UserCredentials" ADD CONSTRAINT "UserCredentials_course_address_course_chain_id_fkey" FOREIGN KEY ("course_address", "course_chain_id") REFERENCES "Course"("address", "chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCredentials" ADD CONSTRAINT "UserCredentials_credential_ipfs_cid_course_address_course__fkey" FOREIGN KEY ("credential_ipfs_cid", "course_address", "course_chain_id") REFERENCES "Credential"("ipfs_cid", "course_address", "course_chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;
