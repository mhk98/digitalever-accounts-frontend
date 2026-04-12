import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAuthToken = () => localStorage.getItem("token");

export const designationApi = createApi({
  reducerPath: "designationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1",
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Designation"],
  endpoints: (build) => ({
    createDesignation: build.mutation({
      query: (data) => ({
        url: "/designation/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Designation"],
    }),
    updateDesignation: build.mutation({
      query: ({ id, data }) => ({
        url: `/designation/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Designation"],
    }),
    deleteDesignation: build.mutation({
      query: (id) => ({
        url: `/designation/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Designation"],
    }),
    getAllDesignations: build.query({
      query: (params) => ({
        url: "/designation",
        params,
      }),
      providesTags: ["Designation"],
      refetchOnMountOrArgChange: true,
    }),
  }),
});

export const {
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
  useGetAllDesignationsQuery,
} = designationApi;
