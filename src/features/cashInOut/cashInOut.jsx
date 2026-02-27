// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const getAuthToken = () => localStorage.getItem("token");

// export const cashInOutApi = createApi({
//   reducerPath: "cashInOutApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: " http://localhost:5000/api/v1/",
//     prepareHeaders: (headers) => {
//       const token = getAuthToken();
//       if (token) headers.set("Authorization", `Bearer ${token}`);
//       return headers;
//     },
//   }),
//   tagTypes: ["cashInOut"],
//   endpoints: (build) => ({
//     insertCashInOut: build.mutation({
//       query: (data) => ({
//         url: "/cash-in-out/create",
//         method: "POST",
//         body: data, // FormData
//       }),
//       invalidatesTags: ["cashInOut"],
//     }),

//     updateCashInOut: build.mutation({
//       query: ({ id, data }) => ({
//         url: `/cash-in-out/${id}`,
//         method: "PATCH",
//         body: data,
//       }),
//       invalidatesTags: ["cashInOut"],
//     }),

//     deleteCashInOut: build.mutation({
//       query: (id) => ({
//         url: `/cash-in-out/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["cashInOut"],
//     }),

//     // ✅ FIXED: FILTER PARAMS PASSING
//     getAllCashInOut: build.query({
//       query: (arg) => {
//         const {
//           page,
//           limit,
//           startDate,
//           endDate,
//           searchTerm,
//           paymentMode,
//           paymentStatus,
//           category,
//           bookId,
//         } = arg || {};

//         const params = {
//           page,
//           limit,
//           bookId,
//           startDate,
//           endDate,
//           searchTerm,
//           paymentMode,
//           paymentStatus,
//           category,
//         };

//         // ✅ remove undefined/empty
//         Object.keys(params).forEach((k) => {
//           if (
//             params[k] === undefined ||
//             params[k] === null ||
//             params[k] === ""
//           ) {
//             delete params[k];
//           }
//         });

//         return {
//           url: "/cash-in-out",
//           params,
//         };
//       },
//       providesTags: ["cashInOut"],
//       refetchOnMountOrArgChange: true,
//       // ✅ pollingInterval off (debug এ সমস্যা করে)
//       // pollingInterval: 1000,
//     }),

//     getSingleCashInOut: build.query({
//       query: (id) => ({
//         url: `/cash-in-out/${id}`,
//       }),
//       providesTags: ["cashInOut"], // Provides the 'supplier' tag for caching and invalidation
//     }),

//     getAllCashInOutWithoutQuery: build.query({
//       query: () => ({
//         url: "/cash-in-out/all",
//       }),
//       providesTags: ["cashInOut"],
//       refetchOnMountOrArgChange: true,
//       pollingInterval: 1000,
//     }),
//   }),
// });

// export const {
//   useGetAllCashInOutQuery,
//   useGetSingleCashInOutQuery,
//   useInsertCashInOutMutation,
//   useUpdateCashInOutMutation,
//   useDeleteCashInOutMutation,
//   useGetAllCashInOutWithoutQueryQuery,
// } = cashInOutApi;

import { baseApi } from "../baseApi/api";

export const cashInOutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    insertCashInOut: build.mutation({
      query: (data) => ({
        url: "/cash-in-out/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "CashInOut", id: "LIST" },
        { type: "Overview", id: "LIST" },
      ],
    }),

    updateCashInOut: build.mutation({
      query: ({ id, data }) => ({
        url: `/cash-in-out/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "CashInOut", id: arg.id },
        { type: "CashInOut", id: "LIST" },
        { type: "Overview", id: "LIST" },
      ],
    }),

    deleteCashInOut: build.mutation({
      query: (id) => ({
        url: `/cash-in-out/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (res, err, id) => [
        { type: "CashInOut", id },
        { type: "CashInOut", id: "LIST" },
        { type: "Overview", id: "LIST" },
      ],
    }),

    getAllCashInOut: build.query({
      query: (arg = {}) => {
        const {
          page,
          limit,
          startDate,
          endDate,
          searchTerm,
          paymentMode,
          paymentStatus,
          category,
          bookId,
        } = arg;

        const params = {
          page,
          limit,
          bookId,
          startDate,
          endDate,
          searchTerm,
          paymentMode,
          paymentStatus,
          category,
        };

        Object.keys(params).forEach((k) => {
          if (params[k] === undefined || params[k] === null || params[k] === "")
            delete params[k];
        });

        return { url: "/cash-in-out", params };
      },

      providesTags: (result) => {
        const rows = result?.data;
        if (Array.isArray(rows) && rows.length) {
          return [
            { type: "CashInOut", id: "LIST" },
            ...rows.map((r) => ({
              type: "CashInOut",
              id: r.Id ?? r.id,
            })),
          ];
        }
        return [{ type: "CashInOut", id: "LIST" }];
      },

      refetchOnMountOrArgChange: true,
    }),

    getSingleCashInOut: build.query({
      query: (id) => ({ url: `/cash-in-out/${id}` }),

      providesTags: (result, err, id) => [{ type: "CashInOut", id }],
    }),

    getAllCashInOutWithoutQuery: build.query({
      query: () => ({ url: "/cash-in-out/all" }),
      providesTags: [{ type: "CashInOut", id: "LIST" }],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000, // দরকার না হলে off করুন
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAllCashInOutQuery,
  useGetSingleCashInOutQuery,
  useInsertCashInOutMutation,
  useUpdateCashInOutMutation,
  useDeleteCashInOutMutation,
  useGetAllCashInOutWithoutQueryQuery,
} = cashInOutApi;
