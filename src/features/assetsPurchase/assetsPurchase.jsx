// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseApi } from "../baseApi/api";

// // Helper function to get the auth token
// const getAuthToken = () => {
//   return localStorage.getItem("token"); // Modify this based on your token storage logic
// };

// export const assetsPurchaseApi = createApi({
//   reducerPath: "assetsPurchaseApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "https://api.digitalever.com.bd/api/v1/",
//     prepareHeaders: (headers) => {
//       const token = getAuthToken(); // Fetch the token
//       if (token) {
//         // If the token exists, add it to the headers
//         headers.set("Authorization", `Bearer ${token}`);
//       }
//       return headers;
//     },
//     credentials: "include",
//   }),

//   tagTypes: ["assets-purchase", "assets-sale"], // Define the tag type for invalidation and refetching
//   endpoints: (build) => ({
//     insertAssetsPurchase: build.mutation({
//       query: (data) => ({
//         url: "/assets-purchase/create",
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: ["assets-purchase", "assets-sale"], // Invalidate the product tag after this mutation
//     }),

//     deleteAssetsPurchase: build.mutation({
//       query: (id) => ({
//         url: `/assets-purchase/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["assets-purchase", "assets-sale"], // Invalidate the product tag after deletion
//     }),

//     updateAssetsPurchase: build.mutation({
//       query: ({ id, data }) => ({
//         url: `/assets-purchase/${id}`,
//         method: "PATCH",
//         body: data,
//       }),
//       invalidatesTags: ["assets-purchase", "assets-sale"], // Invalidate the product tag after this mutation
//     }),

//     getAllAssetsPurchase: build.query({
//       query: ({ page, limit, startDate, endDate, name }) => ({
//         url: "/assets-purchase",
//         params: { page, limit, startDate, endDate, name }, // Pass the page and limit as query params
//       }),
//       providesTags: ["assets-purchase", "assets-sale"],
//       refetchOnMountOrArgChange: true,
//       pollingInterval: 1000,
//     }),

//     getAllAssetsPurchaseWithoutQuery: build.query({
//       query: () => ({
//         url: "/assets-purchase/all",
//       }),
//       providesTags: ["assets-purchase", "assets-sale"],

//       refetchOnMountOrArgChange: true,
//       pollingInterval: 1000,
//     }),
//   }),
// });

// export const {
//   useInsertAssetsPurchaseMutation,
//   useGetAllAssetsPurchaseQuery,
//   useDeleteAssetsPurchaseMutation,
//   useUpdateAssetsPurchaseMutation,
//   useGetAllAssetsPurchaseWithoutQueryQuery,
// } = assetsPurchaseApi;

export const assetsPurchaseApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    insertAssetsPurchase: build.mutation({
      query: (data) => ({
        url: "assets-purchase/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "AssetsPurchase", id: "LIST" },
        { type: "AssetsSale", id: "LIST" }, // optional
      ],
    }),

    deleteAssetsPurchase: build.mutation({
      query: (id) => ({
        url: `assets-purchase/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "AssetsPurchase", id: "LIST" },
        { type: "AssetsSale", id: "LIST" }, // optional
      ],
    }),

    updateAssetsPurchase: build.mutation({
      query: ({ id, data }) => ({
        url: `assets-purchase/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "AssetsPurchase", id: "LIST" },
        { type: "AssetsPurchase", id: arg.id },
        { type: "AssetsSale", id: "LIST" }, // optional
      ],
    }),

    getAllAssetsPurchase: build.query({
      query: ({ page, limit, startDate, endDate, name }) => ({
        url: "assets-purchase",
        params: { page, limit, startDate, endDate, name },
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              { type: "AssetsPurchase", id: "LIST" },
              ...result.data.map((r) => ({ type: "AssetsPurchase", id: r.Id })),
            ]
          : [{ type: "AssetsPurchase", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),

    getAllAssetsPurchaseWithoutQuery: build.query({
      query: () => ({
        url: "assets-purchase/all",
      }),
      providesTags: [{ type: "AssetsPurchase", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),
  }),

  overrideExisting: false,
});

export const {
  useInsertAssetsPurchaseMutation,
  useGetAllAssetsPurchaseQuery,
  useDeleteAssetsPurchaseMutation,
  useUpdateAssetsPurchaseMutation,
  useGetAllAssetsPurchaseWithoutQueryQuery,
} = assetsPurchaseApi;
