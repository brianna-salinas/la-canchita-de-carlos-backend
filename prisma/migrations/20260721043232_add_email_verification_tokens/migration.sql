-- AlterEnum
ALTER TYPE "user_status_enum" ADD VALUE 'PENDING_VERIFICATION';

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_ntf_user_id_fkey";

-- DropForeignKey
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_prt_user_id_fkey";

-- DropForeignKey
ALTER TABLE "schedule_blocks" DROP CONSTRAINT "schedule_blocks_blo_court_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_ses_user_id_fkey";

-- DropIndex
DROP INDEX "ix_bookings_court_date";

-- DropIndex
DROP INDEX "ix_bookings_customer";

-- DropIndex
DROP INDEX "ix_bookings_date";

-- DropIndex
DROP INDEX "ix_bookings_payment_status";

-- DropIndex
DROP INDEX "ix_bookings_series";

-- DropIndex
DROP INDEX "ix_notifications_created_at";

-- DropIndex
DROP INDEX "ix_notifications_user_read";

-- DropIndex
DROP INDEX "ix_password_reset_tokens_user";

-- DropIndex
DROP INDEX "ix_schedule_blocks_court_date";

-- DropIndex
DROP INDEX "ix_sessions_user";

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "boo_updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "courts" ALTER COLUMN "cou_updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "cus_updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "usu_updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "evt_id" SERIAL NOT NULL,
    "evt_user_id" INTEGER NOT NULL,
    "evt_token_hash" VARCHAR(255) NOT NULL,
    "evt_expires_at" TIMESTAMPTZ NOT NULL,
    "evt_used" BOOLEAN NOT NULL DEFAULT false,
    "evt_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("evt_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_evt_token_hash_key" ON "email_verification_tokens"("evt_token_hash");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_ses_user_id_fkey" FOREIGN KEY ("ses_user_id") REFERENCES "users"("usu_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_prt_user_id_fkey" FOREIGN KEY ("prt_user_id") REFERENCES "users"("usu_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_evt_user_id_fkey" FOREIGN KEY ("evt_user_id") REFERENCES "users"("usu_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_blo_court_id_fkey" FOREIGN KEY ("blo_court_id") REFERENCES "courts"("cou_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ntf_user_id_fkey" FOREIGN KEY ("ntf_user_id") REFERENCES "users"("usu_id") ON DELETE SET NULL ON UPDATE CASCADE;
