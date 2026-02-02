import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAuthToken = () => localStorage.getItem("token");

export const pettyCashApi = createApi({
  reducerPath: "pettyCashApi",
  baseQuery: fetchBaseQuery({
    baseUrl: " http://localhost:5000/api/v1/",
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["pettyCash"],
  endpoints: (build) => ({
    insertPettyCash: build.mutation({
      query: (data) => ({
        url: "/petty-cash/create",
        method: "POST",
        body: data, // FormData
      }),
      invalidatesTags: ["pettyCash"],
    }),

    updatePettyCash: build.mutation({
      query: ({ id, data }) => ({
        url: `/petty-cash/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["pettyCash"],
    }),

    deletePettyCash: build.mutation({
      query: (id) => ({
        url: `/petty-cash/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["pettyCash"],
    }),

    // ✅ FIXED: FILTER PARAMS PASSING
    getAllPettyCash: build.query({
      query: (arg) => {
        const {
          page,
          limit,
          startDate,
          endDate,
          searchTerm,
          paymentMode,
          paymentStatus,
        } = arg || {};

        const params = {
          page,
          limit,
          startDate,
          endDate,
          searchTerm,
          paymentMode,
          paymentStatus,
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
          url: "/petty-cash",
          params,
        };
      },
      providesTags: ["pettyCash"],
      refetchOnMountOrArgChange: true,
      // ✅ pollingInterval off (debug এ সমস্যা করে)
      // pollingInterval: 1000,
    }),

    getAllPettyCashWithoutQuery: build.query({
      query: () => ({
        url: "/petty-cash/all",
      }),
      providesTags: ["pettyCash"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useGetAllPettyCashQuery,
  useInsertPettyCashMutation,
  useUpdatePettyCashMutation,
  useDeletePettyCashMutation,
  useGetAllPettyCashWithoutQueryQuery,
} = pettyCashApi;
