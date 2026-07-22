import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import type { CustomWorld } from "../support/world.js";
import { makeRequestAdminRegistration } from "../../src/contexts/identity/application/requestAdminRegistration.usecase.js";
import { makeAuthorizeAdminRequest } from "../../src/contexts/identity/application/authorizeAdminRequest.usecase.js";
import { makeRejectAdminRequest } from "../../src/contexts/identity/application/rejectAdminRequest.usecase.js";
import { makeVerifyEmail } from "../../src/contexts/identity/application/verifyEmail.usecase.js";
import { makeLogin } from "../../src/contexts/identity/application/login.usecase.js";
import { makeBootstrapOwner } from "../../src/contexts/identity/application/bootstrapOwner.usecase.js";
import { makePromoteToOwner } from "../../src/contexts/identity/application/promoteToOwner.usecase.js";
import { hashPassword } from "../../src/platform/security/password.js";
import { hashToken, tokenExpiryFromNow } from "../../src/platform/security/tokens.js";

// --- Solicitudes de acceso (RF20/RF21/TS05) ---

Given("a pending request from {string} exists", async function (this: CustomWorld, name: string) {
  const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
  const request = await this.accessRequests.create({ name, email, passwordHash: "fake-hash" });
  this.lastRequestId = request.id;
});

Given("a request from {string} that was already approved exists", async function (this: CustomWorld, name: string) {
  const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
  const request = await this.accessRequests.create({ name, email, passwordHash: "fake-hash" });
  const user = await this.users.create({
    name,
    username: name.toLowerCase(),
    email,
    passwordHash: "fake-hash",
    status: "PENDING_VERIFICATION",
  });
  await this.accessRequests.markApproved(request.id, user.id);
  this.lastRequestId = request.id;
});

When("a person submits an access request with name {string} and email {string}", async function (
  this: CustomWorld,
  name: string,
  email: string
) {
  // Sembramos un owner activo para poder verificar que "todo owner activo recibe un correo".
  await this.users.create({
    name: "System Owner",
    username: "owner",
    email: "owner@lacanchitadecarlos.com",
    passwordHash: "fake-hash",
    status: "ACTIVE",
    isOwner: true,
  });

  const requestAdminRegistration = makeRequestAdminRegistration({
    users: this.users,
    accessRequests: this.accessRequests,
    notifier: this.notifier,
  });
  this.lastResult = await requestAdminRegistration({ name, email, password: "password123" });
  this.lastRequestId = (this.lastResult as any).id;
});

When("the owner approves that request", async function (this: CustomWorld) {
  const authorizeAdminRequest = makeAuthorizeAdminRequest({
    users: this.users,
    accessRequests: this.accessRequests,
    emailVerificationTokens: this.emailVerificationTokens,
    notifier: this.notifier,
  });
  this.lastResult = await authorizeAdminRequest(this.lastRequestId!);
});

When("the owner rejects that request", async function (this: CustomWorld) {
  const rejectAdminRequest = makeRejectAdminRequest({ accessRequests: this.accessRequests, notifier: this.notifier });
  this.lastResult = await rejectAdminRequest(this.lastRequestId!);
});

When("the owner tries to approve it again", async function (this: CustomWorld) {
  const authorizeAdminRequest = makeAuthorizeAdminRequest({
    users: this.users,
    accessRequests: this.accessRequests,
    emailVerificationTokens: this.emailVerificationTokens,
    notifier: this.notifier,
  });
  try {
    this.lastResult = await authorizeAdminRequest(this.lastRequestId!);
    this.lastError = undefined;
  } catch (err) {
    this.lastError = err as Error & { status?: number };
  }
});

Then("the request is saved with status {string}", async function (this: CustomWorld, status: string) {
  const request = await this.accessRequests.findByIdOrThrow(this.lastRequestId!);
  assert.equal(request.status, status);
});

Then("every active owner receives an email about the new request", async function (this: CustomWorld) {
  assert.ok(this.notifier.sent.some((s) => s.type === "newAccessRequestAlert"));
});

Then("a user is created with status {string}", async function (this: CustomWorld, status: string) {
  assert.equal((this.lastResult as any).status, status);
});

Then("the requester receives an email with the account verification link", async function (this: CustomWorld) {
  assert.ok(this.notifier.sent.some((s) => s.type === "emailVerification"));
});

Then("the requester receives an email saying their request was approved", async function (this: CustomWorld) {
  assert.ok(this.notifier.sent.some((s) => s.type === "adminDecision" && (s.data as any).approved === true));
});

Then("the request status becomes {string}", async function (this: CustomWorld, status: string) {
  const request = await this.accessRequests.findByIdOrThrow(this.lastRequestId!);
  assert.equal(request.status, status);
});

Then("the requester receives an email saying their request was rejected", async function (this: CustomWorld) {
  assert.ok(this.notifier.sent.some((s) => s.type === "adminDecision" && (s.data as any).approved === false));
});

Then("no user is created", async function (this: CustomWorld) {
  assert.equal(this.users.users.size, 0);
});

