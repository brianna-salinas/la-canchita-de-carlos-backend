// Invariante del dominio: el monto pagado nunca puede exceder el total del alquiler.
export function assertAmountWithinTotal(booking, amountToAdd) {
    if (booking.paidAmount + amountToAdd > booking.totalAmount) {
        throw new Error("El monto pagado no puede exceder el total del alquiler.");
    }
}
export function resolveStatus(booking, newPaidAmount) {
    return newPaidAmount >= booking.totalAmount ? "PAID" : "PARTIAL";
}
//# sourceMappingURL=Payment.js.map