
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
import type { PasswordResetTokenRepository, PasswordResetToken } from "../../src/contexts/identity/domain/ports/PasswordResetTokenRepository.js";
import type { SessionRepository } from "../../src/contexts/identity/domain/ports/SessionRepository.js";

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export class FakeBookingRepository implements BookingRepository {
  bookings: Booking[] = [];
  private nextId = 1;

  async runTransaction<T>(fn: (tx: BookingRepository) => Promise<T>): Promise<T> {
    // Simula atomicidad: si algo falla adentro, no queda nada a medio guardar.
    const snapshot = this.bookings.map((b) => ({ ...b }));
    try {
      return await fn(this);
    } catch (err) {
      this.bookings = snapshot;
      throw err;
    }
  }

  async findActiveOverlapCandidates(courtId: number, date: Date): Promise<(TimeRange & { id: number })[]> {
    return this.bookings
      .filter((b) => b.courtId === courtId && dateKey(b.date) === dateKey(date) && b.status === "BOOKED")
      .map((b) => ({ id: b.id, startTime: b.startTime, endTime: b.endTime }));
  }

  blocks: { courtId: number; date: Date; time: Date }[] = [];

  async isTimeBlocked(courtId: number, date: Date, range: TimeRange): Promise<boolean> {
    return this.blocks.some(
      (blk) =>
        blk.courtId === courtId &&
        dateKey(blk.date) === dateKey(date) &&
        blk.time.getTime() >= range.startTime.getTime() &&
        blk.time.getTime() < range.endTime.getTime()
    );
  }

  async createEmbeddedCustomer(data: { name: string; phone: string; documentNumber?: string }) {
    return { id: 9999 };
  }

  async create(data: NewBookingData): Promise<Booking> {
    const booking: Booking = {
      id: this.nextId++,
      courtId: data.courtId,
      customerId: data.customerId ?? null,
      customerName: data.customerName,
      type: data.type ?? null,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "BOOKED",
      totalAmount: data.totalAmount,
      paidAmount: 0,
      paymentStatus: "PENDING",
      receiptUrl: null,
      bookingType: data.bookingType ?? "SINGLE",
      seriesId: data.seriesId ?? null,
      seriesPaymentMode: data.seriesPaymentMode ?? null,
      seriesLabel: data.seriesLabel ?? null,
      seriesTotalDates: data.seriesTotalDates ?? null,
      seriesIndex: data.seriesIndex ?? null,
    };
    this.bookings.push(booking);
    return booking;
  }

  async update(bookingId: number, data: Partial<NewBookingData>): Promise<Booking> {
    const b = this.bookings.find((x) => x.id === bookingId)!;
    Object.assign(b, data);
    return b;
  }

  async cancel(bookingId: number): Promise<Booking> {
    const b = this.bookings.find((x) => x.id === bookingId)!;
    b.status = "CANCELLED";
    return b;
  }

  async findByIdOrThrow(bookingId: number): Promise<Booking> {
    const b = this.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error(`Booking ${bookingId} not found`);
    return b;
  }

  async search(filters: SearchFilters): Promise<BookingWithRelations[]> {
    return this.bookings.filter((b) => {
      if (filters.courtId && b.courtId !== filters.courtId) return false;
      if (filters.status && b.status !== filters.status) return false;
      return true;
    });
  }
}

export class FakeCourtRepository implements CourtRepository {
  courts = new Map<number, Court>();
  private nextId = 1;

  addCourt(name: string, pricePerHour: number): Court {
    const court: Court = {
      id: this.nextId++,
      name,
      sport: "Futbol",
      surface: null,
      pricePerHour,
      photoUrl: null,
      status: "ACTIVE",
      enabled: true,
      description: null,
      openTime: "08:00",
      closeTime: "22:00",
    };
    this.courts.set(court.id, court);
    return court;
  }

  async findByName(name: string): Promise<Court | null> {
    return [...this.courts.values()].find((c) => c.name === name) ?? null;
  }

  async create(data: {
    name: string;
    sport: string;
    surface?: string;
    pricePerHour: number;
    openTime?: string | null;
    closeTime?: string | null;
  }): Promise<Court> {
    const court = this.addCourt(data.name, data.pricePerHour);
    court.openTime = data.openTime ?? null;
    court.closeTime = data.closeTime ?? null;
    return court;
  }

  async update(courtId: number, data: UpdateCourtData): Promise<Court> {
    const c = this.courts.get(courtId)!;
    Object.assign(c, data);
    return c;
  }

