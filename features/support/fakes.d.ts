import type { BookingRepository, NewBookingData, SearchFilters, BookingWithRelations } from "../../src/contexts/bookings/domain/ports/BookingRepository.js";
import type { Booking, TimeRange } from "../../src/contexts/bookings/domain/model/Booking.js";
import type { CourtRepository, CourtAvailability, UpdateCourtData } from "../../src/contexts/bookings/domain/ports/CourtRepository.js";
import type { Court } from "../../src/contexts/bookings/domain/model/Court.js";
import type { ScheduleBlockRepository } from "../../src/contexts/bookings/domain/ports/ScheduleBlockRepository.js";
import type { ScheduleBlock } from "../../src/contexts/bookings/domain/model/ScheduleBlock.js";
import type { AdminDirectory, AdminSummary } from "../../src/contexts/bookings/domain/ports/AdminDirectory.js";
import type { NotificationSender } from "../../src/contexts/notifications/application/ports/NotificationSender.js";
import type { NotificationRepository, NewNotificationData } from "../../src/contexts/notifications/domain/ports/NotificationRepository.js";
import type { Notification } from "../../src/contexts/notifications/domain/model/Notification.js";
import type { PaymentRepository } from "../../src/contexts/payments/domain/ports/PaymentRepository.js";
import type { PayableBooking, Payment, PaymentMethod } from "../../src/contexts/payments/domain/model/Payment.js";
import type { FileStorage, UploadFileInput, UploadResult } from "../../src/platform/storage/ports/FileStorage.js";
import type { UserRepository, NewUserData } from "../../src/contexts/identity/domain/ports/UserRepository.js";
import type { User } from "../../src/contexts/identity/domain/model/User.js";
import type { AccessRequestRepository, NewAccessRequestData } from "../../src/contexts/identity/domain/ports/AccessRequestRepository.js";
import type { AccessRequest } from "../../src/contexts/identity/domain/model/AccessRequest.js";
import type { EmailVerificationTokenRepository, EmailVerificationToken } from "../../src/contexts/identity/domain/ports/EmailVerificationTokenRepository.js";
import type { SessionRepository } from "../../src/contexts/identity/domain/ports/SessionRepository.js";
export declare class FakeBookingRepository implements BookingRepository {
    bookings: Booking[];
    private nextId;
    runTransaction<T>(fn: (tx: BookingRepository) => Promise<T>): Promise<T>;
    findActiveOverlapCandidates(courtId: number, date: Date): Promise<(TimeRange & {
        id: number;
    })[]>;
    blocks: {
        courtId: number;
        date: Date;
        time: Date;
    }[];
    isTimeBlocked(courtId: number, date: Date, range: TimeRange): Promise<boolean>;
    createEmbeddedCustomer(data: {
        name: string;
        phone: string;
        documentNumber?: string;
    }): Promise<{
        id: number;
    }>;
    create(data: NewBookingData): Promise<Booking>;
    update(bookingId: number, data: Partial<NewBookingData>): Promise<Booking>;
    cancel(bookingId: number): Promise<Booking>;
    findByIdOrThrow(bookingId: number): Promise<Booking>;
    search(filters: SearchFilters): Promise<BookingWithRelations[]>;
}
export declare class FakeCourtRepository implements CourtRepository {
    courts: Map<number, Court>;
    private nextId;
    addCourt(name: string, pricePerHour: number): Court;
    findByName(name: string): Promise<Court | null>;
    create(data: {
        name: string;
        sport: string;
        surface?: string;
        pricePerHour: number;
        openTime?: string | null;
        closeTime?: string | null;
    }): Promise<Court>;
    update(courtId: number, data: UpdateCourtData): Promise<Court>;
    updatePrice(courtId: number, pricePerHour: number): Promise<Court>;
    delete(courtId: number): Promise<void>;
    listAll(): Promise<Court[]>;
    updatePhoto(courtId: number, photoUrl: string): Promise<Court>;
    getConsolidatedAvailability(date: Date): Promise<CourtAvailability[]>;
    findByIdOrThrow(courtId: number): Promise<Court>;
}
export declare class FakeScheduleBlockRepository implements ScheduleBlockRepository {
    blocks: ScheduleBlock[];
    private nextId;
    createMany(courtId: number, date: Date, times: Date[], reason?: string): Promise<ScheduleBlock[]>;
    listForCourtAndDate(courtId: number, date: Date): Promise<ScheduleBlock[]>;
    listUpcomingForCourt(courtId: number, fromDate: Date): Promise<ScheduleBlock[]>;
    deleteById(blockId: number): Promise<void>;
}
export declare class FakeAdminDirectory implements AdminDirectory {
    admins: (AdminSummary & {
        name: string;
    })[];
    listOtherActiveAdmins(excludeUserId?: number): Promise<AdminSummary[]>;
    findAdminNameOrThrow(userId: number): Promise<string>;
}
export declare class FakeNotificationSender implements NotificationSender {
    sent: {
        type: string;
        to: string;
        data: unknown;
    }[];
    emailServiceDown: boolean;
    errors: {
        type: string;
        to: string;
        message: string;
    }[];
    private deliver;
    sendBookingConfirmation(params: any): Promise<void>;
    sendAdminDecision(params: any): Promise<void>;
    sendEmailVerification(params: any): Promise<void>;
    sendNewAccessRequestAlert(params: any): Promise<void>;
    sendNewBookingAlert(params: any): Promise<void>;
}
export declare class FakeNotificationRepository implements NotificationRepository {
    notifications: Notification[];
    created: {
        userIds: number[];
        data: unknown;
    }[];
    private nextId;
    createForUsers(userIds: number[], data: NewNotificationData): Promise<void>;
    listForUser(userId: number): Promise<Notification[]>;
    markRead(notificationId: number): Promise<void>;
}
export declare class FakePaymentRepository implements PaymentRepository {
    bookings: Map<number, PayableBooking & {
        receiptPath?: string | null;
    }>;
    payments: Payment[];
    private nextId;
    seedBooking(id: number, totalAmount: number, paidAmount: number): void;
    findBookingOrThrow(bookingId: number): Promise<PayableBooking>;
    registerPaymentAtomic(bookingId: number, amount: number, method: PaymentMethod, newPaidAmount: number, status: "PARTIAL" | "PAID"): Promise<{
        booking: PayableBooking & {
            receiptPath?: string | null;
        };
        payment: Payment;
    }>;
    listPaymentsForBooking(bookingId: number): Promise<Payment[]>;
    attachReceipt(bookingId: number, receiptPath: string): Promise<PayableBooking>;
    getReceiptPath(bookingId: number): Promise<string | null>;
}
export declare class FakeFileStorage implements FileStorage {
    files: Map<string, Buffer<ArrayBufferLike>>;
    upload(input: UploadFileInput): Promise<UploadResult>;
    createSignedUrl(path: string, expiresInSeconds: number): Promise<string>;
}
export declare class FakeUserRepository implements UserRepository {
    users: Map<number, User>;
    private nextId;
    findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByIdOrThrow(userId: number): Promise<User>;
    countOwners(): Promise<number>;
    create(data: NewUserData): Promise<User>;
    promoteToOwner(userId: number): Promise<User>;
    activate(userId: number): Promise<User>;
    deactivate(userId: number): Promise<User>;
    updateLastAccess(userId: number): Promise<void>;
    updateEmail(userId: number, email: string): Promise<User>;
    updatePasswordHash(userId: number, passwordHash: string): Promise<void>;
    updateProfile(userId: number, data: {
        name?: string;
        username?: string;
    }): Promise<User>;
    listActiveAdmins(): Promise<{
        id: number;
        name: string;
        email: string;
        isOwner: boolean;
        lastAccess: Date | null | undefined;
    }[]>;
    listOwnerEmails(): Promise<string[]>;
    updatePhoto(userId: number, photoUrl: string): Promise<User>;
}
export declare class FakeAccessRequestRepository implements AccessRequestRepository {
    requests: Map<number, AccessRequest>;
    private nextId;
    findByEmailPending(email: string): Promise<AccessRequest | null>;
    create(data: NewAccessRequestData): Promise<AccessRequest>;
    findByIdOrThrow(requestId: number): Promise<AccessRequest>;
    markApproved(requestId: number, _createdUserId: number): Promise<void>;
    markRejected(requestId: number): Promise<void>;
    listPending(): Promise<{
        id: number;
        name: string;
        email: string;
        phone: string | null | undefined;
        createdAt: Date;
    }[]>;
}
export declare class FakeEmailVerificationTokenRepository implements EmailVerificationTokenRepository {
    private users;
    tokens: Map<number, EmailVerificationToken & {
        tokenHash: string;
    }>;
    private nextId;
    constructor(users: FakeUserRepository);
    create(data: {
        userId: number;
        tokenHash: string;
        expiresAt: Date;
    }): Promise<void>;
    findByTokenHash(tokenHash: string): Promise<EmailVerificationToken | null>;
    markUsedAndActivateUser(tokenId: number, userId: number): Promise<void>;
}
export declare class FakeSessionRepository implements SessionRepository {
    sessions: {
        userId: number;
        tokenHash: string;
    }[];
    create(data: {
        userId: number;
        tokenHash: string;
    }): Promise<void>;
    revoke(): Promise<void>;
    revokeAllForUser(): Promise<void>;
}
//# sourceMappingURL=fakes.d.ts.map