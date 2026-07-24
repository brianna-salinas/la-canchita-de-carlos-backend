// Error de aplicacion con codigo HTTP asociado. Vive en platform/ porque es un
// concepto transversal (lo usan los casos de uso de todos los bounded contexts y
// lo traduce el adaptador de entrada Express via errorMiddleware), no una regla de
// dominio de un context en particular.
export class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
//# sourceMappingURL=HttpError.js.map