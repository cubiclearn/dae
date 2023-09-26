/*
  Warnings:

  - The primary key for the `UserCredentials` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "UserCredentials_course_address_token_id_key";

-- AlterTable
ALTER TABLE "UserCredentials" DROP CONSTRAINT "UserCredentials_pkey",
ADD CONSTRAINT "UserCredentials_pkey" PRIMARY KEY ("course_address", "token_id");
