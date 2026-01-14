import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token"); // Modify this based on your token storage logic
};

export const assetsDamageApi = createApi({
  reducerPath: "assetsDamageApi",
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

  tagTypes: ["assets-damage"], // Define the tag type for invalidation and refetching
  endpoints: (build) => ({
    insertAssetsDamage: build.mutation({
      query: (data) => ({
        url: "/assets-damage/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["assets-damage"], // Invalidate the product tag after this mutation
    }),

    deleteAssetsDamage: build.mutation({
      query: (id) => ({
        url: `/assets-damage/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["assets-damage"], // Invalidate the product tag after deletion
    }),

    updateAssetsDamage: build.mutation({
      query: ({ id, data }) => ({
        url: `/assets-damage/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["assets-damage"], // Invalidate the product tag after this mutation
    }),

    getAllAssetsDamage: build.query({
      query: ({ page, limit, startDate, endDate, name }) => ({
        url: "/assets-damage",
        params: { page, limit, startDate, endDate, name }, // Pass the page and limit as query params
      }),
      providesTags: ["assets-damage"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),

    getAllAssetsDamageWithoutQuery: build.query({
      query: () => ({
        url: "/assets-damage/all",
      }),
      providesTags: ["assets-damage"],

      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useGetAllAssetsDamageQuery,
  useInsertAssetsDamageMutation,
  useUpdateAssetsDamageMutation,
  useDeleteAssetsDamageMutation,
  useGetAllAssetsDamageWithoutQueryQuery,
} = assetsDamageApi;
