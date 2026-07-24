import type { AdminDirectory, AdminSummary } from "../../domain/ports/AdminDirectory.js";
export declare class PrismaAdminDirectory implements AdminDirectory {
    listOtherActiveAdmins(excludeUserId?: number): Promise<AdminSummary[]>;
    findAdminNameOrThrow(userId: number): Promise<string>;
}
export declare const adminDirectory: AdminDirectory;
//# sourceMappingURL=PrismaAdminDirectory.d.ts.map