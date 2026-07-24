Feature: Password reset
  As an administrator who forgot their password
  I want to request a reset link by email and set a new password
  So that I can regain access to my account without an owner's help

  Scenario: Request a reset link for an existing active account
    Given an active user exists with email "carlos@lacanchitadecarlos.com"
    When someone requests a password reset for "carlos@lacanchitadecarlos.com"
    Then a password reset email is sent to "carlos@lacanchitadecarlos.com"
    And the response does not reveal whether the account exists

  Scenario: Requesting a reset for an unknown email does not leak account existence
    When someone requests a password reset for "unknown@lacanchitadecarlos.com"
    Then no password reset email is sent
    And the response does not reveal whether the account exists

  Scenario: Reset the password with a valid token
    Given an active user exists with email "carlos@lacanchitadecarlos.com"
    And that user has a valid password reset token
    When the user resets the password using that token to "newPassword123"
    Then the password reset succeeds
    And the user can log in with the new password
    And all of that user's sessions are revoked

  Scenario: Reject a new password that is too short
    Given an active user exists with email "carlos@lacanchitadecarlos.com"
    And that user has a valid password reset token
    When the user resets the password using that token to "short"
    Then the system responds with a 400 error "La nueva contraseña debe tener al menos 8 caracteres."

  Scenario: Reject an expired or unknown token
    When the user resets the password using an invalid token to "newPassword123"
    Then the system responds with a 400 error "El enlace para restablecer tu contraseña es inválido o expiró. Solicita uno nuevo."

  Scenario: A token cannot be used twice
    Given an active user exists with email "carlos@lacanchitadecarlos.com"
    And that user has a valid password reset token
    And the user already reset the password once using that token
    When the user resets the password using that same token to "anotherPassword123"
    Then the system responds with a 400 error "El enlace para restablecer tu contraseña es inválido o expiró. Solicita uno nuevo."
