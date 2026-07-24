export type CustomerStatus = "ACTIVE" | "INACTIVE";
export interface Customer {
    id: number;
    name: string;
    phone: string;
    documentNumber?: string | null;
    status: CustomerStatus;
    photoUrl?: string | null;
}
//# sourceMappingURL=Customer.d.ts.map