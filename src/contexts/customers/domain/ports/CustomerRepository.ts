import type { Customer } from "../model/Customer.js";

export interface NewCustomerData {
  name: string;
  phone: string;
  documentNumber?: string;
}

export interface CustomerHistoryEntry {
  id: number;
  date: Date;
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  paidAmount: number;
  court: { id: number; name: string };
}

export interface CustomerRepository {
  create(data: NewCustomerData): Promise<Customer>;
  update(customerId: number, data: Partial<NewCustomerData>): Promise<Customer>;
  deactivate(customerId: number): Promise<Customer>;
  list(search?: string): Promise<Customer[]>;
  getBookingHistory(customerId: number): Promise<CustomerHistoryEntry[]>;
}
