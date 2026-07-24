import { setWorldConstructor, World as CucumberWorld } from "@cucumber/cucumber";
import {
  FakeBookingRepository,
  FakeCourtRepository,
  FakeScheduleBlockRepository,
  FakeAdminDirectory,
  FakeNotificationSender,
  FakeNotificationRepository,
  FakePaymentRepository,
  FakeFileStorage,
  FakeUserRepository,
  FakeAccessRequestRepository,
  FakeEmailVerificationTokenRepository,
  FakePasswordResetTokenRepository,
  FakeSessionRepository,
} from "./fakes.js";

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
  passwordResetTokens = new FakePasswordResetTokenRepository(this.users);
  sessions = new FakeSessionRepository();

  lastResult: unknown;
  lastError: (Error & { status?: number }) | undefined;
  lastSeriesResult: unknown[] | undefined;
  bookingsCountBeforeAttempt = 0;

  courtNameToId = new Map<string, number>();
  adminIdByName = new Map<string, number>();
  userIdByName = new Map<string, number>();
  lastRequestId: number | undefined;
  verificationRawToken: string | undefined;
  knownPassword: string | undefined;
  lastNotificationId: number | undefined;
  passwordResetRawToken: string | undefined;
}

setWorldConstructor(CustomWorld);
