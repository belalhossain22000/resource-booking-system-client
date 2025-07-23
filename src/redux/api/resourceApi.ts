import { baseApi } from "@/redux/api/baseApi";


export const resourceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllResources: builder.query({
      query: () => ({
        url: "/resource",
        method: "GET",
      }),
      providesTags: ["Resource"],
    }),
    //createResource
    createResource: builder.mutation({
      query: (data) => ({
        url: "/resource/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Resource"],
    }),
    //resourceAvailability
    checkResourceAvailability: builder.mutation({
      query: (data) => ({
        url: "/resource/availability",
        method: "POST",
        body: data,
      }),
    })
  }),
});

export const { useGetAllResourcesQuery, useCreateResourceMutation, useCheckResourceAvailabilityMutation } = resourceApi;
