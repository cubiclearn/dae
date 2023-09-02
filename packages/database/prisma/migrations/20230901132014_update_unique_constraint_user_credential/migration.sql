/*
  Warnings:

  - A unique constraint covering the columns `[user_address,credential_id]` on the table `UserCredentials` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserCredentials_user_address_credential_id_key" ON "UserCredentials"("user_address", "credential_id");
