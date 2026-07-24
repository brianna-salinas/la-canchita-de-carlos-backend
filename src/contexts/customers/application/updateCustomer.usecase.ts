import type { CustomerRepository, NewCustomerData } from "../domain/model/ports/CustomerRepository.js";
import { assertNonEmpty, assertMaxLength, normalizeText, normalizePhone, assertValidPhone } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export function makeUpdateCustomer(deps: { customers: CustomerRepository }) {
  return async function updateCustomer(customerId: number, input: Partial<NewCustomerData>) {
    const data: Partial<NewCustomerData> = { ...input };

    try {
      if (input.name !== undefined) {
        assertNonEmpty(input.name, "El nombre del cliente");
        assertMaxLength(input.name, 150, "El nombre del cliente");
        data.name = normalizeText(input.name);
      }
      if (input.phone !== undefined) {
        assertNonEmpty(input.phone, "El telefono");
        assertValidPhone(input.phone);
        data.phone = normalizePhone(input.phone);
      }
      if (input.documentNumber) {
        assertMaxLength(input.documentNumber, 20, "El numero de documento");
        data.documentNumber = input.documentNumber.trim();
      }
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    return deps.customers.update(customerId, data);
  };
}
