import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import { makeBlockSchedule } from "../../src/contexts/bookings/application/blockSchedule.usecase.js";
import { makeListScheduleBlocks } from "../../src/contexts/bookings/application/listScheduleBlocks.usecase.js";
import { makeUnblockSchedule } from "../../src/contexts/bookings/application/unblockSchedule.usecase.js";
// Nota: "the court {string} exists" y "the administrator tries to register a booking..."
// ya estan definidos en bookings.steps.ts; Cucumber los reutiliza automaticamente porque
// todos los archivos de step-definitions se cargan juntos (ver cucumber.json).
function courtId(world, name) {
    const id = world.courtNameToId.get(name);
    if (!id)
        throw new Error(`Unknown court "${name}" - did the Background step run?`);
    return id;
}
function hoursBetween(startTime, endTime) {
    const [sh] = startTime.split(":").map(Number);
    const [eh] = endTime.split(":").map(Number);
    return eh - sh;
}
When("the administrator blocks {string} on {string} from {string} to {string} with reason {string}", async function (court, date, startTime, endTime, reason) {
    const blockSchedule = makeBlockSchedule({ scheduleBlocks: this.scheduleBlocks, bookings: this.bookings });
    this.lastResult = await blockSchedule({ courtId: courtId(this, court), date, startTime, endTime, reason });
    this._lastBlockContext = { court, date, startTime, endTime };
});
Given("{string} has a maintenance block on {string} at {string}", async function (court, date, time) {
    this.bookings.blocks.push({
        courtId: courtId(this, court),
        date: new Date(date),
        time: new Date(`1970-01-01T${time}:00Z`),
    });
});
Given("{string} has blocks registered on {string}", async function (court, date) {
    await this.scheduleBlocks.createMany(courtId(this, court), new Date(date), [new Date("1970-01-01T09:00:00Z"), new Date("1970-01-01T10:00:00Z")], "Lawn maintenance");
});
Given("a block with id {int} exists for {string}", async function (id, court) {
    this.scheduleBlocks.blocks.push({
        id,
        courtId: courtId(this, court),
        date: new Date("2026-07-26"),
        time: new Date("1970-01-01T09:00:00Z"),
        reason: "Lawn maintenance",
    });
});
When("the administrator requests the blocks for {string} on {string}", async function (court, date) {
    const listScheduleBlocks = makeListScheduleBlocks({ scheduleBlocks: this.scheduleBlocks });
    this.lastResult = await listScheduleBlocks(courtId(this, court), date);
});
When("the administrator deletes block {int}", async function (id) {
    const unblockSchedule = makeUnblockSchedule({ scheduleBlocks: this.scheduleBlocks });
    await unblockSchedule(id);
});
Then("a block is created for each hour within that range", async function () {
    const ctx = this._lastBlockContext;
    const expectedCount = hoursBetween(ctx.startTime, ctx.endTime);
    assert.equal(this.lastResult.length, expectedCount);
});
Then("those hours no longer appear as available for booking", async function () {
    const ctx = this._lastBlockContext;
    const blocks = await this.scheduleBlocks.listForCourtAndDate(courtId(this, ctx.court), new Date(ctx.date));
    assert.ok(blocks.length > 0, "Expected the blocked hours to show up when listing the court's blocks.");
});
Then("they receive the list of blocked hours with their reasons", async function () {
    const blocks = this.lastResult;
    assert.ok(blocks.length > 0);
    for (const b of blocks)
        assert.ok(b.reason, "Expected every block to carry its reason.");
});
Then("that hour becomes available for booking again", async function () {
    assert.ok(!this.scheduleBlocks.blocks.some((b) => b.id === 10));
});
//# sourceMappingURL=maintenance_blocks.steps.js.map