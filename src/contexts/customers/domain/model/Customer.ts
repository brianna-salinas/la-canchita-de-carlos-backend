// Entidad de dominio pura del aggregate Customer (bounded context Customers, soporte).
export type CustomerStatus = "ACTIVE" | "INACTIVE";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  documentNumber?: string | null;
  status: CustomerStatus;
}
