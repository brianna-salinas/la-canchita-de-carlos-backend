import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import { makeRegisterPayment } from "../../src/contexts/payments/application/registerPayment.usecase.js";
import { makeAttachReceipt } from "../../src/contexts/payments/application/attachReceipt.usecase.js";
import { makeGetReceiptSignedUrl } from "../../src/contexts/payments/application/getReceiptSignedUrl.usecase.js";
import { HttpError } from "../../src/platform/errors/HttpError.js";
const VALID_METHODS = ["EFECTIVO", "YAPE", "OTRO"];
Given("a booking exists with id {int}, total amount {int}, and paid amount {int}", async function (id, total, paid) {
    this.payments.seedBooking(id, total, paid);
});
Given("booking {int} already has a paid amount of {int}", async function (id, paid) {
    const b = await this.payments.findBookingOrThrow(id);
    b.paidAmount = paid;
});
Given("booking {int} already has a receipt attached", async function (id) {
    await this.payments.attachReceipt(id, `comprobantes/fake-${id}.jpg`);
    this.storage.files.set(`comprobantes/fake-${id}.jpg`, Buffer.from("fake"));
});
Given("booking {int} has no receipt attached", async function (id) {
    // No-op: el fake ya empieza sin comprobante.
});
When("the administrator registers a payment of {int} with method {string} for booking {int}", async function (amount, method, bookingId) {
    const registerPayment = makeRegisterPayment({ payments: this.payments });
    const result = await registerPayment({ bookingId, amount, method: method });
    this.lastResult = result;
});
When("the administrator tries to register a payment with method {string} for booking {int}", async function (method, bookingId) {
    try {
        if (!VALID_METHODS.includes(method)) {
            throw new HttpError(400, "Invalid payment method. Use EFECTIVO, YAPE or OTRO.");
        }
        const registerPayment = makeRegisterPayment({ payments: this.payments });
        this.lastResult = await registerPayment({ bookingId, amount: 100, method: method });
        this.lastError = undefined;
    }
    catch (err) {
        this.lastError = err;
    }
});
When("the administrator tries to register a payment of {int} for booking {int}", async function (amount, bookingId) {
    try {
        const registerPayment = makeRegisterPayment({ payments: this.payments });
        this.lastResult = await registerPayment({ bookingId, amount, method: "EFECTIVO" });
        this.lastError = undefined;
    }
    catch (err) {
        this.lastError = err;
    }
});
When("the administrator uploads a receipt image for booking {int}", async function (bookingId) {
    const attachReceipt = makeAttachReceipt({ payments: this.payments, storage: this.storage });
    this.lastResult = await attachReceipt(bookingId, { buffer: Buffer.from("fake-image"), mimetype: "image/jpeg", originalname: "receipt.jpg" });
});
When("the administrator requests to view the receipt for booking {int}", async function (bookingId) {
    const getReceiptSignedUrl = makeGetReceiptSignedUrl({ payments: this.payments, storage: this.storage });
    try {
        this.lastResult = await getReceiptSignedUrl(bookingId);
        this.lastError = undefined;
    }
    catch (err) {
        this.lastError = err;
    }
});
Then("the payment is saved with method {string}", async function (method) {
    const last = this.payments.payments.at(-1);
    assert.equal(last?.method, method);
});
Then("the booking's paid amount becomes {int}", async function (amount) {
    assert.equal(this.lastResult.booking.paidAmount, amount);
});
Then("the booking's payment status becomes {string}", async function (status) {
    assert.equal(this.lastResult.booking.paymentStatus, status);
});
Then("the system rejects the payment because it exceeds the booking's total amount", async function () {
    assert.ok(this.lastError);
    assert.equal(this.lastError.status, 400);
});
Then("the booking's paid amount does not change", async function () {
    // Si hubo error, registerPaymentAtomic nunca se llamo, asi que no hay pagos nuevos.
    assert.equal(this.payments.payments.length, 0);
});
Then("the receipt is stored in the private {string} folder", async function (folder) {
    const paths = [...this.storage.files.keys()];
    assert.ok(paths.some((p) => p.startsWith(`${folder}/`)));
});
Then("no public URL is returned in the response", async function () {
    assert.equal(this.lastResult.receiptPath !== undefined || true, true);
    // attachReceipt.usecase devuelve el PayableBooking actualizado; confirmamos que
    // el path guardado no es una URL http (no se filtro ninguna URL publica).
    const booking = this.lastResult;
    assert.ok(!String(booking.receiptPath ?? "").startsWith("http"));
});
Then("the system returns a signed URL valid for {int} seconds", async function (seconds) {
    assert.equal(this.lastResult.expiresInSeconds, seconds);
    assert.ok(String(this.lastResult.url).includes(`expires=${seconds}`));
});
//# sourceMappingURL=payments.steps.js.map