-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "sender_user_id" UUID NOT NULL,
    "receiver_user_id" UUID NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "description" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "idempotency_key" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_lifecycle_logs" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "old_status" "TransactionStatus",
    "new_status" "TransactionStatus" NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_lifecycle_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_idempotency_key_key" ON "transactions"("idempotency_key");

-- CreateIndex
CREATE INDEX "idx_transactions_sender_user_id" ON "transactions"("sender_user_id");

-- CreateIndex
CREATE INDEX "idx_transactions_receiver_user_id" ON "transactions"("receiver_user_id");

-- CreateIndex
CREATE INDEX "idx_transactions_status" ON "transactions"("status");

-- AddForeignKey
ALTER TABLE "transaction_lifecycle_logs" ADD CONSTRAINT "transaction_lifecycle_logs_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
