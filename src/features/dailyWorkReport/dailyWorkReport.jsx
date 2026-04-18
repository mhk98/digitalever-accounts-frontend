import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAuthToken = () => localStorage.getItem("token");

export const dailyWorkReportApi = createApi({
  reducerPath: "dailyWorkReportApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://apikafela.digitalever.com.bd/api/v1",
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["DailyWorkReport"],
  endpoints: (build) => ({
    createDailyWorkReport: build.mutation({
      query: (data) => ({
        url: "/daily-work-reports/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DailyWorkReport"],
    }),
    updateDailyWorkReport: build.mutation({
      query: ({ id, data }) => ({
        url: `/daily-work-reports/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["DailyWorkReport"],
    }),
    reviewDailyWorkReport: build.mutation({
      query: ({ id, data }) => ({
        url: `/daily-work-reports/${id}/review`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["DailyWorkReport"],
    }),
    sendDailyWorkReportReminders: build.mutation({
      query: (data) => ({
        url: "/daily-work-reports/send-reminders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DailyWorkReport"],
    }),
    getMyDailyWorkReports: build.query({
      query: (params = {}) => ({
        url: "/daily-work-reports/me",
        params,
      }),
      providesTags: ["DailyWorkReport"],
      refetchOnMountOrArgChange: true,
    }),
    getAllDailyWorkReports: build.query({
      query: (params = {}) => ({
        url: "/daily-work-reports",
        params,
      }),
      providesTags: ["DailyWorkReport"],
      refetchOnMountOrArgChange: true,
    }),
    getSingleDailyWorkReport: build.query({
      query: (id) => ({
        url: `/daily-work-reports/${id}`,
      }),
      providesTags: ["DailyWorkReport"],
      refetchOnMountOrArgChange: true,
    }),
  }),
});

export const {
  useCreateDailyWorkReportMutation,
  useUpdateDailyWorkReportMutation,
  useReviewDailyWorkReportMutation,
  useSendDailyWorkReportRemindersMutation,
  useGetMyDailyWorkReportsQuery,
  useGetAllDailyWorkReportsQuery,
  useGetSingleDailyWorkReportQuery,
} = dailyWorkReportApi;
