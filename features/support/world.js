import { setWorldConstructor, World as CucumberWorld } from "@cucumber/cucumber";
import { FakeBookingRepository, FakeCourtRepository, FakeScheduleBlockRepository, FakeAdminDirectory, FakeNotificationSender, FakeNotificationRepository, FakePaymentRepository, FakeFileStorage, FakeUserRepository, FakeAccessRequestRepository, FakeEmailVerificationTokenRepository, FakeSessionRepository, } from "./fakes.js";
export class CustomWorld extends CucumberWorld {
    bookings = new FakeBookingRepository();
    courts = new FakeCourtRepository();
    scheduleBlocks = new FakeScheduleBlockRepository();
    admins = new FakeAdminDirectory();
    notifier = new FakeNotificationSender();
    notifications = new FakeNotificationRepository();
    payments = new FakePaymentRepository();
    storage = new FakeFileStorage();
    users = new FakeUserRepository();
    accessRequests = new FakeAccessRequestRepository();
    emailVerificationTokens = new FakeEmailVerificationTokenRepository(this.users);
    sessions = new FakeSessionRepository();
    lastResult;
    lastError;
    lastSeriesResult;
    bookingsCountBeforeAttempt = 0;
    courtNameToId = new Map();
    adminIdByName = new Map();
    userIdByName = new Map();
    lastRequestId;
    verificationRawToken;
    knownPassword;
    lastNotificationId;
}
setWorldConstructor(CustomWorld);
//# sourceMappingURL=world.js.map