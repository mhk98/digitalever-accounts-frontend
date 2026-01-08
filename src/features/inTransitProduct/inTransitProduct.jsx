import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token");  // Modify this based on your token storage logic
};

export const inTransitProductApi = createApi({
  reducerPath: "inTransitProductApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1/",
    prepareHeaders: (headers) => {
      const token = getAuthToken();  // Fetch the token
      if (token) {
        // If the token exists, add it to the headers
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["intransit-product"], // Define the tag type for invalidation and refetching
  endpoints: (build) => ({
    insertInTransitProduct: build.mutation({
      query: (data) => ({
        url: "/intransit-product/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["intransit-product"],  // Invalidate the intransit-product tag after this mutation
    }),

    deleteInTransitProduct: build.mutation({
      query: (id) => ({
        url: `/intransit-product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["intransit-product"],  // Invalidate the intransit-product tag after deletion
    }),

    updateInTransitProduct: build.mutation({
      query: ({ id, data }) => ({
        url: `/intransit-product/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["intransit-product"],  // Invalidate the intransit-product tag after this mutation
    }),

     getAllInTransitProduct: build.query({
      query: ({ page, limit, startDate, endDate, productId,}) => ({
        url: "/intransit-product",
        params: { page, limit, startDate, endDate, productId,},  // Pass the page and limit as query params
      }),
      providesTags: ["intransit-product"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),

    getAllInTransitProductWithoutQuery: build.query({
      query: () => ({
        url: "/intransit-product/all",
      }),
      providesTags: ["intransit-product"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
    
  }),
});

export const {
  useInsertInTransitProductMutation,
  useGetAllInTransitProductQuery,
  useDeleteInTransitProductMutation,
  useUpdateInTransitProductMutation,
  useGetAllInTransitProductWithoutQueryQuery,
} = inTransitProductApi;
