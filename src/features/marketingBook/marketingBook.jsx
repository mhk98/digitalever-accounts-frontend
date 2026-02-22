import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token"); // Modify this based on your token storage logic
};

export const marketingBookApi = createApi({
  reducerPath: "marketingBookApi",
  baseQuery: fetchBaseQuery({
    baseUrl: " http://localhost:5000/api/v1/",
    prepareHeaders: (headers) => {
      const token = getAuthToken(); // Fetch the token
      if (token) {
        // If the token exists, add it to the headers
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["marketingBook"], // Define the tag type for invalidation and refetching
  endpoints: (build) => ({
    insertMarketingBook: build.mutation({
      query: (data) => ({
        url: "/marketing-book/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["book"], // Invalidate the Book tag after this mutation
    }),

    deleteMarketingBook: build.mutation({
      query: (id) => ({
        url: `/marketing-book/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["marketingBook"], // Invalidate the Book tag after deletion
    }),

    updateMarketingBook: build.mutation({
      query: ({ id, data }) => ({
        url: `/marketing-book/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["marketingBook"], // Invalidate the Book tag after this mutation
    }),

    getAllMarketingBook: build.query({
      query: ({
        page,
        limit,
        startDate,
        endDate,
        bookId,
        searchTerm,
        paymentMode,
        paymentStatus,
      }) => ({
        url: "/book",
        params: {
          page,
          limit,
          startDate,
          endDate,
          bookId,
          searchTerm,
          paymentMode,
          paymentStatus,
        },
      }),
      providesTags: ["book"],
      refetchOnMountOrArgChange: true,
      // pollingInterval: 1000,  // ❌ remove
    }),

    getAllBookWithoutQuery: build.query({
      query: () => ({
        url: "/marketing-book/all",
      }),
      providesTags: ["marketingBook"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
    getSingleMarketingBookDataById: build.query({
      query: (id) => ({
        url: `/marketing-book/${id}`,
      }),
      providesTags: ["marketingBook"], // Provides the 'supplier' tag for caching and invalidation
    }),
  }),
});

export const {
  useGetAllMarketingBookQuery,
  useGetAllBookWithoutQueryQuery,
  useDeleteMarketingBookMutation,
  useUpdateMarketingBookMutation,
  useInsertMarketingBookMutation,
  useGetSingleMarketingBookDataByIdQuery,
} = marketingBookApi;
