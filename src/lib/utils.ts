import { Booking, BookingStatus } from "@/types/booking"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBookingStatus = (startTime: string, endTime: string): BookingStatus => {
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (now > end) return "Past"
  if (now >= start && now <= end) return "Ongoing"
  return "Upcoming"
}

export const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case "Past":
      return "secondary"
    case "Ongoing":
      return "default"
    case "Upcoming":
      return "outline"
    default:
      return "secondary"
  }
}

export const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatDuration = (startTime: string, endTime: string) => {
  const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60)
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export const validateBooking = (
  formData: { resource: string; startTime: string; endTime: string; requestedBy: string },
  existingBookings: Booking[],
  bufferMinutes = 10,
  maxDurationHours = 2,
): string[] => {
  const errors: string[] = []

  // Basic field validation
  if (!formData.resource) errors.push("Please select a resource")
  if (!formData.startTime) errors.push("Please select a start time")
  if (!formData.endTime) errors.push("Please select an end time")
  if (!formData.requestedBy.trim()) errors.push("Please enter your name")

  if (formData.startTime && formData.endTime) {
    const startTime = new Date(formData.startTime)
    const endTime = new Date(formData.endTime)
    const now = new Date()

    // Time validation
    if (endTime <= startTime) {
      errors.push("End time must be after start time")
    }

    // Duration validation (minimum 15 minutes)
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    if (durationMinutes < 15) {
      errors.push("Booking duration must be at least 15 minutes")
    }

    // Maximum duration validation
    if (durationMinutes > maxDurationHours * 60) {
      errors.push(`Booking duration cannot exceed ${maxDurationHours} hours`)
    }

    // Past time validation
    if (startTime <= now) {
      errors.push("Start time must be in the future")
    }

    // Conflict detection with buffer
    if (formData.resource) {
      const resourceBookings = existingBookings.filter((booking) => booking.resource === formData.resource)

      for (const booking of resourceBookings) {
        const existingStart = new Date(booking.startTime)
        const existingEnd = new Date(booking.endTime)

        // Add buffer time
        const bufferedStart = new Date(existingStart.getTime() - bufferMinutes * 60 * 1000)
        const bufferedEnd = new Date(existingEnd.getTime() + bufferMinutes * 60 * 1000)

        // Check for overlap with buffered time
        if (
          (startTime >= bufferedStart && startTime < bufferedEnd) ||
          (endTime > bufferedStart && endTime <= bufferedEnd) ||
          (startTime <= bufferedStart && endTime >= bufferedEnd)
        ) {
          errors.push(
            `Conflict detected with existing booking (${existingStart.toLocaleString()} - ${existingEnd.toLocaleString()}). ` +
              `Please allow ${bufferMinutes}-minute buffer before and after existing bookings.`,
          )
          break
        }
      }
    }
  }

  return errors
}
