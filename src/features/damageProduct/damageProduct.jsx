import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token"); // Modify this based on your token storage logic
};

export const damageProductApi = createApi({
  reducerPath: "damageProductApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1/",
    prepareHeaders: (headers) => {
      const token = getAuthToken(); // Fetch the token
      if (token) {
        // If the token exists, add it to the headers
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["damage-product"], // Define the tag type for invalidation and refetching
  endpoints: (build) => ({
    insertDamageProduct: build.mutation({
      query: (data) => ({
        url: "/damage-product/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["damage-product"], // Invalidate the damage-product tag after this mutation
    }),

    deleteDamageProduct: build.mutation({
      query: (id) => ({
        url: `/damage-product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["damage-product"], // Invalidate the damage-product tag after deletion
    }),

    updateDamageProduct: build.mutation({
      query: ({ id, data }) => ({
        url: `/damage-product/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["damage-product"], // Invalidate the damage-product tag after this mutation
    }),

    getAllDamageProduct: build.query({
      query: ({ page, limit, startDate, endDate, name }) => ({
        url: "/damage-product",
        params: { page, limit, startDate, endDate, name }, // Pass the page and limit as query params
      }),
      providesTags: ["damage-product"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),

    getAllDamageProductWithoutQuery: build.query({
      query: () => ({
        url: "/damage-product/all",
      }),
      providesTags: ["damage-product"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useInsertDamageProductMutation,
  useGetAllDamageProductQuery,
  useDeleteDamageProductMutation,
  useUpdateDamageProductMutation,
  useGetAllDamageProductWithoutQueryQuery,
} = damageProductApi;
