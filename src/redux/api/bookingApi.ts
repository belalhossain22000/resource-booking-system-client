import { mockBookings } from "@/constants/mocBookings";
import { baseApi } from "@/redux/api/baseApi";
import { Booking, CreateBookingRequest } from "@/types/booking";

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookingStats: builder.query({
      query: () => ({
        url: "/booking/stats",
        method: "GET",
      }),
      providesTags: ["Booking"],
    }),
    getUpcomingAndActiveBookings: builder.query({
      query: () => ({
        url: "/booking/upcoming-ongoing",
        method: "GET",
      }),
      providesTags: ["Booking"],
    }),

    updateBookingStatus: builder.mutation({
      query: ({id,status}) => ({
        url: `booking/${id}`,
        method: "PUT",
        body: status,
      }),
      invalidatesTags: ["Booking"],
    }),

    getBookings: builder.query({
      query: () => ({
        url: "/booking",
        method: "GET",
      }),
      providesTags: ["Booking"],
    }),

    createBooking: builder.mutation<Booking, CreateBookingRequest>({
      query: (data) => ({
        url: `/booking/create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Booking"],
     
    }),
    deleteBooking: builder.mutation<{ message: string }, string>({
      queryFn: async (id) => {
        const index = mockBookings.findIndex((booking) => booking.id === id);
        if (index !== -1) {
          mockBookings.splice(index, 1);
        }
        return { data: { message: "Booking deleted successfully" } };
      },
      invalidatesTags: ["Booking"],
    }),
    updateBooking: builder.mutation<
      Booking,
      { id: string; booking: Partial<CreateBookingRequest> }
    >({
      queryFn: async ({ id, booking }) => {
        const index = mockBookings.findIndex((b) => b.id === id);
        if (index !== -1) {
          mockBookings[index] = { ...mockBookings[index], ...booking };
          return { data: mockBookings[index] };
        }
        throw new Error("Booking not found");
      },
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useDeleteBookingMutation,
  useUpdateBookingMutation,
  useGetBookingStatsQuery,
  useGetUpcomingAndActiveBookingsQuery,
  useUpdateBookingStatusMutation
} = bookingApi;
