function dateKey(d) {
    return d.toISOString().slice(0, 10);
}
export class FakeBookingRepository {
    bookings = [];
    nextId = 1;
    async runTransaction(fn) {
        // Simula atomicidad: si algo falla adentro, no queda nada a medio guardar.
        const snapshot = this.bookings.map((b) => ({ ...b }));
        try {
            return await fn(this);
        }
        catch (err) {
            this.bookings = snapshot;
            throw err;
        }
    }
    async findActiveOverlapCandidates(courtId, date) {
        return this.bookings
            .filter((b) => b.courtId === courtId && dateKey(b.date) === dateKey(date) && b.status === "BOOKED")
            .map((b) => ({ id: b.id, startTime: b.startTime, endTime: b.endTime }));
    }
    blocks = [];
    async isTimeBlocked(courtId, date, range) {
        return this.blocks.some((blk) => blk.courtId === courtId &&
            dateKey(blk.date) === dateKey(date) &&
            blk.time.getTime() >= range.startTime.getTime() &&
            blk.time.getTime() < range.endTime.getTime());
    }
    async createEmbeddedCustomer(data) {
        return { id: 9999 };
    }
    async create(data) {
        const booking = {
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
    async update(bookingId, data) {
        const b = this.bookings.find((x) => x.id === bookingId);
        Object.assign(b, data);
        return b;
    }
    async cancel(bookingId) {
        const b = this.bookings.find((x) => x.id === bookingId);
        b.status = "CANCELLED";
        return b;
    }
    async findByIdOrThrow(bookingId) {
        const b = this.bookings.find((x) => x.id === bookingId);
        if (!b)
            throw new Error(`Booking ${bookingId} not found`);
        return b;
    }
    async search(filters) {
        return this.bookings.filter((b) => {
            if (filters.courtId && b.courtId !== filters.courtId)
                return false;
            if (filters.status && b.status !== filters.status)
                return false;
            return true;
        });
    }
}
export class FakeCourtRepository {
    courts = new Map();
    nextId = 1;
    addCourt(name, pricePerHour) {
        const court = {
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
    async findByName(name) {
        return [...this.courts.values()].find((c) => c.name === name) ?? null;
    }
    async create(data) {
        const court = this.addCourt(data.name, data.pricePerHour);
        court.openTime = data.openTime ?? null;
        court.closeTime = data.closeTime ?? null;
        return court;
    }
    async update(courtId, data) {
        const c = this.courts.get(courtId);
        Object.assign(c, data);
        return c;
    }
    async updatePrice(courtId, pricePerHour) {
        const c = this.courts.get(courtId);
        c.pricePerHour = pricePerHour;
        return c;
    }
    async delete(courtId) {
        this.courts.delete(courtId);
    }
    async listAll() {
        return [...this.courts.values()];
    }
    async updatePhoto(courtId, photoUrl) {
        const c = this.courts.get(courtId);
        c.photoUrl = photoUrl;
        return c;
    }
    async getConsolidatedAvailability(date) {
        return [];
    }
    async findByIdOrThrow(courtId) {
        const c = this.courts.get(courtId);
        if (!c)
            throw new Error(`Court ${courtId} not found`);
        return c;
    }
}
export class FakeScheduleBlockRepository {
    blocks = [];
    nextId = 1;
    async createMany(courtId, date, times, reason) {
        const created = times.map((time) => ({ id: this.nextId++, courtId, date, time, reason: reason ?? null }));
        this.blocks.push(...created);
        return created;
    }
    async listForCourtAndDate(courtId, date) {
        return this.blocks.filter((b) => b.courtId === courtId && dateKey(b.date) === dateKey(date));
    }
    async listUpcomingForCourt(courtId, fromDate) {
        return this.blocks.filter((b) => b.courtId === courtId && b.date.getTime() >= fromDate.getTime());
    }
    async deleteById(blockId) {
        this.blocks = this.blocks.filter((b) => b.id !== blockId);
    }
}
export class FakeAdminDirectory {
    admins = [];
    async listOtherActiveAdmins(excludeUserId) {
        return this.admins.filter((a) => a.id !== excludeUserId);
    }
    async findAdminNameOrThrow(userId) {
        const a = this.admins.find((x) => x.id === userId);
        if (!a)
            throw new Error(`Admin ${userId} not found`);
        return a.name;
    }
}
export class FakeNotificationSender {
    sent = [];
    // RF23/RF24 — un NotificationSender real (Resend) nunca deja que un fallo de envio
    // se propague hacia arriba, solo lo registra. Simulamos esa misma garantia aqui: si
    // "el correo esta caido", en vez de lanzar (lo que en producción dejaria una promesa
    // rechazada sin capturar, ya que el caller usa `void sender.enviar(...)`), guardamos
    // el error para poder verificarlo desde el escenario.
    emailServiceDown = false;
    errors = [];
    async deliver(type, to, params) {
        if (this.emailServiceDown) {
            this.errors.push({ type, to, message: "Email service unavailable" });
            return;
        }
        this.sent.push({ type, to, data: params });
    }
    async sendBookingConfirmation(params) {
        await this.deliver("bookingConfirmation", params.to, params);
    }
    async sendAdminDecision(params) {
        await this.deliver("adminDecision", params.to, params);
    }
    async sendEmailVerification(params) {
        await this.deliver("emailVerification", params.to, params);
    }
    async sendNewAccessRequestAlert(params) {
        await this.deliver("newAccessRequestAlert", params.to, params);
    }
    async sendNewBookingAlert(params) {
        await this.deliver("newBookingAlert", params.to, params);
    }
}
export class FakeNotificationRepository {
    notifications = [];
    created = [];
    nextId = 1;
    async createForUsers(userIds, data) {
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
    async listForUser(userId) {
        return this.notifications.filter((n) => n.userId === userId);
    }
    async markRead(notificationId) {
        const n = this.notifications.find((x) => x.id === notificationId);
        if (n)
            n.read = true;
    }
}
export class FakePaymentRepository {
    bookings = new Map();
    payments = [];
    nextId = 1;
    seedBooking(id, totalAmount, paidAmount) {
        this.bookings.set(id, { id, totalAmount, paidAmount, receiptPath: null });
    }
    async findBookingOrThrow(bookingId) {
        const b = this.bookings.get(bookingId);
        if (!b)
            throw new Error(`Booking ${bookingId} not found`);
        return b;
    }
    async registerPaymentAtomic(bookingId, amount, method, newPaidAmount, status) {
        const booking = this.bookings.get(bookingId);
        const payment = { id: this.nextId++, bookingId, amount, method, createdAt: new Date() };
        this.payments.push(payment);
        booking.paidAmount = newPaidAmount;
        booking.paymentStatus = status;
        return { booking, payment };
    }
    async listPaymentsForBooking(bookingId) {
        return this.payments.filter((p) => p.bookingId === bookingId);
    }
    async attachReceipt(bookingId, receiptPath) {
        const b = this.bookings.get(bookingId);
        b.receiptPath = receiptPath;
        return b;
    }
    async getReceiptPath(bookingId) {
        return this.bookings.get(bookingId)?.receiptPath ?? null;
    }
}
export class FakeFileStorage {
    files = new Map();
    async upload(input) {
        const path = `${input.folder}/fake-${this.files.size + 1}.jpg`;
        this.files.set(path, input.buffer);
        return { path, url: null };
    }
    async createSignedUrl(path, expiresInSeconds) {
        if (!this.files.has(path))
            throw new Error("File not found");
        return `https://fake.storage/signed/${path}?expires=${expiresInSeconds}`;
    }
}
export class FakeUserRepository {
    users = new Map();
    nextId = 1;
    async findByUsernameOrEmail(usernameOrEmail) {
        return [...this.users.values()].find((u) => u.username === usernameOrEmail || u.email === usernameOrEmail) ?? null;
    }
    async findByEmail(email) {
        return [...this.users.values()].find((u) => u.email === email) ?? null;
    }
    async findByIdOrThrow(userId) {
        const u = this.users.get(userId);
        if (!u)
            throw new Error(`User ${userId} not found`);
        return u;
    }
    async countOwners() {
        return [...this.users.values()].filter((u) => u.isOwner).length;
    }
    async create(data) {
        const user = {
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
    async promoteToOwner(userId) {
        const u = this.users.get(userId);
        u.isOwner = true;
        return u;
    }
    async activate(userId) {
        const u = this.users.get(userId);
        u.status = "ACTIVE";
        return u;
    }
    async deactivate(userId) {
        const u = this.users.get(userId);
        u.status = "INACTIVE";
        return u;
    }
    async updateLastAccess(userId) {
        const u = this.users.get(userId);
        if (u)
            u.lastAccess = new Date();
    }
    async updateEmail(userId, email) {
        const u = this.users.get(userId);
        u.email = email;
        return u;
    }
    async updatePasswordHash(userId, passwordHash) {
        const u = this.users.get(userId);
        if (u)
            u.passwordHash = passwordHash;
    }
    async updateProfile(userId, data) {
        const u = this.users.get(userId);
        Object.assign(u, data);
        return u;
    }
    async listActiveAdmins() {
        return [...this.users.values()]
            .filter((u) => u.status === "ACTIVE")
            .map((u) => ({ id: u.id, name: u.name, email: u.email, isOwner: u.isOwner, lastAccess: u.lastAccess }));
    }
    async listOwnerEmails() {
        return [...this.users.values()].filter((u) => u.isOwner).map((u) => u.email);
    }
    async updatePhoto(userId, photoUrl) {
        const u = this.users.get(userId);
        u.photoUrl = photoUrl;
        return u;
    }
}
export class FakeAccessRequestRepository {
    requests = new Map();
    nextId = 1;
    async findByEmailPending(email) {
        return [...this.requests.values()].find((r) => r.email === email && r.status === "PENDING") ?? null;
    }
    async create(data) {
        const request = {
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
    async findByIdOrThrow(requestId) {
        const r = this.requests.get(requestId);
        if (!r)
            throw new Error(`AccessRequest ${requestId} not found`);
        return r;
    }
    async markApproved(requestId, _createdUserId) {
        const r = this.requests.get(requestId);
        if (r)
            r.status = "APPROVED";
    }
    async markRejected(requestId) {
        const r = this.requests.get(requestId);
        if (r)
            r.status = "REJECTED";
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
export class FakeEmailVerificationTokenRepository {
    users;
    tokens = new Map();
    nextId = 1;
    constructor(users) {
        this.users = users;
    }
    async create(data) {
        const id = this.nextId++;
        this.tokens.set(id, { id, userId: data.userId, used: false, expiresAt: data.expiresAt, tokenHash: data.tokenHash });
    }
    async findByTokenHash(tokenHash) {
        return [...this.tokens.values()].find((t) => t.tokenHash === tokenHash) ?? null;
    }
    async markUsedAndActivateUser(tokenId, userId) {
        const t = this.tokens.get(tokenId);
        if (t)
            t.used = true;
        await this.users.activate(userId);
    }
}
export class FakeSessionRepository {
    sessions = [];
    async create(data) {
        this.sessions.push({ userId: data.userId, tokenHash: data.tokenHash });
    }
    async revoke() { }
    async revokeAllForUser() { }
}
//# sourceMappingURL=fakes.js.map