  async updatePrice(courtId: number, pricePerHour: number): Promise<Court> {
    const c = this.courts.get(courtId)!;
    c.pricePerHour = pricePerHour;
    return c;
  }

  async delete(courtId: number): Promise<void> {
    this.courts.delete(courtId);
  }

  async listAll(): Promise<Court[]> {
    return [...this.courts.values()];
  }

  async updatePhoto(courtId: number, photoUrl: string): Promise<Court> {
    const c = this.courts.get(courtId)!;
    c.photoUrl = photoUrl;
    return c;
  }

  async getConsolidatedAvailability(date: Date): Promise<CourtAvailability[]> {
    return [];
  }

  async findByIdOrThrow(courtId: number): Promise<Court> {
    const c = this.courts.get(courtId);
    if (!c) throw new Error(`Court ${courtId} not found`);
    return c;
  }
}

export class FakeScheduleBlockRepository implements ScheduleBlockRepository {
  blocks: ScheduleBlock[] = [];
  private nextId = 1;

  async createMany(courtId: number, date: Date, times: Date[], reason?: string): Promise<ScheduleBlock[]> {
    const created = times.map((time) => ({ id: this.nextId++, courtId, date, time, reason: reason ?? null }));
    this.blocks.push(...created);
    return created;
  }

  async listForCourtAndDate(courtId: number, date: Date): Promise<ScheduleBlock[]> {
    return this.blocks.filter((b) => b.courtId === courtId && dateKey(b.date) === dateKey(date));
  }

  async listUpcomingForCourt(courtId: number, fromDate: Date): Promise<ScheduleBlock[]> {
    return this.blocks.filter((b) => b.courtId === courtId && b.date.getTime() >= fromDate.getTime());
  }

  async deleteById(blockId: number): Promise<void> {
    this.blocks = this.blocks.filter((b) => b.id !== blockId);
  }
}

export class FakeAdminDirectory implements AdminDirectory {
  admins: (AdminSummary & { name: string })[] = [];

  async listOtherActiveAdmins(excludeUserId?: number): Promise<AdminSummary[]> {
    return this.admins.filter((a) => a.id !== excludeUserId);
  }

  async findAdminNameOrThrow(userId: number): Promise<string> {
    const a = this.admins.find((x) => x.id === userId);
    if (!a) throw new Error(`Admin ${userId} not found`);
    return a.name;
  }
}

export class FakeNotificationSender implements NotificationSender {
  sent: { type: string; to: string; data: unknown }[] = [];

  // RF23/RF24 — un NotificationSender real (Resend) nunca deja que un fallo de envio
  // se propague hacia arriba, solo lo registra. Simulamos esa misma garantia aqui: si
  // "el correo esta caido", en vez de lanzar (lo que en producción dejaria una promesa
  // rechazada sin capturar, ya que el caller usa `void sender.enviar(...)`), guardamos
  // el error para poder verificarlo desde el escenario.
  emailServiceDown = false;
  errors: { type: string; to: string; message: string }[] = [];

  private async deliver(type: string, to: string, params: any) {
    if (this.emailServiceDown) {
      this.errors.push({ type, to, message: "Email service unavailable" });
      return;
    }
    this.sent.push({ type, to, data: params });
  }

  async sendBookingConfirmation(params: any) {
    await this.deliver("bookingConfirmation", params.to, params);
  }
  async sendAdminDecision(params: any) {
    await this.deliver("adminDecision", params.to, params);
  }
  async sendEmailVerification(params: any) {
    await this.deliver("emailVerification", params.to, params);
  }
  async sendPasswordReset(params: any) {
    await this.deliver("passwordReset", params.to, params);
  }
  async sendNewAccessRequestAlert(params: any) {
    await this.deliver("newAccessRequestAlert", params.to, params);
  }
  async sendNewBookingAlert(params: any) {
    await this.deliver("newBookingAlert", params.to, params);
  }
}

export class FakeNotificationRepository implements NotificationRepository {
  notifications: Notification[] = [];
  created: { userIds: number[]; data: unknown }[] = [];
  private nextId = 1;

  async createForUsers(userIds: number[], data: NewNotificationData): Promise<void> {
    this.created.push({ userIds, data });
    for (const userId of userIds) {
      this.notifications.push({
        id: this.nextId++,
        userId,
        type: data.type,
        title: data.title,
        message: data.message ?? null,
        linkUrl: data.linkUrl ?? null,
        read: false,
        createdAt: new Date(),
      });
    }
  }

