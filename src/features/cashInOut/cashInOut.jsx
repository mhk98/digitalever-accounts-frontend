// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// // Helper function to get the auth token
// const getAuthToken = () => {
//   return localStorage.getItem("token");  // Modify this based on your token storage logic
// };

// export const cashInOutOutApi = createApi({
//   reducerPath: "cashInOutOutApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "http://localhost:5000/api/v1/",
//     prepareHeaders: (headers) => {
//       const token = getAuthToken();  // Fetch the token
//       if (token) {
//         // If the token exists, add it to the headers
//         headers.set("Authorization", `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),

//   tagTypes: ["cash-in-out"], // Define the tag type for invalidation and refetching
//   endpoints: (build) => ({
//     insertCashInOut: build.mutation({
//       query: (data) => ({
//         url: "/cash-in-out/create",
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: ["cash-in-out"],  // Invalidate the CashInOut tag after this mutation
//     }),

//     deleteCashInOut: build.mutation({
//       query: (id) => ({
//         url: `/cash-in-out/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["cash-in-out"],  // Invalidate the CashInOut tag after deletion
//     }),

//     updateCashInOut: build.mutation({
//       query: ({ id, data }) => ({
//         url: `/cash-in-out/${id}`,
//         method: "PATCH",
//         body: data,
//       }),
//       invalidatesTags: ["cash-in-out"],  // Invalidate the CashInOut tag after this mutation
//     }),

//      getAllCashInOut: build.query({
//       query: ({ page, limit, startDate, endDate, productId, bookId}) => ({
//         url: "/cash-in-out",
//         params: { page, limit, startDate, endDate, productId, bookId},  // Pass the page and limit as query params
//       }),
//       providesTags: ["cash-in-out"],
//       refetchOnMountOrArgChange: true,
//       pollingInterval: 1000,
//     }),

//     getAllCashInOutWithoutQuery: build.query({
//       query: () => ({
//         url: "/cash-in-out/all",
//       }),
//       providesTags: ["cash-in-out"],
//       refetchOnMountOrArgChange: true,
//       pollingInterval: 1000,
//     }),

//   }),
// });

// export const {
//   useGetAllCashInOutQuery,
//   useGetAllCashInOutWithoutQueryQuery,
//   useDeleteCashInOutMutation,
//   useUpdateCashInOutMutation,
//   useInsertCashInOutMutation,
// } = cashInOutOutApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAuthToken = () => localStorage.getItem("token");

export const cashInOutApi = createApi({
  reducerPath: "cashInOutApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1/",
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["cashInOut"],
  endpoints: (build) => ({
    insertCashInOut: build.mutation({
      query: (data) => ({
        url: "/cash-in-out/create",
        method: "POST",
        body: data, // FormData
      }),
      invalidatesTags: ["cashInOut"],
    }),

    updateCashInOut: build.mutation({
      query: ({ id, data }) => ({
        url: `/cash-in-out/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["cashInOut"],
    }),

    deleteCashInOut: build.mutation({
      query: (id) => ({
        url: `/cash-in-out/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["cashInOut"],
    }),

    // ✅ FIXED: FILTER PARAMS PASSING
    getAllCashInOut: build.query({
      query: (arg) => {
        const {
          page,
          limit,
          startDate,
          endDate,
          searchTerm,
          paymentMode,
          paymentStatus,
          bookId,
        } = arg || {};

        const params = {
          page,
          limit,
          bookId,
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
          url: "/cash-in-out",
          params,
        };
      },
      providesTags: ["cashInOut"],
      refetchOnMountOrArgChange: true,
      // ✅ pollingInterval off (debug এ সমস্যা করে)
      // pollingInterval: 1000,
    }),

    getSingleCashInOut: build.query({
      query: (id) => ({
        url: `/cash-in-out/${id}`,
      }),
      providesTags: ["cashInOut"], // Provides the 'supplier' tag for caching and invalidation
    }),

    getAllCashInOutWithoutQuery: build.query({
      query: () => ({
        url: "/cash-in-out/all",
      }),
      providesTags: ["cashInOut"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useGetAllCashInOutQuery,
  useGetSingleCashInOutQuery,
  useInsertCashInOutMutation,
  useUpdateCashInOutMutation,
  useDeleteCashInOutMutation,
  useGetAllCashInOutWithoutQueryQuery,
} = cashInOutApi;
