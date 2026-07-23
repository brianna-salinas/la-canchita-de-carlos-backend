-- El horario de atención de una cancha ahora es opcional: si no se
-- configura, la cancha queda disponible las 24 horas sin restricción.
ALTER TABLE "courts" ALTER COLUMN "cou_open_time" DROP NOT NULL;
ALTER TABLE "courts" ALTER COLUMN "cou_open_time" DROP DEFAULT;
ALTER TABLE "courts" ALTER COLUMN "cou_close_time" DROP NOT NULL;
ALTER TABLE "courts" ALTER COLUMN "cou_close_time" DROP DEFAULT;
