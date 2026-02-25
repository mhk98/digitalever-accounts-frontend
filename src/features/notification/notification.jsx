import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: " https://apiholygift.digitalever.com.bd/api/v1/",
  }),

  tagTypes: ["notification"], // Define the tag type
  endpoints: (build) => ({
    createNotification: build.mutation({
      query: (data) => ({
        url: "/notification/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["notification"],
    }),

    updateNotification: build.mutation({
      query: ({ id, userId }) => ({
        url: `/notification/${id}/read`,
        method: "PUT",
        body: { userId },
      }),
      invalidatesTags: ["notification"],
    }),

    getDataById: build.query({
      query: ({ userId, page, limit }) => ({
        url: `/notification/${userId}`,
        params: {
          page,
          limit,
        },
      }),
      providesTags: ["notification"],
      pollingInterval: 1000,
    }),
  }),
});

export const {
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useGetDataByIdQuery,
} = notificationApi;