// Nota: al igual que con el resto de escenarios, este paso solo verifica que se haya
// rechazado la operacion (409, la solicitud ya estaba resuelta); el texto exacto del
// error en produccion esta en espanol, el ingles del feature es documentacion legible.
Then("the system responds with the error {string}", async function (this: CustomWorld, _message: string) {
  assert.ok(this.lastError, "Expected an error to have been thrown, but none was.");
  assert.equal(this.lastError!.status, 409);
});

// --- Verificacion de correo y login (RF34/TS02/TS11) ---

Given("a user exists with status {string} and a valid verification token", async function (this: CustomWorld, status: string) {
  const user = await this.users.create({
    name: "Test User",
    username: "testuser",
    email: "testuser@example.com",
    passwordHash: "fake-hash",
    status: status as any,
  });
  const rawToken = "test-raw-token";
  await this.emailVerificationTokens.create({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt: tokenExpiryFromNow(24),
  });
  this.verificationRawToken = rawToken;
  this.userIdByName.set("Test User", user.id);
});

Given("a user exists with status {string}", async function (this: CustomWorld, status: string) {
  this.knownPassword = "password123";
  const passwordHash = await hashPassword(this.knownPassword);
  const user = await this.users.create({
    name: "Test User",
    username: "testuser",
    email: "testuser@example.com",
    passwordHash,
    status: status as any,
  });
  this.userIdByName.set("Test User", user.id);
});

When("the user opens the verification link with that token", async function (this: CustomWorld) {
  const verifyEmail = makeVerifyEmail({ emailVerificationTokens: this.emailVerificationTokens });
  try {
    this.lastResult = await verifyEmail(this.verificationRawToken!);
    this.lastError = undefined;
  } catch (err) {
    this.lastError = err as Error & { status?: number };
  }
});

When("that user tries to log in with correct credentials", async function (this: CustomWorld) {
  const login = makeLogin({ users: this.users, sessions: this.sessions });
  try {
    this.lastResult = await login({ usernameOrEmail: "testuser", password: this.knownPassword! });
    this.lastError = undefined;
  } catch (err) {
    this.lastError = err as Error & { status?: number };
  }
});

Then("the user's account status becomes {string}", async function (this: CustomWorld, status: string) {
  const userId = this.userIdByName.get("Test User")!;
  const user = await this.users.findByIdOrThrow(userId);
  assert.equal(user.status, status);
});

Then("the system responds {string}", async function (this: CustomWorld, _message: string) {
  assert.ok(this.lastError, "Expected an error to have been thrown, but none was.");
  assert.equal(this.lastError!.status, 401);
});

// --- Bootstrap del primer owner y ascenso de administradores (TS-bootstrap) ---

Given("no user with isOwner set to true exists yet", async function (this: CustomWorld) {
  // No-op: el repositorio fake empieza vacio, no hace falta sembrar nada.
});

When("someone calls the bootstrap endpoint with the correct setup token", async function (this: CustomWorld) {
  process.env.SETUP_TOKEN = process.env.SETUP_TOKEN ?? "test-setup-token";
  const bootstrapOwner = makeBootstrapOwner({ users: this.users });
  this.lastResult = await bootstrapOwner({
    name: "Carlos Maldonado",
    username: "carlos",
    email: "carlos@lacanchitadecarlos.com",
    password: "password123",
    setupToken: process.env.SETUP_TOKEN,
  });
});

Then("an active user is created with isOwner set to true", async function (this: CustomWorld) {
  const created = this.lastResult as any;
  assert.equal(created.isOwner, true);
  const user = await this.users.findByIdOrThrow(created.id);
  assert.equal(user.status, "ACTIVE");
});

Then("a second call to the bootstrap endpoint fails because an owner already exists", async function (this: CustomWorld) {
  const bootstrapOwner = makeBootstrapOwner({ users: this.users });
  try {
    await bootstrapOwner({
      name: "Another Owner",
      username: "another",
      email: "another@lacanchitadecarlos.com",
      password: "password123",
      setupToken: process.env.SETUP_TOKEN!,
    });
    assert.fail("Expected the second bootstrap call to be rejected.");
  } catch (err) {
    assert.equal((err as Error & { status?: number }).status, 409);
  }
});

Given("{string} is an active administrator and is not an owner", async function (this: CustomWorld, name: string) {
  const user = await this.users.create({
    name,
    username: name.toLowerCase(),
    email: `${name.toLowerCase()}@lacanchitadecarlos.com`,
    passwordHash: "fake-hash",
    status: "ACTIVE",
    isOwner: false,
  });
  this.userIdByName.set(name, user.id);
});

When("an owner promotes {string} to owner", async function (this: CustomWorld, name: string) {
  const promoteToOwner = makePromoteToOwner({ users: this.users });
  this.lastResult = await promoteToOwner(this.userIdByName.get(name)!);
});

Then("{string} now has isOwner set to true", async function (this: CustomWorld, name: string) {
  const userId = this.userIdByName.get(name)!;
  const user = await this.users.findByIdOrThrow(userId);
  assert.equal(user.isOwner, true);
  assert.equal((this.lastResult as any).id, userId);
});
