import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAuthToken = () => localStorage.getItem("token");

export const receiveableApi = createApi({
  reducerPath: "receiveableApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.digitalever.com.bd/api/v1/",
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["receiveable"],
  endpoints: (build) => ({
    insertReceiveable: build.mutation({
      query: (data) => ({
        url: "/receiveable/create",
        method: "POST",
        body: data, // FormData
      }),
      invalidatesTags: ["receiveable"],
    }),

    updateReceiveable: build.mutation({
      query: ({ id, data }) => ({
        url: `/receiveable/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["receiveable"],
    }),

    deleteReceiveable: build.mutation({
      query: (id) => ({
        url: `/receiveable/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["receiveable"],
    }),

    // ✅ FIXED: FILTER PARAMS PASSING
    getAllReceiveable: build.query({
      query: (arg) => {
        const { page, limit, startDate, endDate, searchTerm } = arg || {};

        const params = {
          page,
          limit,
          startDate,
          endDate,
          searchTerm,
        };

        // ✅ remove undefined/empty
        Object.keys(params).forEach((k) => {
          if (
            params[k] === undefined ||
            params[k] === null ||
            params[k] === ""
          ) {
            delete params[k];
          }
        });

        return {
          url: "/receiveable",
          params,
        };
      },
      providesTags: ["receiveable"],
      refetchOnMountOrArgChange: true,
      // ✅ pollingInterval off (debug এ সমস্যা করে)
      // pollingInterval: 1000,
    }),

    getAllReceiveableWithoutQuery: build.query({
      query: () => ({
        url: "/receiveable/all",
      }),
      providesTags: ["receiveable"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useGetAllReceiveableQuery,
  useInsertReceiveableMutation,
  useUpdateReceiveableMutation,
  useDeleteReceiveableMutation,
  useGetAllReceiveableWithoutQueryQuery,
} = receiveableApi;
