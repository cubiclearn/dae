-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('ADMIN', 'DISCIPULUS', 'MAGISTER', 'OTHER');

-- CreateTable
CREATE TABLE "Account" (
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "Course" (
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "symbol" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT NOT NULL DEFAULT '',
    "website_url" TEXT NOT NULL DEFAULT '',
    "media_channel" TEXT NOT NULL DEFAULT '',
    "ipfs_metadata" TEXT NOT NULL DEFAULT '',
    "timestamp" INTEGER NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "karma_access_control_address" TEXT NOT NULL,
    "snapshot_space_ens" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Course_pkey" PRIMARY KEY ("address","chain_id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "ipfs_url" TEXT NOT NULL,
    "ipfs_cid" TEXT NOT NULL,
    "type" "CredentialType" NOT NULL,
    "course_address" TEXT NOT NULL,
    "course_chain_id" INTEGER NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCredentials" (
    "course_address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "user_address" TEXT NOT NULL,
    "credential_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "discord_handle" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "UserCredentials_pkey" PRIMARY KEY ("course_address","user_address","credential_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Credential_course_address_ipfs_cid_key" ON "Credential"("course_address", "ipfs_cid");

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_course_address_course_chain_id_fkey" FOREIGN KEY ("course_address", "course_chain_id") REFERENCES "Course"("address", "chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCredentials" ADD CONSTRAINT "UserCredentials_course_address_chain_id_fkey" FOREIGN KEY ("course_address", "chain_id") REFERENCES "Course"("address", "chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCredentials" ADD CONSTRAINT "UserCredentials_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "Credential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
