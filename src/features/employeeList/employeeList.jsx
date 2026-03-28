import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token"); // Modify this based on your token storage logic
};

export const employeeListApi = createApi({
  reducerPath: "employeeListApi",
  baseQuery: fetchBaseQuery({
    baseUrl: " https://apikafela.digitalever.com.bd/api/v1/",
    prepareHeaders: (headers) => {
      const token = getAuthToken(); // Fetch the token
      if (token) {
        // If the token exists, add it to the headers
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["EmployeeList"], // Define the tag type for invalidation and refetching
  endpoints: (build) => ({
    insertEmployeeList: build.mutation({
      query: (data) => ({
        url: "/employee-list/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["EmployeeList"], // Invalidate the EmployeeList tag after this mutation
    }),

    deleteEmployeeList: build.mutation({
      query: (id) => ({
        url: `/employee-list/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeList"], // Invalidate the EmployeeList tag after deletion
    }),
    getSingleEmployeeList: build.mutation({
      query: (id) => ({
        url: `/employee-list/${id}`,
        method: "GET",
      }),
      invalidatesTags: ["EmployeeList"], // Invalidate the EmployeeList tag after deletion
    }),

    updateEmployeeList: build.mutation({
      query: ({ id, data }) => ({
        url: `/employee-list/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["EmployeeList"], // Invalidate the EmployeeList tag after this mutation
    }),

    getAllEmployeeList: build.query({
      query: ({ page, limit, startDate, endDate, name }) => ({
        url: "/employee-list",
        params: { page, limit, startDate, endDate, name }, // Pass the page and limit as query params
      }),
      providesTags: ["EmployeeList"],
      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),

    getAllEmployeeListWithoutQuery: build.query({
      query: () => ({
        url: "/employee-list/all",
      }),
      providesTags: ["EmployeeList"],

      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useInsertEmployeeListMutation,
  useGetAllEmployeeListQuery,
  useDeleteEmployeeListMutation,
  useUpdateEmployeeListMutation,
  useGetAllEmployeeListWithoutQueryQuery,
  useGetSingleEmployeeListMutation,
} = employeeListApi;
