import type { Customer } from "../../../domain/model/aggregates/Customer.js";
import type { FileStorage } from "../../../../../platform/storage/ports/FileStorage.js";
import { withSignedPhotoUrl, withSignedPhotoUrls } from "../../../../../platform/storage/photoUrl.helper.js";
import type { CustomerResource } from "../resources/customer.resources.js";

export async function toCustomerResource(storage: FileStorage, customer: Customer): Promise<CustomerResource> {
  return withSignedPhotoUrl(storage, customer);
}

export async function toCustomerResources(storage: FileStorage, customers: Customer[]): Promise<CustomerResource[]> {
  return withSignedPhotoUrls(storage, customers);
}
