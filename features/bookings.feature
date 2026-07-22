Feature: Booking registration
  As an administrator of La Canchita de Carlos
  I want to register court bookings
  So that customers can use the court without schedule conflicts

  Background:
    Given the court "Court 1" exists with a price per hour of 5000

  Scenario: Register a booking in an available time slot
    Given there is no active booking for "Court 1" on "2026-07-25" between "18:00" and "19:00"
    And that time slot is not blocked for maintenance
    When the administrator registers a booking for "Court 1" on "2026-07-25" from "18:00" to "19:00" for "John Doe"
    Then the booking is created with status "BOOKED"
    And the payment status is "PENDING"

  Scenario: Reject a booking due to overlapping time slot (RF06)
    Given an active booking already exists for "Court 1" on "2026-07-25" between "18:00" and "19:00"
    When the administrator tries to register another booking for "Court 1" on "2026-07-25" from "18:30" to "19:30"
    Then the system responds with a 409 error "An active booking already exists for that court and time slot"
    And no new booking is created

  Scenario: Reject a booking due to a maintenance block (RF07/RF32)
    Given the time slot for "Court 1" on "2026-07-25" at "18:00" is blocked for maintenance
    When the administrator tries to register a booking for "Court 1" on "2026-07-25" from "18:00" to "19:00"
    Then the system responds with a 409 error "That time slot is blocked for maintenance"
    And no new booking is created

  Scenario: End time must be after start time
    When the administrator tries to register a booking for "Court 1" on "2026-07-25" from "19:00" to "18:00"
    Then the system responds with a 400 error "End time must be after start time"

  Scenario: Register a recurring/multi-day booking series
    Given the administrator builds a booking series for "Court 1" on the dates "2026-07-25, 2026-08-01, 2026-08-08" from "18:00" to "19:00"
    And none of those dates have a conflict or a block
    When the administrator confirms the series with payment mode "LUMP_SUM" and total amount 15000
    Then 3 bookings are created, all linked to the same series id
    And the first booking in the series has a total amount of 15000
    And the remaining bookings in the series have a total amount of 0

  Scenario: Reject a series if any date has a conflict
    Given the administrator builds a booking series for "Court 1" on the dates "2026-07-25, 2026-08-01"
    And an active booking already exists for "Court 1" on "2026-08-01" at the same time
    When the administrator confirms the series
    Then the system responds with a 409 error indicating the conflicting date
    And no booking in the series is created, not even the dates without conflict
