import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token"); // Modify this based on your token storage logic
};

export const confirmOrderApi = createApi({
  reducerPath: "confirmOrderApi",
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

  tagTypes: ["confirm-order"], // Define the tag type for invalidation and refetching
  endpoints: (build) => ({
    insertConfirmOrder: build.mutation({
      query: (data) => ({
        url: "/confirm-order/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["confirm-order"], // Invalidate the confirm-order tag after this mutation
    }),

    deleteConfirmOrder: build.mutation({
      query: (id) => ({
        url: `/confirm-order/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["confirm-order"], // Invalidate the confirm-order tag after deletion
    }),

    updateConfirmOrder: build.mutation({
      query: ({ id, data }) => ({
        url: `/confirm-order/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["confirm-order"], // Invalidate the confirm-order tag after this mutation
    }),

    getAllConfirmOrder: build.query({
      query: ({ page, limit, startDate, endDate, name, searchTerm }) => ({
        url: "/confirm-order",
        params: { page, limit, startDate, endDate, name, searchTerm }, // Pass the page and limit as query params
      }),
      providesTags: ["confirm-order"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),

    getAllConfirmOrderApiWithoutQuery: build.query({
      query: () => ({
        url: "/confirm-order/all",
      }),
      providesTags: ["confirm-order"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useInsertConfirmOrderMutation,
  useGetAllConfirmOrderApiWithoutQueryQuery,
  useDeleteConfirmOrderMutation,
  useUpdateConfirmOrderMutation,
  useGetAllConfirmOrderQuery,
} = confirmOrderApi;
