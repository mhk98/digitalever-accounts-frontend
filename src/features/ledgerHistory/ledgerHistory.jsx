// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseApi } from "../baseApi/api";

export const ledgerHistoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    insertLedgerHistory: build.mutation({
      query: (data) => ({
        url: "ledger-history/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "LedgerHistory", id: "LIST" }],
    }),

    deleteLedgerHistory: build.mutation({
      query: (id) => ({
        url: `ledger-history/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "LedgerHistory", id: "LIST" }],
    }),

    updateLedgerHistory: build.mutation({
      query: ({ id, data }) => ({
        url: `ledger-history/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "LedgerHistory", id: "LIST" },
        { type: "LedgerHistory", id: arg.id },
      ],
    }),

    getAllLedgerHistory: build.query({
      query: ({ page, limit, startDate, endDate, name }) => ({
        url: "ledger-history",
        params: { page, limit, startDate, endDate, name },
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              { type: "LedgerHistory", id: "LIST" },
              ...result.data.map((r) => ({ type: "LedgerHistory", id: r.Id })),
            ]
          : [{ type: "LedgerHistory", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),

    getAllLedgerWithoutQuery: build.query({
      query: () => ({
        url: "ledger-history/all",
      }),
      providesTags: [{ type: "LedgerHistory", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),
  }),

  overrideExisting: false,
});

export const {
  useInsertLedgerHistoryMutation,
  useGetAllLedgerHistoryQuery,
  useDeleteLedgerHistoryMutation,
  useUpdateLedgerHistoryMutation,
  useGetAllLedgerWithoutQueryQuery,
} = ledgerHistoryApi;
