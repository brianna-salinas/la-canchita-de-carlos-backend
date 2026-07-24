// RF12 — el precio por hora nunca puede ser cero ni negativo. Regla pura.
export function assertValidPrice(pricePerHour) {
    if (pricePerHour <= 0) {
        throw new Error("El precio debe ser mayor a cero.");
    }
}
// El "estado operativo" de una cancha (ACTIVE/MAINTENANCE, editable desde
// Canchas > Editar) antes no se revisaba en ningun lado al registrar o
// editar una reserva: getConsolidatedAvailability solo filtraba por
// enabled, asi que una cancha marcada "En mantenimiento" seguia apareciendo
// como disponible en el selector de Nueva Reserva y el backend igual
// aceptaba la reserva. Esta regla se usa tanto ahi (para que ya ni aparezca
// en el listado) como aca, como ultima linea de defensa server-side.
export function assertCourtAvailableForBooking(court) {
    if (!court.enabled) {
        throw new Error("Esta cancha no está disponible (deshabilitada).");
    }
    if (court.status === "MAINTENANCE") {
        throw new Error("Esta cancha está en mantenimiento y no se puede reservar.");
    }
}
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
// El horario de atencion de una cancha: a que hora abre y a que hora cierra.
// Debe tener formato HH:MM (24h) y la apertura debe ser antes que el cierre.
export function assertValidOperatingHours(openTime, closeTime) {
    if (!TIME_REGEX.test(openTime) || !TIME_REGEX.test(closeTime)) {
        throw new Error("El horario de atencion debe tener formato HH:MM (24 horas).");
    }
    if (openTime >= closeTime) {
        throw new Error("La hora de apertura debe ser anterior a la hora de cierre.");
    }
}
//# sourceMappingURL=Court.js.map