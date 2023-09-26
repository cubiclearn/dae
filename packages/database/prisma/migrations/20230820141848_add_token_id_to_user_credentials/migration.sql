/*
  Warnings:

  - A unique constraint covering the columns `[course_address,token_id]` on the table `UserCredentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token_id` to the `UserCredentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserCredentials" ADD COLUMN     "token_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserCredentials_course_address_token_id_key" ON "UserCredentials"("course_address", "token_id");
