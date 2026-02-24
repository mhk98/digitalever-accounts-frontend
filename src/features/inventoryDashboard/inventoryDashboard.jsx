import { baseApi } from "../baseApi/api";

export const inventorySummaryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInventorySummary: build.query({
      query: (arg = {}) => {
        const { from, to } = arg;

        const params = { from, to };
        Object.keys(params).forEach((k) => {
          if (params[k] === undefined || params[k] === null || params[k] === "")
            delete params[k];
        });

        return { url: "/inventory/summary", params };
      },

      providesTags: [{ type: "InventorySummary", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),
  }),

  overrideExisting: false,
});

export const { useGetInventorySummaryQuery } = inventorySummaryApi;
