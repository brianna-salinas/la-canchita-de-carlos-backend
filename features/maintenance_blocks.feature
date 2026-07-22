Feature: Court maintenance blocks
  As an administrator
  I want to block time slots of a court for maintenance
  So that it cannot be booked while the court is unavailable

  Background:
    Given the court "Court 1" exists

  Scenario: Block a time range with a reason
    When the administrator blocks "Court 1" on "2026-07-26" from "08:00" to "10:00" with reason "Lawn maintenance"
    Then a block is created for each hour within that range
    And those hours no longer appear as available for booking

  Scenario: A blocked time slot cannot be booked
    Given "Court 1" has a maintenance block on "2026-07-26" at "09:00"
    When the administrator tries to register a booking for "Court 1" on "2026-07-26" from "09:00" to "10:00"
    Then the system responds with a 409 error "That time slot is blocked for maintenance"

  Scenario: List a court's blocks for a given date
    Given "Court 1" has blocks registered on "2026-07-26"
    When the administrator requests the blocks for "Court 1" on "2026-07-26"
    Then they receive the list of blocked hours with their reasons

  Scenario: Remove a maintenance block
    Given a block with id 10 exists for "Court 1"
    When the administrator deletes block 10
    Then that hour becomes available for booking again
