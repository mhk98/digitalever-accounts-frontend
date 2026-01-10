import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token"); // Modify this based on your token storage logic
};

export const purchaseReturnProductApi = createApi({
  reducerPath: "purchaseReturnProductApi",
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

  tagTypes: ["purchase-return-product"], // Define the tag type for invalidation and refetching
  endpoints: (build) => ({
    insertPurchaseReturnProduct: build.mutation({
      query: (data) => ({
        url: "/purchase-return-product/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["purchase-return-product"], // Invalidate the purchase-return-product tag after this mutation
    }),

    deletePurchaseReturnProduct: build.mutation({
      query: (id) => ({
        url: `/purchase-return-product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["purchase-return-product"], // Invalidate the purchase-return-product tag after deletion
    }),

    updatePurchaseReturnProduct: build.mutation({
      query: ({ id, data }) => ({
        url: `/purchase-return-product/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["purchase-return-product"], // Invalidate the purchase-return-product tag after this mutation
    }),

    getAllPurchaseReturnProduct: build.query({
      query: ({ page, limit, startDate, endDate, name }) => ({
        url: "/purchase-return-product",
        params: { page, limit, startDate, endDate, name }, // Pass the page and limit as query params
      }),
      providesTags: ["purchase-return-product"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),

    getAllPurchaseReturnProductWithoutQuery: build.query({
      query: () => ({
        url: "/purchase-return-product/all",
      }),
      providesTags: ["purchase-return-product"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useInsertPurchaseReturnProductMutation,
  useGetAllPurchaseReturnProductQuery,
  useDeletePurchaseReturnProductMutation,
  useUpdatePurchaseReturnProductMutation,
  useGetAllPurchaseReturnProductWithoutQueryQuery,
} = purchaseReturnProductApi;
