import { World as CucumberWorld } from "@cucumber/cucumber";
import { FakeBookingRepository, FakeCourtRepository, FakeScheduleBlockRepository, FakeAdminDirectory, FakeNotificationSender, FakeNotificationRepository, FakePaymentRepository, FakeFileStorage, FakeUserRepository, FakeAccessRequestRepository, FakeEmailVerificationTokenRepository, FakeSessionRepository } from "./fakes.js";
export declare class CustomWorld extends CucumberWorld {
    bookings: FakeBookingRepository;
    courts: FakeCourtRepository;
    scheduleBlocks: FakeScheduleBlockRepository;
    admins: FakeAdminDirectory;
    notifier: FakeNotificationSender;
    notifications: FakeNotificationRepository;
    payments: FakePaymentRepository;
    storage: FakeFileStorage;
    users: FakeUserRepository;
    accessRequests: FakeAccessRequestRepository;
    emailVerificationTokens: FakeEmailVerificationTokenRepository;
    sessions: FakeSessionRepository;
    lastResult: unknown;
    lastError: (Error & {
        status?: number;
    }) | undefined;
    lastSeriesResult: unknown[] | undefined;
    bookingsCountBeforeAttempt: number;
    courtNameToId: Map<string, number>;
    adminIdByName: Map<string, number>;
    userIdByName: Map<string, number>;
    lastRequestId: number | undefined;
    verificationRawToken: string | undefined;
    knownPassword: string | undefined;
    lastNotificationId: number | undefined;
}
//# sourceMappingURL=world.d.ts.map