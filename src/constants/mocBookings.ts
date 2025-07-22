
 interface Booking {
    id: string;
    resource: string;
    startTime: string;
    endTime: string;
    requestedBy: string;
    createdAt: string;
  }

// Mock data for frontend-only demo
export const mockBookings: Booking[] = [
    {
      id: "1",
      resource: "Conference Room A",
      startTime: "2024-01-15T14:00",
      endTime: "2024-01-15T15:30",
      requestedBy: "John Doe",
      createdAt: "2024-01-14T10:00:00Z",
    },
    {
      id: "2",
      resource: "Projector",
      startTime: "2024-01-15T10:00",
      endTime: "2024-01-15T11:00",
      requestedBy: "Jane Smith",
      createdAt: "2024-01-14T09:00:00Z",
    },
    {
      id: "3",
      resource: "Meeting Room B",
      startTime: "2024-01-16T09:00",
      endTime: "2024-01-16T10:30",
      requestedBy: "Bob Johnson",
      createdAt: "2024-01-14T11:00:00Z",
    },
    {
      id: "4",
      resource: "Conference Room A",
      startTime: "2024-01-17T11:00",
      endTime: "2024-01-17T12:00",
      requestedBy: "Alice Wilson",
      createdAt: "2024-01-14T12:00:00Z",
    },
    {
      id: "5",
      resource: "Presentation Equipment",
      startTime: "2024-01-18T15:00",
      endTime: "2024-01-18T16:30",
      requestedBy: "Mike Davis",
      createdAt: "2024-01-14T13:00:00Z",
    },
  ]