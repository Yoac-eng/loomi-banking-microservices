/*
  Warnings:

  - A unique constraint covering the columns `[agency,account_number]` on the table `banking_details` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "banking_details_account_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "banking_details_agency_account_number_key" ON "banking_details"("agency", "account_number");
