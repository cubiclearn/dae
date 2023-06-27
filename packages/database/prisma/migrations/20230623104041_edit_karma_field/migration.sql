/*
  Warnings:

  - You are about to drop the column `karmaAccessControlAddress` on the `Course` table. All the data in the column will be lost.
  - Added the required column `karma_access_control_address` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "karmaAccessControlAddress",
ADD COLUMN     "karma_access_control_address" TEXT NOT NULL;
