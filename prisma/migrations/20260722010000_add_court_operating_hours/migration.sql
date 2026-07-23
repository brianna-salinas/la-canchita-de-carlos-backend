-- Agrega horario de atencion (apertura/cierre) a las canchas.
ALTER TABLE "courts" ADD COLUMN "cou_open_time" VARCHAR(5) NOT NULL DEFAULT '08:00';
ALTER TABLE "courts" ADD COLUMN "cou_close_time" VARCHAR(5) NOT NULL DEFAULT '22:00';
