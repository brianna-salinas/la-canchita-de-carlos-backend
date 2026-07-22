Feature: Administrator access requests
  As the owner of the system
  I want to review and approve or reject requests from new administrators
  So that I can control who is allowed to manage La Canchita de Carlos

  Scenario: Submit an access request
    When a person submits an access request with name "Test User" and email "test@email.com"
    Then the request is saved with status "PENDING"
    And every active owner receives an email about the new request

  Scenario: Approve a pending request
    Given a pending request from "Test User" exists
    When the owner approves that request
    Then a user is created with status "PENDING_VERIFICATION"
    And the requester receives an email with the account verification link
    And the requester receives an email saying their request was approved

  Scenario: Reject a pending request
    Given a pending request from "Test User" exists
    When the owner rejects that request
    Then the request status becomes "REJECTED"
    And the requester receives an email saying their request was rejected
    And no user is created

  Scenario: A request cannot be resolved twice
    Given a request from "Test User" that was already approved exists
    When the owner tries to approve it again
    Then the system responds with the error "This request has already been resolved."

  Scenario: Verifying the email activates the account
    Given a user exists with status "PENDING_VERIFICATION" and a valid verification token
    When the user opens the verification link with that token
    Then the user's account status becomes "ACTIVE"

  Scenario: An unverified user cannot log in
    Given a user exists with status "PENDING_VERIFICATION"
    When that user tries to log in with correct credentials
    Then the system responds "Your account has not been verified yet. Check your email to activate it (RF34)."

  Scenario: Bootstrapping the first owner of the system
    Given no user with isOwner set to true exists yet
    When someone calls the bootstrap endpoint with the correct setup token
    Then an active user is created with isOwner set to true
    And a second call to the bootstrap endpoint fails because an owner already exists

  Scenario: An owner can promote another active administrator
    Given "Ricardo" is an active administrator and is not an owner
    When an owner promotes "Ricardo" to owner
    Then "Ricardo" now has isOwner set to true
