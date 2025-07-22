export const RESOURCES = [
  "Conference Room A",
  "Conference Room B",
  "Meeting Room B",
  "Projector",
  "Presentation Equipment",
] as const

export const BOOKING_RULES = {
  BUFFER_MINUTES: 10,
  MAX_DURATION_HOURS: 2,
  MIN_DURATION_MINUTES: 15,
  ADVANCE_BOOKING_DAYS: 30,
} as const
