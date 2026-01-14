import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token"); // You can use sessionStorage or other storage methods as well
};

export const overviewApi = createApi({
  reducerPath: "overviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1/",

    // This will attach the token to every request that requires authorization
    prepareHeaders: (headers) => {
      const token = getAuthToken(); // Retrieve token from storage
      if (token) {
        headers.set("Authorization", `Bearer ${token}`); // Add token to headers if available
      }
      return headers;
    },
  }),
  tagTypes: ["overview"],
  endpoints: (build) => ({
    getOverviewSummary: build.query({
      query: ({ from, to }) => ({
        url: `/overview/summary`,
        method: "GET",
        params: { from, to },
      }),
      providesTags: ["overview"],

      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

// Export hooks to use in your components
export const { useGetOverviewSummaryQuery } = overviewApi;