  async listForUser(userId: number): Promise<Notification[]> {
    return this.notifications.filter((n) => n.userId === userId);
  }

  async markRead(notificationId: number): Promise<void> {
    const n = this.notifications.find((x) => x.id === notificationId);
    if (n) n.read = true;
  }
}

export class FakePaymentRepository implements PaymentRepository {
  bookings = new Map<number, PayableBooking & { receiptPath?: string | null }>();
  payments: Payment[] = [];
  private nextId = 1;

  seedBooking(id: number, totalAmount: number, paidAmount: number) {
    this.bookings.set(id, { id, totalAmount, paidAmount, receiptPath: null });
  }

  async findBookingOrThrow(bookingId: number): Promise<PayableBooking> {
    const b = this.bookings.get(bookingId);
    if (!b) throw new Error(`Booking ${bookingId} not found`);
    return b;
  }

  async registerPaymentAtomic(bookingId: number, amount: number, method: PaymentMethod, newPaidAmount: number, status: "PARTIAL" | "PAID") {
    const booking = this.bookings.get(bookingId)!;
    const payment: Payment = { id: this.nextId++, bookingId, amount, method, createdAt: new Date() };
    this.payments.push(payment);
    booking.paidAmount = newPaidAmount;
    (booking as any).paymentStatus = status;
    return { booking, payment };
  }

  async listPaymentsForBooking(bookingId: number): Promise<Payment[]> {
    return this.payments.filter((p) => p.bookingId === bookingId);
  }

  async attachReceipt(bookingId: number, receiptPath: string): Promise<PayableBooking> {
    const b = this.bookings.get(bookingId)!;
    b.receiptPath = receiptPath;
    return b;
  }

  async getReceiptPath(bookingId: number): Promise<string | null> {
    return this.bookings.get(bookingId)?.receiptPath ?? null;
  }
}

export class FakeFileStorage implements FileStorage {
  files = new Map<string, Buffer>();

  async upload(input: UploadFileInput): Promise<UploadResult> {
    const path = `${input.folder}/fake-${this.files.size + 1}.jpg`;
    this.files.set(path, input.buffer);
    return { path, url: null };
  }

  async createSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
    if (!this.files.has(path)) throw new Error("File not found");
    return `https://fake.storage/signed/${path}?expires=${expiresInSeconds}`;
  }
}

export class FakeUserRepository implements UserRepository {
  users = new Map<number, User>();
  private nextId = 1;

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return [...this.users.values()].find((u) => u.username === usernameOrEmail || u.email === usernameOrEmail) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find((u) => u.email === email) ?? null;
  }

  async findByIdOrThrow(userId: number): Promise<User> {
    const u = this.users.get(userId);
    if (!u) throw new Error(`User ${userId} not found`);
    return u;
  }

  async countOwners(): Promise<number> {
    return [...this.users.values()].filter((u) => u.isOwner).length;
  }

  async create(data: NewUserData): Promise<User> {
    const user: User = {
      id: this.nextId++,
      name: data.name,
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      status: data.status,
      isOwner: data.isOwner ?? false,
      lastAccess: null,
      photoUrl: null,
    };
    this.users.set(user.id, user);
    return user;
  }

  async promoteToOwner(userId: number): Promise<User> {
    const u = this.users.get(userId)!;
    u.isOwner = true;
    return u;
  }

  async activate(userId: number): Promise<User> {
    const u = this.users.get(userId)!;
    u.status = "ACTIVE";
    return u;
  }

  async deactivate(userId: number): Promise<User> {
    const u = this.users.get(userId)!;
    u.status = "INACTIVE";
    return u;
  }

  async updateLastAccess(userId: number): Promise<void> {
    const u = this.users.get(userId);
    if (u) u.lastAccess = new Date();
  }

  async updateEmail(userId: number, email: string): Promise<User> {
    const u = this.users.get(userId)!;
    u.email = email;
    return u;
  }

  async updatePasswordHash(userId: number, passwordHash: string): Promise<void> {
    const u = this.users.get(userId);
    if (u) u.passwordHash = passwordHash;
  }

  async updateProfile(userId: number, data: { name?: string; username?: string }): Promise<User> {
    const u = this.users.get(userId)!;
    Object.assign(u, data);
    return u;
  }

  async listActiveAdmins() {
    return [...this.users.values()]
      .filter((u) => u.status === "ACTIVE")
      .map((u) => ({ id: u.id, name: u.name, email: u.email, isOwner: u.isOwner, lastAccess: u.lastAccess }));
  }

  async listOwnerEmails(): Promise<string[]> {
    return [...this.users.values()].filter((u) => u.isOwner).map((u) => u.email);
  }

  async updatePhoto(userId: number, photoUrl: string | null): Promise<User> {
    const u = this.users.get(userId)!;
    u.photoUrl = photoUrl;
    return u;
  }

  async reactivate(userId: number, data: { name: string; passwordHash: string }): Promise<User> {
    const u = this.users.get(userId)!;
    u.name = data.name;
    u.passwordHash = data.passwordHash;
    u.status = "PENDING_VERIFICATION";
    return u;
  }
}

