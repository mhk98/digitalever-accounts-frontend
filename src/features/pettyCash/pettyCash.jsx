import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token");  // Modify this based on your token storage logic
};

export const pettyCashApi = createApi({
  reducerPath: "pettyCashApi",
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

  tagTypes: ["petty-cash"], // Define the tag type for invalidation and refetching
  endpoints: (build) => ({
    insertPettyCash: build.mutation({
      query: (data) => ({
        url: "/petty-cash/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["petty-cash"],  // Invalidate the PettyCash tag after this mutation
    }),

    deletePettyCash: build.mutation({
      query: (id) => ({
        url: `/petty-cash/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["petty-cash"],  // Invalidate the PettyCash tag after deletion
    }),

    updatePettyCash: build.mutation({
      query: ({ id, data }) => ({
        url: `/petty-cash/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["petty-cash"],  // Invalidate the PettyCash tag after this mutation
    }),

     getAllPettyCash: build.query({
      query: ({ page, limit, startDate, endDate, productId,}) => ({
        url: "/petty-cash",
        params: { page, limit, startDate, endDate, productId,},  // Pass the page and limit as query params
      }),
      providesTags: ["petty-cash"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),

    getAllPettyCashWithoutQuery: build.query({
      query: () => ({
        url: "/petty-cash/all",
      }),
      providesTags: ["petty-cash"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
    
  }),
});

export const {
  useGetAllPettyCashQuery,
  useGetAllPettyCashWithoutQueryQuery,
  useDeletePettyCashMutation,
  useUpdatePettyCashMutation,
  useInsertPettyCashMutation,
} = pettyCashApi;
