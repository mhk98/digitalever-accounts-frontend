// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// // Helper function to get the auth token
// const getAuthToken = () => {
//   return localStorage.getItem("token"); // Modify this based on your token storage logic
// };

// export const damageRepairApi = createApi({
//   reducerPath: "damageRepairApi",
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

//   tagTypes: ["damage-repair"], // Define the tag type for invalidation and refetching
//   endpoints: (build) => ({
//     insertDamageRepair: build.mutation({
//       query: (data) => ({
//         url: "/damage-repair/create",
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: ["damage-repair"], // Invalidate the damage-repair tag after this mutation
//     }),

//     deleteDamageRepair: build.mutation({
//       query: (id) => ({
//         url: `/damage-repair/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["damage-repair"], // Invalidate the damage-repair tag after deletion
//     }),

//     updateDamageRepair: build.mutation({
//       query: ({ id, data }) => ({
//         url: `/damage-repair/${id}`,
//         method: "PATCH",
//         body: data,
//       }),
//       invalidatesTags: ["damage-repair"], // Invalidate the damage-repair tag after this mutation
//     }),

//     getAllDamageRepair: build.query({
//       query: ({ page, limit, startDate, endDate, name }) => ({
//         url: "/damage-repair",
//         params: { page, limit, startDate, endDate, name }, // Pass the page and limit as query params
//       }),
//       providesTags: ["damage-repair"],
//       refetchOnMountOrArgChange: true,
//       pollingInterval: 1000,
//     }),

//     getAllDamageRepairWithoutQuery: build.query({
//       query: () => ({
//         url: "/damage-repair/all",
//       }),
//       providesTags: ["damage-repair"],
//       refetchOnMountOrArgChange: true,
//       pollingInterval: 1000,
//     }),
//   }),
// });

// export const {
//   useInsertDamageRepairMutation,
//   useGetAllDamageRepairQuery,
//   useDeleteDamageRepairMutation,
//   useUpdateDamageRepairMutation,
//   useGetAllDamageRepairWithoutQueryQuery,
// } = damageRepairApi;

import { baseApi } from "../baseApi/api";

export const damageRepairApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    insertDamageRepair: build.mutation({
      query: (data) => ({
        url: "/damage-repair/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "DamageRepair", id: "LIST" },
        { type: "DamageProduct", id: "LIST" }, // ✅ receive stock affected
      ],
    }),

    deleteDamageRepair: build.mutation({
      query: (id) => ({
        url: `/damage-repair/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (res, err, id) => [
        { type: "DamageRepair", id },
        { type: "DamageRepair", id: "LIST" },

        { type: "DamageProduct", id: "LIST" }, // ✅ stock return/update
      ],
    }),

    updateDamageRepair: build.mutation({
      query: ({ id, data }) => ({
        url: `/damage-repair/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "DamageRepair", id: arg.id },
        { type: "DamageRepair", id: "LIST" },

        { type: "DamageProduct", id: "LIST" }, // ✅ if update changes qty/status
      ],
    }),

    getAllDamageRepair: build.query({
      query: (arg = {}) => {
        const { page, limit, startDate, endDate, name, searchTerm } = arg;
        const params = { page, limit, startDate, endDate, name, searchTerm };

        Object.keys(params).forEach((k) => {
          if (params[k] === undefined || params[k] === null || params[k] === "")
            delete params[k];
        });

        return { url: "/damage-repair/", params };
      },
      providesTags: (result) =>
        result?.data
          ? [
              { type: "DamageRepair", id: "LIST" },
              ...result.data.map((r) => ({
                type: "DamageRepair",
                id: r.Id,
              })),
            ]
          : [{ type: "DamageRepair", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),

    getAllDamageRepairWithoutQuery: build.query({
      query: () => ({ url: "/damage-repair/all" }),
      providesTags: [{ type: "DamageRepair", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),
  }),
});

export const {
  useInsertDamageRepairMutation,
  useGetAllDamageRepairQuery,
  useDeleteDamageRepairMutation,
  useUpdateDamageRepairMutation,
  useGetAllDamageRepairWithoutQueryQuery,
} = damageRepairApi;
