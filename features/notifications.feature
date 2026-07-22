Feature: Notifications between administrators
  As an administrator
  I want to be notified when relevant things happen in the system
  So that I stay informed without having to check everything manually

  Background:
    Given two active administrators exist: "Carlos" and "Ricardo"

  Scenario: Notify other admins when a new booking is registered
    When "Carlos" registers a new booking for "Court 1"
    Then "Ricardo" receives an in-app notification of type "NEW_BOOKING"
    And "Ricardo" receives an email about the new booking
    And "Carlos" does not receive a notification for his own booking

  Scenario: An email failure does not block the operation (RF23/RF24)
    Given the email service is down
    When "Carlos" registers a new booking
    Then the booking is still created successfully
    And the email delivery error is logged but not shown to the administrator

  Scenario: Mark a notification as read
    Given "Ricardo" has an unread notification
    When "Ricardo" marks that notification as read
    Then the notification becomes read
    And it no longer appears as pending in his list

  Scenario: List only your own notifications
    Given "Carlos" and "Ricardo" each have different notifications
    When "Ricardo" requests his notification list
    Then he only receives the notifications addressed to him
