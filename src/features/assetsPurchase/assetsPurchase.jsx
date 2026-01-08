import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token");  // Modify this based on your token storage logic
};

export const assetsPurchaseApi = createApi({
  reducerPath: "assetsPurchaseApi",
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

  tagTypes: ["assets-purchase"], // Define the tag type for invalidation and refetching
  endpoints: (build) => ({
    insertAssetsPurchase: build.mutation({
      query: (data) => ({
        url: "/assets-purchase/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["assets-purchase"],  // Invalidate the product tag after this mutation
    }),

    deleteAssetsPurchase: build.mutation({
      query: (id) => ({
        url: `/assets-purchase/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["assets-purchase"],  // Invalidate the product tag after deletion
    }),

    updateAssetsPurchase: build.mutation({
      query: ({ id, data }) => ({
        url: `/assets-purchase/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["assets-purchase"],  // Invalidate the product tag after this mutation
    }),

    getAllAssetsPurchase: build.query({
      query: ({ page, limit, startDate, endDate, name,}) => ({
        url: "/assets-purchase",
        params: { page, limit, startDate, endDate, name,},  // Pass the page and limit as query params
      }),
      providesTags: ["assets-purchase"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),

    getAllAssetsPurchaseWithoutQuery: build.query({
      query: () => ({
        url: "/assets-purchase/all",
      }),
      providesTags: ["assets-purchase"],

      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
    
  }),
});

export const {
  useInsertAssetsPurchaseMutation,
  useGetAllAssetsPurchaseQuery,
  useDeleteAssetsPurchaseMutation,
  useUpdateAssetsPurchaseMutation,
  useGetAllAssetsPurchaseWithoutQueryQuery
} = assetsPurchaseApi;
