
import { mockBookings } from "@/constants/mocBookings";
import { baseApi } from "@/redux/api/baseApi";
import { Booking, CreateBookingRequest } from "@/types/booking";


export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<Booking[], void>({
        queryFn: async () => {
          
          return { data: [...mockBookings] }
        },
        providesTags: ["Booking"],
      }),
      createBooking: builder.mutation<Booking, CreateBookingRequest>({
        queryFn: async (booking) => {
        
          const newBooking: Booking = {
            ...booking,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          }
          mockBookings.push(newBooking)
          return { data: newBooking }
        },
        invalidatesTags: ["Booking"],
      }),
      deleteBooking: builder.mutation<{ message: string }, string>({
        queryFn: async (id) => {
         
          const index = mockBookings.findIndex((booking) => booking.id === id)
          if (index !== -1) {
            mockBookings.splice(index, 1)
          }
          return { data: { message: "Booking deleted successfully" } }
        },
        invalidatesTags: ["Booking"],
      }),
      updateBooking: builder.mutation<Booking, { id: string; booking: Partial<CreateBookingRequest> }>({
        queryFn: async ({ id, booking }) => {
       
          const index = mockBookings.findIndex((b) => b.id === id)
          if (index !== -1) {
            mockBookings[index] = { ...mockBookings[index], ...booking }
            return { data: mockBookings[index] }
          }
          throw new Error("Booking not found")
        },
        invalidatesTags: ["Booking"],
      }),
  }),
});

export const { useGetBookingsQuery, useCreateBookingMutation, useDeleteBookingMutation, useUpdateBookingMutation } =
  bookingApi
