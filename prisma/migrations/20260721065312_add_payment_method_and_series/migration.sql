-- CreateTable
CREATE TABLE "payments" (
    "pay_id" SERIAL NOT NULL,
    "pay_booking_id" INTEGER NOT NULL,
    "pay_amount" DECIMAL(10,2) NOT NULL,
    "pay_method" VARCHAR(30) NOT NULL,
    "pay_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("pay_id")
);

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_pay_booking_id_fkey" FOREIGN KEY ("pay_booking_id") REFERENCES "bookings"("boo_id") ON DELETE RESTRICT ON UPDATE CASCADE;
