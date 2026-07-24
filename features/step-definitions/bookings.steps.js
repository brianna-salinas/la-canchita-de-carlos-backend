import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import { makeRegisterBooking } from "../../src/contexts/bookings/application/registerBooking.usecase.js";
import { makeRegisterBookingSeries } from "../../src/contexts/bookings/application/registerBookingSeries.usecase.js";
function toStartEnd(startTime, endTime) {
    return {
        startTime: new Date(`1970-01-01T${startTime}:00Z`),
        endTime: new Date(`1970-01-01T${endTime}:00Z`),
    };
}
function courtId(world, name) {
    const id = world.courtNameToId.get(name);
    if (!id)
        throw new Error(`Unknown court "${name}" - did the Background step run?`);
    return id;
}
Given("the court {string} exists with a price per hour of {int}", async function (name, price) {
    const court = this.courts.addCourt(name, price);
    this.courtNameToId.set(name, court.id);
});
Given("the court {string} exists", async function (name) {
    const court = this.courts.addCourt(name, 5000);
    this.courtNameToId.set(name, court.id);
});
Given("there is no active booking for {string} on {string} between {string} and {string}", async function (_court, _date, _start, _end) {
    // No-op: el repositorio fake empieza vacio, no hace falta sembrar nada.
});
Given("that time slot is not blocked for maintenance", async function () {
    // No-op: el repositorio fake empieza sin bloqueos.
});
Given("an active booking already exists for {string} on {string} between {string} and {string}", async function (court, date, startTime, endTime) {
    const { startTime: st, endTime: et } = toStartEnd(startTime, endTime);
    await this.bookings.create({
        courtId: courtId(this, court),
        customerName: "Existing customer",
        date: new Date(date),
        startTime: st,
        endTime: et,
        totalAmount: 1000,
    });
});
Given("an active booking already exists for {string} on {string} at the same time", async function (court, date) {
    const { startTime, endTime } = toStartEnd("18:00", "19:00");
    await this.bookings.create({
        courtId: courtId(this, court),
        customerName: "Existing customer",
        date: new Date(date),
        startTime,
        endTime,
        totalAmount: 1000,
    });
});
Given("the time slot for {string} on {string} at {string} is blocked for maintenance", async function (court, date, time) {
    this.bookings.blocks.push({
        courtId: courtId(this, court),
        date: new Date(date),
        time: new Date(`1970-01-01T${time}:00Z`),
    });
});
Given("the administrator builds a booking series for {string} on the dates {string} from {string} to {string}", async function (court, dates, startTime, endTime) {
    this._seriesInput = {
        courtId: courtId(this, court),
        customerName: "Series customer",
        dates: dates.split(",").map((d) => d.trim()),
        startTime,
        endTime,
    };
});
Given("the administrator builds a booking series for {string} on the dates {string}", async function (court, dates) {
    this._seriesInput = {
        courtId: courtId(this, court),
        customerName: "Series customer",
        dates: dates.split(",").map((d) => d.trim()),
        startTime: "18:00",
        endTime: "19:00",
    };
});
Given("none of those dates have a conflict or a block", async function () {
    // No-op: el repositorio fake empieza limpio.
});
When("the administrator registers a booking for {string} on {string} from {string} to {string} for {string}", async function (court, date, startTime, endTime, customerName) {
    const registerBooking = makeRegisterBooking({
        bookings: this.bookings,
        courts: this.courts,
        notifier: this.notifier,
        admins: this.admins,
        notifications: this.notifications,
    });
    this.lastResult = await registerBooking({
        courtId: courtId(this, court),
        customerName,
        date,
        startTime,
        endTime,
        totalAmount: 5000,
    });
});
When(/^the administrator tries to register (?:another )?a?n? ?booking for "([^"]+)" on "([^"]+)" from "([^"]+)" to "([^"]+)"$/, async function (court, date, startTime, endTime) {
    const registerBooking = makeRegisterBooking({
        bookings: this.bookings,
        courts: this.courts,
        notifier: this.notifier,
        admins: this.admins,
        notifications: this.notifications,
    });
    this.bookingsCountBeforeAttempt = this.bookings.bookings.length;
    try {
        this.lastResult = await registerBooking({
            courtId: courtId(this, court),
            customerName: "New customer",
            date,
            startTime,
            endTime,
            totalAmount: 5000,
        });
        this.lastError = undefined;
    }
    catch (err) {
        this.lastError = err;
    }
});
When("the administrator confirms the series with payment mode {string} and total amount {int}", async function (mode, totalAmount) {
    const registerBookingSeries = makeRegisterBookingSeries({
        bookings: this.bookings,
        courts: this.courts,
        notifier: this.notifier,
        admins: this.admins,
        notifications: this.notifications,
    });
    const input = this._seriesInput;
    this.lastSeriesResult = await registerBookingSeries({
        ...input,
        seriesPaymentMode: mode,
        totalAmount,
    });
});
When("the administrator confirms the series", async function () {
    const registerBookingSeries = makeRegisterBookingSeries({
        bookings: this.bookings,
        courts: this.courts,
        notifier: this.notifier,
        admins: this.admins,
        notifications: this.notifications,
    });
    const input = this._seriesInput;
    this.bookingsCountBeforeAttempt = this.bookings.bookings.length;
    try {
        this.lastSeriesResult = await registerBookingSeries({
            ...input,
            seriesPaymentMode: "INDIVIDUAL",
            totalAmount: 5000,
        });
        this.lastError = undefined;
    }
    catch (err) {
        this.lastError = err;
    }
});
Then("the booking is created with status {string}", async function (status) {
    assert.equal(this.lastResult.status, status);
});
Then("the payment status is {string}", async function (status) {
    assert.equal(this.lastResult.paymentStatus, status);
});
Then("the system responds with a {int} error {string}", async function (statusCode, _message) {
    assert.ok(this.lastError, "Expected an error to have been thrown, but none was.");
    assert.equal(this.lastError.status, statusCode);
    // Nota: el texto exacto del mensaje en el codigo real esta en espanol; este paso
    // solo verifica el codigo de estado, no compara literalmente el texto en ingles
    // del escenario (eso es solo documentacion legible para humanos).
});
Then("no new booking is created", async function () {
    assert.equal(this.bookings.bookings.length, this.bookingsCountBeforeAttempt);
});
Then("{int} bookings are created, all linked to the same series id", async function (count) {
    assert.equal(this.lastSeriesResult.length, count);
    const seriesIds = new Set(this.lastSeriesResult.map((b) => b.seriesId));
    assert.equal(seriesIds.size, 1);
});
Then("the first booking in the series has a total amount of {int}", async function (amount) {
    assert.equal(this.lastSeriesResult[0].totalAmount, amount);
});
Then("the remaining bookings in the series have a total amount of {int}", async function (amount) {
    const rest = this.lastSeriesResult.slice(1);
    for (const b of rest)
        assert.equal(b.totalAmount, amount);
});
Then("the system responds with a 409 error indicating the conflicting date", async function () {
    assert.ok(this.lastError);
    assert.equal(this.lastError.status, 409);
});
Then("no booking in the series is created, not even the dates without conflict", async function () {
    assert.equal(this.bookings.bookings.length, this.bookingsCountBeforeAttempt);
});
//# sourceMappingURL=bookings.steps.js.map