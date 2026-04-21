import { baseApi } from "../baseApi/api";

export const inTransitStockApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllInTransitStock: build.query({
      query: (arg = {}) => {
        const { page, limit, startDate, endDate, name, searchTerm } = arg;
        const params = { page, limit, startDate, endDate, name, searchTerm };

        Object.keys(params).forEach((key) => {
          if (
            params[key] === undefined ||
            params[key] === null ||
            params[key] === ""
          ) {
            delete params[key];
          }
        });

        return { url: "/intransit-stock", params };
      },
      providesTags: (result) =>
        result?.data
          ? [
              { type: "InTransitStock", id: "LIST" },
              ...result.data.map((row) => ({
                type: "InTransitStock",
                id: row.Id,
              })),
            ]
          : [{ type: "InTransitStock", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),

    getAllInTransitStockWithoutQuery: build.query({
      query: () => ({ url: "/intransit-stock/all" }),
      providesTags: [{ type: "InTransitStock", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),
  }),
});

export const {
  useGetAllInTransitStockQuery,
  useGetAllInTransitStockWithoutQueryQuery,
} = inTransitStockApi;
