// Validaciones y normalizaciones de campos de entrada, reutilizables entre bounded
// contexts. Viven en platform/ porque son transversales (formato de correo, de
// telefono, de texto) y no una regla de negocio de un context en particular.
export function normalizeText(value) {
    return value.trim().replace(/\s+/g, " ");
}
export function assertNonEmpty(value, fieldLabel) {
    if (!value || value.trim().length === 0) {
        throw new Error(`${fieldLabel} no puede estar vacio.`);
    }
}
export function assertMaxLength(value, max, fieldLabel) {
    if (value.length > max) {
        throw new Error(`${fieldLabel} no puede superar los ${max} caracteres.`);
    }
}
export function assertMinLength(value, min, fieldLabel) {
    if (value.length < min) {
        throw new Error(`${fieldLabel} debe tener al menos ${min} caracteres.`);
    }
}
export function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function assertValidEmail(email) {
    if (!EMAIL_REGEX.test(email)) {
        throw new Error("El correo no tiene un formato valido.");
    }
}
// Celulares peruanos: 9 digitos, empiezan en 9. Aceptamos que venga con codigo de
// pais (+51), espacios, guiones o parentesis, y lo normalizamos a solo digitos con
// el 51 adelante (mismo formato que espera un link wa.me de WhatsApp).
export function normalizePhone(phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 9 && digits.startsWith("9"))
        return `51${digits}`;
    if (digits.length === 11 && digits.startsWith("519"))
        return digits;
    return digits;
}
export function assertValidPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    const isLocal = digits.length === 9 && digits.startsWith("9");
    const isWithCountryCode = digits.length === 11 && digits.startsWith("519");
    if (!isLocal && !isWithCountryCode) {
        throw new Error("El numero de telefono/WhatsApp no es valido (debe ser un celular peruano de 9 digitos).");
    }
}
export function assertPositiveAmount(amount, fieldLabel = "El monto") {
    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
        throw new Error(`${fieldLabel} debe ser un numero mayor a cero.`);
    }
}
//# sourceMappingURL=validators.js.map