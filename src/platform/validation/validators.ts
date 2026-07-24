export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function assertNonEmpty(value: string | undefined | null, fieldLabel: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${fieldLabel} no puede estar vacio.`);
  }
}

export function assertMaxLength(value: string, max: number, fieldLabel: string): void {
  if (value.length > max) {
    throw new Error(`${fieldLabel} no puede superar los ${max} caracteres.`);
  }
}

export function assertMinLength(value: string, min: number, fieldLabel: string): void {
  if (value.length < min) {
    throw new Error(`${fieldLabel} debe tener al menos ${min} caracteres.`);
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertValidEmail(email: string): void {
  if (!EMAIL_REGEX.test(email)) {
    throw new Error("El correo no tiene un formato valido.");
  }
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("9")) return `51${digits}`;
  if (digits.length === 11 && digits.startsWith("519")) return digits;
  return digits;
}

export function assertValidPhone(phone: string): void {
  const digits = phone.replace(/\D/g, "");
  const isLocal = digits.length === 9 && digits.startsWith("9");
  const isWithCountryCode = digits.length === 11 && digits.startsWith("519");
  if (!isLocal && !isWithCountryCode) {
    throw new Error("El numero de telefono/WhatsApp no es valido (debe ser un celular peruano de 9 digitos).");
  }
}

export function assertPositiveAmount(amount: number, fieldLabel = "El monto"): void {
  if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
    throw new Error(`${fieldLabel} debe ser un numero mayor a cero.`);
  }
}
