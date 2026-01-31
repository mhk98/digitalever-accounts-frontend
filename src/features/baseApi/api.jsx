import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAuthToken = () => localStorage.getItem("token");

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.digitalever.com.bd/api/v1/",
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
    credentials: "include",
  }),

  // ✅ add all modules here
  tagTypes: [
    "AssetsPurchase",
    "AssetsSale",
    "AssetsDamage",
    "ReceivedProduct",
    "PurchaseReturn",
    "InTransitProduct",
    "ReturnProduct",
    "DamageProduct",
    "DamageRepair",
  ],

  endpoints: () => ({}),
});
