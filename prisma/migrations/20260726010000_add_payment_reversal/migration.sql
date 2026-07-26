-- Reversion de pagos al cancelar un alquiler.
-- Antes: cancelBooking solo marcaba la reserva como CANCELLED sin tocar
-- los pagos ya registrados; el pago quedaba huerfano (asociado a una
-- reserva cancelada) y el saldo pagado de la reserva no se reajustaba.
-- Ahora se agrega pay_reversed_at (nullable): al cancelar una reserva se
-- marcan como reversados todos sus pagos activos (soft-reversal, no se
-- borra el registro para conservar el rastro de auditoria) y se reinicia
-- el saldo de la reserva (boo_paid_amount=0, boo_payment_status=PENDING).
ALTER TABLE "payments" ADD COLUMN "pay_reversed_at" TIMESTAMPTZ;
