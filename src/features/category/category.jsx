import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token (adjust the logic if needed)
const getAuthToken = () => {
  return localStorage.getItem("token"); // Retrieve the token from localStorage or other storage
};

export const CategoryApi = createApi({
  reducerPath: "CategoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1/",

    // Prepare headers to include Authorization token if present
    prepareHeaders: (headers) => {
      const token = getAuthToken(); // Get the token from localStorage
      if (token) {
        headers.set("Authorization", `Bearer ${token}`); // Attach the token to the headers
      }
      return headers;
    },
  }),

  tagTypes: ["Category"], // Define the tag type for cache management
  endpoints: (build) => ({
    // Insert a new Category (POST request)
    insertCategory: build.mutation({
      query: (data) => ({
        url: "/category/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["category"], // Invalidate the Category cache after insertion
    }),

    // Delete a Category (DELETE request)
    deleteCategory: build.mutation({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["category"], // Invalidate the Category cache after deletion
    }),

    // Update Category details (PATCH request)
    updateCategory: build.mutation({
      query: ({ id, data }) => ({
        url: `/category/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["category"], // Invalidate the Category cache after update
    }),

    // Get a single Category (GET request)
    getSingleCategory: build.query({
      query: (id) => ({
        url: `/category/${id}`,
      }),
      providesTags: ["category"], // Provides the 'Category' tag for caching and invalidation
    }),

    getAllCategory: build.query({
      query: ({ page, limit, searchTerm }) => ({
        url: "/category",
        params: { page, limit, searchTerm }, // Pass the page and limit as query params
      }),
      providesTags: ["category"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),

    getAllCategoryWithoutQuery: build.query({
      query: () => ({
        url: "/category/all",
      }),
      providesTags: ["category"],

      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useInsertCategoryMutation,
  useGetAllCategoryQuery,
  useGetSingleCategoryQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useGetAllCategoryWithoutQueryQuery,
} = CategoryApi;
