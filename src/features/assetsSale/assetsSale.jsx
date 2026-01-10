import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token"); // Modify this based on your token storage logic
};

export const assetsSaleApi = createApi({
  reducerPath: "assetsSaleApi",
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

  tagTypes: ["assets-sale"], // Define the tag type for invalidation and refetching
  endpoints: (build) => ({
    insertAssetsSale: build.mutation({
      query: (data) => ({
        url: "/assets-sale/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["assets-sale"], // Invalidate the product tag after this mutation
    }),

    deleteAssetsSale: build.mutation({
      query: (id) => ({
        url: `/assets-sale/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["assets-sale"], // Invalidate the product tag after deletion
    }),

    updateAssetsSale: build.mutation({
      query: ({ id, data }) => ({
        url: `/assets-sale/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["assets-sale"], // Invalidate the product tag after this mutation
    }),

    getAllAssetsSale: build.query({
      query: ({ page, limit, startDate, endDate, name }) => ({
        url: "/assets-sale",
        params: { page, limit, startDate, endDate, name }, // Pass the page and limit as query params
      }),
      providesTags: ["assets-sale"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),

    getAllAssetsSaleWithoutQuery: build.query({
      query: () => ({
        url: "/assets-sale/all",
      }),
      providesTags: ["assets-sale"],

      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useInsertAssetsSaleMutation,
  useGetAllAssetsSaleQuery,
  useDeleteAssetsSaleMutation,
  useUpdateAssetsSaleMutation,
  useGetAllAssetsSaleWithoutQueryQuery,
} = assetsSaleApi;