export class FakeAccessRequestRepository implements AccessRequestRepository {
  requests = new Map<number, AccessRequest>();
  private nextId = 1;

  async findByEmailPending(email: string): Promise<AccessRequest | null> {
    return [...this.requests.values()].find((r) => r.email === email && r.status === "PENDING") ?? null;
  }

  async create(data: NewAccessRequestData): Promise<AccessRequest> {
    const request: AccessRequest = {
      id: this.nextId++,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      passwordHash: data.passwordHash,
      status: "PENDING",
      createdAt: new Date(),
    };
    this.requests.set(request.id, request);
    return request;
  }

  async findByIdOrThrow(requestId: number): Promise<AccessRequest> {
    const r = this.requests.get(requestId);
    if (!r) throw new Error(`AccessRequest ${requestId} not found`);
    return r;
  }

  async markApproved(requestId: number, _createdUserId: number): Promise<void> {
    const r = this.requests.get(requestId);
    if (r) r.status = "APPROVED";
  }

  async markRejected(requestId: number): Promise<void> {
    const r = this.requests.get(requestId);
    if (r) r.status = "REJECTED";
  }

  async listPending() {
    return [...this.requests.values()]
      .filter((r) => r.status === "PENDING")
      .map((r) => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, createdAt: r.createdAt }));
  }
}

// Recibe la referencia al FakeUserRepository porque, igual que en la implementacion
// real con Prisma, activar la cuenta tras verificar el correo cruza ambos aggregates
// (EmailVerificationToken y User) en una sola operacion atomica.
export class FakeEmailVerificationTokenRepository implements EmailVerificationTokenRepository {
  tokens = new Map<number, EmailVerificationToken & { tokenHash: string }>();
  private nextId = 1;

  constructor(private users: FakeUserRepository) {}

  async create(data: { userId: number; tokenHash: string; expiresAt: Date }): Promise<void> {
    const id = this.nextId++;
    this.tokens.set(id, { id, userId: data.userId, used: false, expiresAt: data.expiresAt, tokenHash: data.tokenHash });
  }

  async findByTokenHash(tokenHash: string): Promise<EmailVerificationToken | null> {
    return [...this.tokens.values()].find((t) => t.tokenHash === tokenHash) ?? null;
  }

  async markUsedAndActivateUser(tokenId: number, userId: number): Promise<void> {
    const t = this.tokens.get(tokenId);
    if (t) t.used = true;
    await this.users.activate(userId);
  }
}

export class FakePasswordResetTokenRepository implements PasswordResetTokenRepository {
  tokens = new Map<number, PasswordResetToken & { tokenHash: string }>();
  private nextId = 1;

  constructor(private users: FakeUserRepository) {}

  async create(data: { userId: number; tokenHash: string; expiresAt: Date }): Promise<void> {
    const id = this.nextId++;
    this.tokens.set(id, { id, userId: data.userId, used: false, expiresAt: data.expiresAt, tokenHash: data.tokenHash });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return [...this.tokens.values()].find((t) => t.tokenHash === tokenHash) ?? null;
  }

  async markUsedAndUpdatePassword(tokenId: number, userId: number, passwordHash: string): Promise<void> {
    const t = this.tokens.get(tokenId);
    if (t) t.used = true;
    await this.users.updatePasswordHash(userId, passwordHash);
  }
}

export class FakeSessionRepository implements SessionRepository {
  sessions: { userId: number; tokenHash: string }[] = [];

  async create(data: { userId: number; tokenHash: string }): Promise<void> {
    this.sessions.push({ userId: data.userId, tokenHash: data.tokenHash });
  }
  async revoke(): Promise<void> {}
  async revokeAllForUser(): Promise<void> {}
}
