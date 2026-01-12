import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("token"); // You can use sessionStorage or other storage methods as well
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1/",

    // This will attach the token to every request that requires authorization
    prepareHeaders: (headers) => {
      const token = getAuthToken(); // Retrieve token from storage
      if (token) {
        headers.set("Authorization", `Bearer ${token}`); // Add token to headers if available
      }
      return headers;
    },
  }),
  tagTypes: ["auth"],
  endpoints: (build) => ({
    userLogin: build.mutation({
      query: (loginData) => ({
        url: "/user/login",
        method: "POST",
        body: loginData,
      }),
      invalidatesTags: ["auth"],
    }),

    userRegister: build.mutation({
      query: (registerData) => ({
        url: "/user/register",
        method: "POST",
        body: registerData,
      }),
      invalidatesTags: ["auth"],
    }),

    userDelete: build.mutation({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["auth"],
    }),

    userUpdate: build.mutation({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    singleUser: build.mutation({
      query: (id) => ({
        url: `/user/${id}`,
      }),
      providesTags: ["auth"],
    }),

    getAllUser: build.query({
      query: ({ page, limit, searchTerm }) => ({
        url: "/user",
        params: { page, limit, searchTerm },
      }),
      providesTags: ["auth"],

      refetchOnMountOrArgChange: true,
      pollingInterval: 1000,
    }),
  }),
});

// Export hooks to use in your components
export const {
  useGetAllUserQuery,
  useUserRegisterMutation,
  useUserLoginMutation,
  useUserDeleteMutation,
  useUserUpdateMutation,
  useSingleUserMutation,
} = authApi;
