import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAuthToken = () => localStorage.getItem("token");

export const holidayApi = createApi({
  reducerPath: "holidayApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1",
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Holiday"],
  endpoints: (build) => ({
    createHoliday: build.mutation({
      query: (data) => ({
        url: "/holiday/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Holiday"],
    }),
    updateHoliday: build.mutation({
      query: ({ id, data }) => ({
        url: `/holiday/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Holiday"],
    }),
    deleteHoliday: build.mutation({
      query: (id) => ({
        url: `/holiday/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Holiday"],
    }),
    getAllHolidays: build.query({
      query: (params) => ({
        url: "/holiday",
        params,
      }),
      providesTags: ["Holiday"],
      refetchOnMountOrArgChange: true,
    }),
  }),
});

export const {
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
  useGetAllHolidaysQuery,
} = holidayApi;
