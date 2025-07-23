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
    })
  }),
});

export const { useGetAllResourcesQuery, useCreateResourceMutation } = resourceApi;
