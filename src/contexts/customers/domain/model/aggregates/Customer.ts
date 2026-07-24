
export type CustomerStatus = "ACTIVE" | "INACTIVE";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  documentNumber?: string | null;
  status: CustomerStatus;
}
