import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import { makeRegisterBooking } from "../../src/contexts/bookings/application/registerBooking.usecase.js";
import { makeMarkNotificationRead } from "../../src/contexts/notifications/application/markNotificationRead.usecase.js";
import { makeListMyNotifications } from "../../src/contexts/notifications/application/listMyNotifications.usecase.js";
// A diferencia de bookings.steps.ts, aqui no hay un Background que registre la cancha,
// asi que la creamos on-demand si todavia no existe (mismo patron, mas permisivo).
function courtIdOrCreate(world, name) {
    let id = world.courtNameToId.get(name);
    if (!id) {
        const court = world.courts.addCourt(name, 5000);
        id = court.id;
        world.courtNameToId.set(name, id);
    }
    return id;
}
Given("two active administrators exist: {string} and {string}", async function (name1, name2) {
    let id = 1;
    for (const name of [name1, name2]) {
        const email = `${name.toLowerCase()}@lacanchitadecarlos.com`;
        this.admins.admins.push({ id, email, name });
        this.adminIdByName.set(name, id);
        id++;
    }
});
Given("the email service is down", async function () {
    this.notifier.emailServiceDown = true;
});
Given("{string} has an unread notification", async function (name) {
    const userId = this.adminIdByName.get(name);
    await this.notifications.createForUsers([userId], { type: "GENERAL", title: "Test notification" });
    const last = this.notifications.notifications.at(-1);
    this.lastNotificationId = last.id;
});
Given("{string} and {string} each have different notifications", async function (name1, name2) {
    const id1 = this.adminIdByName.get(name1);
    const id2 = this.adminIdByName.get(name2);
    await this.notifications.createForUsers([id1], { type: "GENERAL", title: `Notification for ${name1}` });
    await this.notifications.createForUsers([id2], { type: "GENERAL", title: `Notification for ${name2}` });
});
When("{string} registers a new booking for {string}", async function (adminName, court) {
    const registerBooking = makeRegisterBooking({
        bookings: this.bookings,
        courts: this.courts,
        notifier: this.notifier,
        admins: this.admins,
        notifications: this.notifications,
    });
    this.lastResult = await registerBooking({
        courtId: courtIdOrCreate(this, court),
        customerName: "Walk-in customer",
        date: "2026-08-01",
        startTime: "10:00",
        endTime: "11:00",
        totalAmount: 3000,
        actorUserId: this.adminIdByName.get(adminName),
    });
});
When("{string} registers a new booking", async function (adminName) {
    const registerBooking = makeRegisterBooking({
        bookings: this.bookings,
        courts: this.courts,
        notifier: this.notifier,
        admins: this.admins,
        notifications: this.notifications,
    });
    this.lastResult = await registerBooking({
        courtId: courtIdOrCreate(this, "Court 1"),
        customerName: "Walk-in customer",
        date: "2026-08-01",
        startTime: "10:00",
        endTime: "11:00",
        totalAmount: 3000,
        actorUserId: this.adminIdByName.get(adminName),
    });
});
When("{string} marks that notification as read", async function (_name) {
    const markNotificationRead = makeMarkNotificationRead({ notifications: this.notifications });
    await markNotificationRead(this.lastNotificationId);
});
When("{string} requests his notification list", async function (name) {
    const listMyNotifications = makeListMyNotifications({ notifications: this.notifications });
    this.lastResult = await listMyNotifications(this.adminIdByName.get(name));
});
Then("{string} receives an in-app notification of type {string}", async function (adminName, type) {
    const list = await this.notifications.listForUser(this.adminIdByName.get(adminName));
    assert.ok(list.some((n) => n.type === type));
});
Then("{string} receives an email about the new booking", async function (adminName) {
    const admin = this.admins.admins.find((a) => a.name === adminName);
    assert.ok(this.notifier.sent.some((s) => s.type === "newBookingAlert" && s.to === admin.email));
});
Then("{string} does not receive a notification for his own booking", async function (adminName) {
    const list = await this.notifications.listForUser(this.adminIdByName.get(adminName));
    assert.equal(list.length, 0);
});
Then("the booking is still created successfully", async function () {
    assert.ok(this.lastResult, "Expected the booking to have been created despite the email outage.");
    assert.equal(this.lastResult.status, "BOOKED");
});
Then("the email delivery error is logged but not shown to the administrator", async function () {
    assert.ok(this.notifier.errors.length > 0, "Expected the failed email delivery to be recorded internally.");
    assert.equal(this.lastError, undefined);
});
Then("the notification becomes read", async function () {
    const n = this.notifications.notifications.find((x) => x.id === this.lastNotificationId);
    assert.equal(n?.read, true);
});
Then("it no longer appears as pending in his list", async function () {
    const n = this.notifications.notifications.find((x) => x.id === this.lastNotificationId);
    const list = await this.notifications.listForUser(n.userId);
    assert.ok(!list.some((item) => item.id === n.id && item.read === false));
});
Then("he only receives the notifications addressed to him", async function () {
    const list = this.lastResult;
    const requester = list[0]?.userId;
    assert.ok(list.length > 0);
    assert.ok(list.every((n) => n.userId === requester));
});
//# sourceMappingURL=notifications.steps.js.map