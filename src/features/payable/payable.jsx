import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAuthToken = () => localStorage.getItem("token");

export const payableApi = createApi({
  reducerPath: "payableApi",
  baseQuery: fetchBaseQuery({
    baseUrl: " https://api.digitalever.com.bd/api/v1/",
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["payable"],
  endpoints: (build) => ({
    insertPayable: build.mutation({
      query: (data) => ({
        url: "/payable/create",
        method: "POST",
        body: data, // FormData
      }),
      invalidatesTags: ["payable"],
    }),

    updatePayable: build.mutation({
      query: ({ id, data }) => ({
        url: `/payable/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["payable"],
    }),

    deletePayable: build.mutation({
      query: (id) => ({
        url: `/payable/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["payable"],
    }),

    // ✅ FIXED: FILTER PARAMS PASSING
    getAllPayable: build.query({
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
          url: "/payable",
          params,
        };
      },
      providesTags: ["payable"],
      refetchOnMountOrArgChange: true,
      // ✅ pollingInterval off (debug এ সমস্যা করে)
      // pollingInterval: 1000,
    }),

    getAllPayableWithoutQuery: build.query({
      query: () => ({
        url: "/payable/all",
      }),
      providesTags: ["payable"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useGetAllPayableQuery,
  useInsertPayableMutation,
  useUpdatePayableMutation,
  useDeletePayableMutation,
  useGetAllPayableWithoutQueryQuery,
} = payableApi;
