import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAuthToken = () => localStorage.getItem("token");

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: " http://localhost:4000/api/v1/",
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
    "Overview",
    "InventoryOverview",
    "ReceivedProduct",
    "PurchaseReturn",
    "InTransitProduct",
    "ReturnProduct",
    "DamageProduct",
    "DamageRepair",
    "DamageRepaired",
    "InventorySummary",
    "ConfirmOrder",
    "PosReport",
    "SupplierHistory",
    "Manufacture",
    "ItemMaster",
    "StockAdjustment",
    "DamageRepairingStock",
    "EmployeeList",
    "ProfitLoss",
  ],

  endpoints: () => ({}),
});
