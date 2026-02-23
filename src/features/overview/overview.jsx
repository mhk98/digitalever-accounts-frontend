// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// // Helper function to get the auth token
// const getAuthToken = () => {
//   return localStorage.getItem("token"); // You can use sessionStorage or other storage methods as well
// };

// export const overviewApi = createApi({
//   reducerPath: "overviewApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: " http://localhost:5000/api/v1/",

//     // This will attach the token to every request that requires authorization
//     prepareHeaders: (headers) => {
//       const token = getAuthToken(); // Retrieve token from storage
//       if (token) {
//         headers.set("Authorization", `Bearer ${token}`); // Add token to headers if available
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ["overview"],
//   endpoints: (build) => ({
//     getOverviewSummary: build.query({
//       query: ({ from, to }) => ({
//         url: `/overview/summary`,
//         method: "GET",
//         params: { from, to },
//       }),
//       providesTags: ["overview"],

//       refetchOnMountOrArgChange: true,
//       pollingInterval: 1000,
//     }),
//   }),
// });

// // Export hooks to use in your components
// export const { useGetOverviewSummaryQuery } = overviewApi;

// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseApi } from "../baseApi/api";

export const overviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOverviewSummary: build.query({
      query: (arg = {}) => {
        const { from, to } = arg;

        const params = { from, to };
        Object.keys(params).forEach((k) => {
          if (params[k] === undefined || params[k] === null || params[k] === "")
            delete params[k];
        });

        return { url: "/overview/summary", params };
      },

      providesTags: [{ type: "Overview", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),
  }),

  overrideExisting: false,
});

export const { useGetOverviewSummaryQuery } = overviewApi;
