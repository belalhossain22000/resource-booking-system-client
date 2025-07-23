export interface ResourceBooking {
  id: string
  resourceId: string
  startTime: string
  endTime: string
  requestedBy: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Resource {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  bookings: ResourceBooking[]
}