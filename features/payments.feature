Feature: Payment registration and receipts
  As an administrator of La Canchita de Carlos
  I want to register payments for a booking and attach its receipt
  So that I can keep clear track of what was paid and by which method

  Background:
    Given a booking exists with id 1, total amount 5000, and paid amount 0

  Scenario: Register a partial payment with a valid method
    When the administrator registers a payment of 2000 with method "YAPE" for booking 1
    Then the payment is saved with method "YAPE"
    And the booking's paid amount becomes 2000
    And the booking's payment status becomes "PARTIAL"

  Scenario: Register a payment that completes the total
    When the administrator registers a payment of 5000 with method "EFECTIVO" for booking 1
    Then the booking's payment status becomes "PAID"

  Scenario Outline: Reject invalid payment methods
    When the administrator tries to register a payment with method "<method>" for booking 1
    Then the system responds with a 400 error "Invalid payment method. Use EFECTIVO, YAPE or OTRO."

    Examples:
      | method      |
      | TRANSFER    |
      | card        |
      |             |

  Scenario: Reject a payment that exceeds the total amount (domain invariant)
    Given booking 1 already has a paid amount of 4000
    When the administrator tries to register a payment of 2000 for booking 1
    Then the system rejects the payment because it exceeds the booking's total amount
    And the booking's paid amount does not change

  Scenario: Attach a payment receipt
    When the administrator uploads a receipt image for booking 1
    Then the receipt is stored in the private "comprobantes" folder
    And no public URL is returned in the response

  Scenario: View an already attached receipt
    Given booking 1 already has a receipt attached
    When the administrator requests to view the receipt for booking 1
    Then the system returns a signed URL valid for 300 seconds

  Scenario: Try to view a receipt that does not exist
    Given booking 1 has no receipt attached
    When the administrator requests to view the receipt for booking 1
    Then the system responds with a 404 error "This booking has no receipt attached."

  Scenario: Cancelling a booking reverses its payment
    Given the administrator registers a payment of 2000 with method "YAPE" for booking 1
    When the administrator cancels booking 1
    Then the booking's paid amount becomes 0
    And the booking's payment status becomes "PENDING"
    And the payment of 2000 for booking 1 is marked as reversed
