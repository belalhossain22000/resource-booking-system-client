export interface Booking {
    id: string
    resource: string
    startTime: string
    endTime: string
    requestedBy: string
    createdAt: string
  }
  
  export interface CreateBookingRequest {
    resource: string
    startTime: string
    endTime: string
    requestedBy: string
  }
  
  export type BookingStatus = "Past" | "Ongoing" | "Upcoming"
  
  export interface ResourceStats {
    name: string
    totalBookings: number
    upcomingBookings: number
    ongoingBookings: number
    totalHours: number
    utilization: number
    isActive: boolean
  }
  