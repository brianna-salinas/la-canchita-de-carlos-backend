import type { CustomerRepository, NewCustomerData } from "../domain/ports/CustomerRepository.js";
import { assertNonEmpty, assertMaxLength, normalizeText, normalizePhone, assertValidPhone } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

// US09 — registrar un cliente nuevo.
export function makeRegisterCustomer(deps: { customers: CustomerRepository }) {
  return async function registerCustomer(input: NewCustomerData) {
    try {
      assertNonEmpty(input.name, "El nombre del cliente");
      assertMaxLength(input.name, 150, "El nombre del cliente");
      assertNonEmpty(input.phone, "El telefono");
      assertValidPhone(input.phone);
      if (input.documentNumber) assertMaxLength(input.documentNumber, 20, "El numero de documento");
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    return deps.customers.create({
      name: normalizeText(input.name),
      phone: normalizePhone(input.phone),
      documentNumber: input.documentNumber?.trim() || undefined,
    });
  };
}
