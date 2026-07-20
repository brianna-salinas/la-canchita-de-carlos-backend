-- CreateEnum
CREATE TYPE "user_status_enum" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "request_status_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "court_status_enum" AS ENUM ('ACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "customer_status_enum" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "booking_status_enum" AS ENUM ('BOOKED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "payment_status_enum" AS ENUM ('PENDING', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "booking_type_enum" AS ENUM ('SINGLE', 'MULTIDAY', 'RECURRING');

-- CreateEnum
CREATE TYPE "series_payment_mode_enum" AS ENUM ('INDIVIDUAL', 'LUMP_SUM');

-- CreateEnum
CREATE TYPE "notification_type_enum" AS ENUM ('ACCESS_REQUEST', 'PAYMENT_PENDING', 'NEW_BOOKING', 'BOOKING_CANCELLED', 'COURT_MAINTENANCE', 'GENERAL');

-- CreateTable
CREATE TABLE "users" (
    "usu_id" SERIAL NOT NULL,
    "usu_name" VARCHAR(150) NOT NULL,
    "usu_username" VARCHAR(60) NOT NULL,
    "usu_email" VARCHAR(150) NOT NULL,
    "usu_password_hash" VARCHAR(255) NOT NULL,
    "usu_is_owner" BOOLEAN NOT NULL DEFAULT false,
    "usu_status" "user_status_enum" NOT NULL DEFAULT 'ACTIVE',
    "usu_photo_url" TEXT,
    "usu_last_access" TIMESTAMPTZ,
    "usu_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usu_updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("usu_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "ses_id" SERIAL NOT NULL,
    "ses_user_id" INTEGER NOT NULL,
    "ses_token_hash" VARCHAR(255) NOT NULL,
    "ses_ip_address" VARCHAR(45),
    "ses_user_agent" TEXT,
    "ses_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ses_expires_at" TIMESTAMPTZ NOT NULL,
    "ses_revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("ses_id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "prt_id" SERIAL NOT NULL,
    "prt_user_id" INTEGER NOT NULL,
    "prt_token_hash" VARCHAR(255) NOT NULL,
    "prt_expires_at" TIMESTAMPTZ NOT NULL,
    "prt_used" BOOLEAN NOT NULL DEFAULT false,
    "prt_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("prt_id")
);

-- CreateTable
CREATE TABLE "access_requests" (
    "req_id" SERIAL NOT NULL,
    "req_name" VARCHAR(150) NOT NULL,
    "req_email" VARCHAR(150) NOT NULL,
    "req_phone" VARCHAR(30),
    "req_password_hash" VARCHAR(255) NOT NULL,
    "req_status" "request_status_enum" NOT NULL DEFAULT 'PENDING',
    "req_created_user_id" INTEGER,
    "req_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "req_resolved_at" TIMESTAMPTZ,

    CONSTRAINT "access_requests_pkey" PRIMARY KEY ("req_id")
);

-- CreateTable
CREATE TABLE "courts" (
    "cou_id" SERIAL NOT NULL,
    "cou_name" VARCHAR(100) NOT NULL,
    "cou_sport" VARCHAR(50) NOT NULL,
    "cou_surface" VARCHAR(80),
    "cou_price_per_hour" DECIMAL(10,2) NOT NULL,
    "cou_status" "court_status_enum" NOT NULL DEFAULT 'ACTIVE',
    "cou_enabled" BOOLEAN NOT NULL DEFAULT true,
    "cou_photo_url" TEXT,
    "cou_description" TEXT,
    "cou_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cou_updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "courts_pkey" PRIMARY KEY ("cou_id")
);

-- CreateTable
CREATE TABLE "schedule_blocks" (
    "blo_id" SERIAL NOT NULL,
    "blo_court_id" INTEGER NOT NULL,
    "blo_date" DATE NOT NULL,
    "blo_time" TIME NOT NULL,
    "blo_reason" VARCHAR(200),
    "blo_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_blocks_pkey" PRIMARY KEY ("blo_id")
);

