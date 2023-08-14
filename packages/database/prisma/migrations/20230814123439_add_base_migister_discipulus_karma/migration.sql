/*
  Warnings:

  - Added the required column `discipulus_base_karma` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `magister_base_karma` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "discipulus_base_karma" INTEGER NOT NULL,
ADD COLUMN     "magister_base_karma" INTEGER NOT NULL;
