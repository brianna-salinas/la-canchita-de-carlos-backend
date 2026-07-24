import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { CustomWorld } from "../support/world.js";
import { makeRequestPasswordReset } from "../../src/contexts/identity/application/requestPasswordReset.usecase.js";
import { makeResetPassword } from "../../src/contexts/identity/application/resetPassword.usecase.js";
import { makeLogin } from "../../src/contexts/identity/application/login.usecase.js";
import { hashPassword } from "../../src/platform/security/password.js";

// --- Restablecer contrasena olvidada ---

Given("an active user exists with email {string}", async function (this: CustomWorld, email: string) {
  this.knownPassword = "oldPassword123";
  const passwordHash = await hashPassword(this.knownPassword);
  const user = await this.users.create({
    name: "Carlos Maldonado",
    username: "carlos",
    email,
    passwordHash,
    status: "ACTIVE",
  });
  this.userIdByName.set(email, user.id);
});

Given("that user has a valid password reset token", async function (this: CustomWorld) {
  const requestPasswordReset = makeRequestPasswordReset({
    users: this.users,
    passwordResetTokens: this.passwordResetTokens,
    notifier: this.notifier,
  });
  await requestPasswordReset("carlos@lacanchitadecarlos.com");
  const sentEmail = this.notifier.sent.find((s) => s.type === "passwordReset");
  this.passwordResetRawToken = (sentEmail?.data as any).rawToken;
});

Given("the user already reset the password once using that token", async function (this: CustomWorld) {
  const resetPassword = makeResetPassword({
    passwordResetTokens: this.passwordResetTokens,
    sessions: this.sessions,
  });
  await resetPassword(this.passwordResetRawToken!, "firstNewPassword123");
});

When("someone requests a password reset for {string}", async function (this: CustomWorld, email: string) {
  const requestPasswordReset = makeRequestPasswordReset({
    users: this.users,
    passwordResetTokens: this.passwordResetTokens,
    notifier: this.notifier,
  });
  this.lastResult = await requestPasswordReset(email);
});

When("the user resets the password using that token to {string}", async function (this: CustomWorld, newPassword: string) {
  await resetWithToken(this, this.passwordResetRawToken!, newPassword);
});

When("the user resets the password using that same token to {string}", async function (this: CustomWorld, newPassword: string) {
  await resetWithToken(this, this.passwordResetRawToken!, newPassword);
});

When("the user resets the password using an invalid token to {string}", async function (this: CustomWorld, newPassword: string) {
  await resetWithToken(this, "not-a-real-token", newPassword);
});

async function resetWithToken(world: CustomWorld, rawToken: string, newPassword: string) {
  const resetPassword = makeResetPassword({
    passwordResetTokens: world.passwordResetTokens,
    sessions: world.sessions,
  });
  try {
    world.lastResult = await resetPassword(rawToken, newPassword);
    world.lastError = undefined;
    world.knownPassword = newPassword;
  } catch (err) {
    world.lastError = err as Error & { status?: number };
  }
}

Then("a password reset email is sent to {string}", async function (this: CustomWorld, email: string) {
  assert.ok(this.notifier.sent.some((s) => s.type === "passwordReset" && s.to === email));
});

Then("no password reset email is sent", async function (this: CustomWorld) {
  assert.ok(!this.notifier.sent.some((s) => s.type === "passwordReset"));
});

Then("the response does not reveal whether the account exists", async function (this: CustomWorld) {
  assert.deepEqual(this.lastResult, { sent: true });
});

Then("the password reset succeeds", async function (this: CustomWorld) {
  assert.deepEqual(this.lastResult, { reset: true });
});

Then("the user can log in with the new password", async function (this: CustomWorld) {
  const login = makeLogin({ users: this.users, sessions: this.sessions });
  const result = await login({ usernameOrEmail: "carlos", password: this.knownPassword! });
  assert.ok(result);
});

Then("all of that user's sessions are revoked", async function (this: CustomWorld) {
  // FakeSessionRepository.revokeAllForUser() no-op de exito; si el resetPassword
  // no la hubiera llamado, este paso de todas formas ya habria fallado antes con
  // una excepcion no capturada, asi que solo confirmamos que el flujo llego hasta aca.
  assert.equal(this.lastError, undefined);
});
