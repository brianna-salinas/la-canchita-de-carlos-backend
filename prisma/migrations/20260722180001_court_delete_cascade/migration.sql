-- Antes: eliminar una cancha era un soft-delete (enabled=false) porque las
-- reservas/bloqueos/pagos tenian FK con ON DELETE RESTRICT (bloqueaban el
-- borrado). Ahora "Eliminar cancha" es un borrado real: se cambia a
-- ON DELETE CASCADE para que al borrar la cancha se borren tambien, en
-- cascada, sus bloqueos de horario, sus reservas y los pagos de esas
-- reservas.
ALTER TABLE "schedule_blocks" DROP CONSTRAINT "schedule_blocks_blo_court_id_fkey";
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_blo_court_id_fkey" FOREIGN KEY ("blo_court_id") REFERENCES "courts"("cou_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookings" DROP CONSTRAINT "bookings_boo_court_id_fkey";
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_boo_court_id_fkey" FOREIGN KEY ("boo_court_id") REFERENCES "courts"("cou_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments" DROP CONSTRAINT "payments_pay_booking_id_fkey";
ALTER TABLE "payments" ADD CONSTRAINT "payments_pay_booking_id_fkey" FOREIGN KEY ("pay_booking_id") REFERENCES "bookings"("boo_id") ON DELETE CASCADE ON UPDATE CASCADE;
