// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseApi } from "../baseApi/api";

// // Helper function to get the auth token
// const getAuthToken = () => {
//   return localStorage.getItem("token"); // Modify this based on your token storage logic
// };

// export const receivedProductApi = createApi({
//   reducerPath: "receivedProductApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: " http://localhost:5000/api/v1/",
//     prepareHeaders: (headers) => {
//       const token = getAuthToken(); // Fetch the token
//       if (token) {
//         // If the token exists, add it to the headers
//         headers.set("Authorization", `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),

//   tagTypes: ["received-product"], // Define the tag type for invalidation and refetching
//   endpoints: (build) => ({
//     insertReceivedProduct: build.mutation({
//       query: (data) => ({
//         url: "/received-product/create",
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: ["received-product"], // Invalidate the received-product tag after this mutation
//     }),

//     deleteReceivedProduct: build.mutation({
//       query: (id) => ({
//         url: `/received-product/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["received-product"], // Invalidate the received-product tag after deletion
//     }),

//     updateReceivedProduct: build.mutation({
//       query: ({ id, data }) => ({
//         url: `/received-product/${id}`,
//         method: "PATCH",
//         body: data,
//       }),
//       invalidatesTags: ["received-product"], // Invalidate the received-product tag after this mutation
//     }),

//     getAllReceivedProduct: build.query({
//       query: ({ page, limit, startDate, endDate, name }) => ({
//         url: "/received-product",
//         params: { page, limit, startDate, endDate, name }, // Pass the page and limit as query params
//       }),
//       providesTags: ["received-product"],
//       refetchOnMountOrArgChange: true,
//       pollingInterval: 1000,
//     }),

//     getAllReceivedProductWithoutQuery: build.query({
//       query: () => ({
//         url: "/received-product/all",
//       }),
//       providesTags: ["received-product"],
//       refetchOnMountOrArgChange: true,
//       pollingInterval: 1000,
//     }),
//   }),
// });

// export const {
//   useInsertReceivedProductMutation,
//   useGetAllReceivedProductQuery,
//   useDeleteReceivedProductMutation,
//   useUpdateReceivedProductMutation,
//   useGetAllReceivedProductWithoutQueryQuery,
// } = receivedProductApi;

export const receivedProductApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllReceivedProduct: build.query({
      query: (arg = {}) => {
        const { page, limit, startDate, endDate, searchTerm, name } = arg;

        const params = { page, limit, startDate, endDate, searchTerm, name };
        Object.keys(params).forEach((k) => {
          if (params[k] === undefined || params[k] === null || params[k] === "")
            delete params[k];
        });

        return { url: "/received-product", params };
      },

      // ✅ list + each row
      providesTags: (result) =>
        result?.data
          ? [
              { type: "ReceivedProduct", id: "LIST" },
              ...result.data.map((r) => ({
                type: "ReceivedProduct",
                id: r.Id,
              })),
            ]
          : [{ type: "ReceivedProduct", id: "LIST" }],

      refetchOnMountOrArgChange: true,
    }),

    getAllReceivedProductWithoutQuery: build.query({
      query: () => ({ url: "/received-product/all" }),
      providesTags: [{ type: "ReceivedProduct", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),

    insertReceivedProduct: build.mutation({
      query: (data) => ({
        url: "/received-product/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "ReceivedProduct", id: "LIST" }],
    }),

    updateReceivedProduct: build.mutation({
      query: ({ id, data }) => ({
        url: `/received-product/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "ReceivedProduct", id: arg.id },
        { type: "ReceivedProduct", id: "LIST" },
      ],
    }),

    deleteReceivedProduct: build.mutation({
      query: (id) => ({
        url: `/received-product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (res, err, id) => [
        { type: "ReceivedProduct", id },
        { type: "ReceivedProduct", id: "LIST" },
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAllReceivedProductQuery,
  useGetAllReceivedProductWithoutQueryQuery,
  useInsertReceivedProductMutation,
  useUpdateReceivedProductMutation,
  useDeleteReceivedProductMutation,
} = receivedProductApi;