-- CreateTable
CREATE TABLE "customers" (
    "cus_id" SERIAL NOT NULL,
    "cus_name" VARCHAR(150) NOT NULL,
    "cus_phone" VARCHAR(30) NOT NULL,
    "cus_document_number" VARCHAR(20),
    "cus_status" "customer_status_enum" NOT NULL DEFAULT 'ACTIVE',
    "cus_photo_url" TEXT,
    "cus_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cus_updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("cus_id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "boo_id" SERIAL NOT NULL,
    "boo_court_id" INTEGER NOT NULL,
    "boo_customer_id" INTEGER,
    "boo_customer_name" VARCHAR(150) NOT NULL,
    "boo_type" VARCHAR(80),
    "boo_date" DATE NOT NULL,
    "boo_start_time" TIME NOT NULL,
    "boo_end_time" TIME NOT NULL,
    "boo_status" "booking_status_enum" NOT NULL DEFAULT 'BOOKED',
    "boo_payment_status" "payment_status_enum" NOT NULL DEFAULT 'PENDING',
    "boo_total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "boo_paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "boo_booking_type" "booking_type_enum" NOT NULL DEFAULT 'SINGLE',
    "boo_series_id" UUID,
    "boo_series_payment_mode" "series_payment_mode_enum",
    "boo_series_label" VARCHAR(200),
    "boo_series_total_dates" INTEGER,
    "boo_series_index" INTEGER,
    "boo_receipt_url" TEXT,
    "boo_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "boo_updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("boo_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "ntf_id" SERIAL NOT NULL,
    "ntf_user_id" INTEGER,
    "ntf_type" "notification_type_enum" NOT NULL DEFAULT 'GENERAL',
    "ntf_title" VARCHAR(150) NOT NULL,
    "ntf_message" TEXT,
    "ntf_link_url" VARCHAR(200),
    "ntf_read" BOOLEAN NOT NULL DEFAULT false,
    "ntf_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("ntf_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_usu_username_key" ON "users"("usu_username");

-- CreateIndex
CREATE UNIQUE INDEX "users_usu_email_key" ON "users"("usu_email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_ses_token_hash_key" ON "sessions"("ses_token_hash");

-- CreateIndex
CREATE INDEX "ix_sessions_user" ON "sessions"("ses_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_prt_token_hash_key" ON "password_reset_tokens"("prt_token_hash");

-- CreateIndex
CREATE INDEX "ix_password_reset_tokens_user" ON "password_reset_tokens"("prt_user_id");

-- CreateIndex
CREATE INDEX "ix_schedule_blocks_court_date" ON "schedule_blocks"("blo_court_id", "blo_date");

-- CreateIndex
CREATE UNIQUE INDEX "customers_cus_document_number_key" ON "customers"("cus_document_number");

-- CreateIndex
CREATE INDEX "ix_bookings_date" ON "bookings"("boo_date");

-- CreateIndex
CREATE INDEX "ix_bookings_court_date" ON "bookings"("boo_court_id", "boo_date");

-- CreateIndex
CREATE INDEX "ix_bookings_customer" ON "bookings"("boo_customer_id");

-- CreateIndex
CREATE INDEX "ix_bookings_series" ON "bookings"("boo_series_id");

-- CreateIndex
CREATE INDEX "ix_bookings_payment_status" ON "bookings"("boo_payment_status");

-- CreateIndex
CREATE INDEX "ix_notifications_user_read" ON "notifications"("ntf_user_id", "ntf_read");

-- CreateIndex
CREATE INDEX "ix_notifications_created_at" ON "notifications"("ntf_created_at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_ses_user_id_fkey" FOREIGN KEY ("ses_user_id") REFERENCES "users"("usu_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_prt_user_id_fkey" FOREIGN KEY ("prt_user_id") REFERENCES "users"("usu_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_req_created_user_id_fkey" FOREIGN KEY ("req_created_user_id") REFERENCES "users"("usu_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_blo_court_id_fkey" FOREIGN KEY ("blo_court_id") REFERENCES "courts"("cou_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_boo_court_id_fkey" FOREIGN KEY ("boo_court_id") REFERENCES "courts"("cou_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_boo_customer_id_fkey" FOREIGN KEY ("boo_customer_id") REFERENCES "customers"("cus_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ntf_user_id_fkey" FOREIGN KEY ("ntf_user_id") REFERENCES "users"("usu_id") ON DELETE CASCADE ON UPDATE CASCADE;
