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
  }),
});

export const { useGetAllResourcesQuery } = resourceApi;
