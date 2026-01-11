/*
  Warnings:

  - Added the required column `account_type` to the `banking_details` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CHECKING', 'SAVINGS');

-- AlterTable
ALTER TABLE "banking_details" ADD COLUMN     "account_type" "AccountType" NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "client_audit_logs" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ledger_entries" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;
