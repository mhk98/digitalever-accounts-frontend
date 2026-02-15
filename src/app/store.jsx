// // import cartSlice from "@/Redux-Thunk/reducers/cartSlice";

// import { configureStore } from "@reduxjs/toolkit";
// import { authApi } from "../features/auth/auth";
// import { receivedProductApi } from "../features/receivedProduct/receivedProduct";
// import { inTransitProductApi } from "../features/inTransitProduct/inTransitProduct";
// import { returnProductApi } from "../features/returnProduct/returnProduct";
// import { metaApi } from "../features/marketing/marketing";
// import { assetsPurchaseApi } from "../features/assetsPurchase/assetsPurchase";
// import { confirmOrderApi } from "../features/confirmOrder/confirmOrder";
// import { pettyCashApi } from "../features/pettyCash/pettyCash";
// import { expenseApi } from "../features/expense/expense";
// import { bookApi } from "../features/book/book";
// import { cashInOutApi } from "../features/cashInOut/cashInOut";
// import { purchaseReturnProductApi } from "../features/purchaseReturnProduct/purchaseReturnProduct";
// import { receiveableApi } from "../features/receiveable/receiveable";
// import { payableApi } from "../features/payable/payable";
// import { overviewApi } from "../features/overview/overview";
// import { assetsSaleApi } from "../features/assetsSale/assetsSale";
// import { assetsDamageApi } from "../features/assetsDamage/assetsDamage";
// import { supplierApi } from "../features/supplier/supplier";
// import { categoryApi } from "../features/category/category";
// import { damageProductApi } from "../features/damageProduct/damageProduct";
// import { productApi } from "../features/product/product";
// import { employeeApi } from "../features/employee/employee";
// import { notificationApi } from "../features/notification/notification";
// import { wirehouseApi } from "../features/wirehouse/wirehouse";
// import { salaryApi } from "../features/salary/salary";
// import { logoApi } from "../features/logo/logo";
// import { damageRepairApi } from "../features/damageRepair/damageRepair";

// const store = configureStore({
//   reducer: {
//     [productApi.reducerPath]: productApi.reducer,
//     [receivedProductApi.reducerPath]: receivedProductApi.reducer,
//     [inTransitProductApi.reducerPath]: inTransitProductApi.reducer,
//     [returnProductApi.reducerPath]: returnProductApi.reducer,
//     [purchaseReturnProductApi.reducerPath]: purchaseReturnProductApi.reducer,
//     [damageProductApi.reducerPath]: damageProductApi.reducer,
//     [confirmOrderApi.reducerPath]: confirmOrderApi.reducer,
//     [metaApi.reducerPath]: metaApi.reducer,
//     [assetsPurchaseApi.reducerPath]: assetsPurchaseApi.reducer,
//     [assetsSaleApi.reducerPath]: assetsSaleApi.reducer,
//     [assetsDamageApi.reducerPath]: assetsDamageApi.reducer,
//     [cashInOutApi.reducerPath]: cashInOutApi.reducer,
//     [pettyCashApi.reducerPath]: pettyCashApi.reducer,
//     [expenseApi.reducerPath]: expenseApi.reducer,
//     [bookApi.reducerPath]: bookApi.reducer,
//     [supplierApi.reducerPath]: supplierApi.reducer,
//     [wirehouseApi.reducerPath]: wirehouseApi.reducer,
//     [categoryApi.reducerPath]: categoryApi.reducer,
//     [receiveableApi.reducerPath]: receiveableApi.reducer,
//     [payableApi.reducerPath]: payableApi.reducer,
//     [overviewApi.reducerPath]: overviewApi.reducer,
//     [employeeApi.reducerPath]: employeeApi.reducer,
//     [notificationApi.reducerPath]: notificationApi.reducer,
//     [salaryApi.reducerPath]: salaryApi.reducer,
//     [logoApi.reducerPath]: logoApi.reducer,
//     [damageRepairApi.reducerPath]: damageRepairApi.reducer,
//     [authApi.reducerPath]: authApi.reducer,
//   },

//   // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),

//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(
//       productApi.middleware,
//       receivedProductApi.middleware,
//       inTransitProductApi.middleware,
//       returnProductApi.middleware,
//       purchaseReturnProductApi.middleware,
//       damageProductApi.middleware,
//       confirmOrderApi.middleware,
//       metaApi.middleware,
//       assetsPurchaseApi.middleware,
//       assetsSaleApi.middleware,
//       assetsDamageApi.middleware,
//       cashInOutApi.middleware,
//       pettyCashApi.middleware,
//       expenseApi.middleware,
//       bookApi.middleware,
//       supplierApi.middleware,
//       wirehouseApi.middleware,
//       categoryApi.middleware,
//       receiveableApi.middleware,
//       payableApi.middleware,
//       overviewApi.middleware,
//       employeeApi.middleware,
//       salaryApi.middleware,
//       logoApi.middleware,
//       damageRepairApi.middleware,
//       notificationApi.middleware,
//       authApi.middleware,
//     ),
// });

// export default store;

import { configureStore } from "@reduxjs/toolkit";

import { authApi } from "../features/auth/auth";
import { inTransitProductApi } from "../features/inTransitProduct/inTransitProduct";
import { returnProductApi } from "../features/returnProduct/returnProduct";
import { metaApi } from "../features/marketing/marketing";
import { assetsPurchaseApi } from "../features/assetsPurchase/assetsPurchase";
import { confirmOrderApi } from "../features/confirmOrder/confirmOrder";
import { pettyCashApi } from "../features/pettyCash/pettyCash";
import { expenseApi } from "../features/expense/expense";
import { bookApi } from "../features/book/book";
import { cashInOutApi } from "../features/cashInOut/cashInOut";
import { purchaseReturnProductApi } from "../features/purchaseReturnProduct/purchaseReturnProduct";
import { receiveableApi } from "../features/receiveable/receiveable";
import { payableApi } from "../features/payable/payable";
import { overviewApi } from "../features/overview/overview";
import { assetsSaleApi } from "../features/assetsSale/assetsSale";
import { assetsDamageApi } from "../features/assetsDamage/assetsDamage";
import { supplierApi } from "../features/supplier/supplier";
import { categoryApi } from "../features/category/category";
import { damageProductApi } from "../features/damageProduct/damageProduct";
import { productApi } from "../features/product/product";
import { employeeApi } from "../features/employee/employee";
import { notificationApi } from "../features/notification/notification";
import { wirehouseApi } from "../features/wirehouse/wirehouse";
import { salaryApi } from "../features/salary/salary";
import { logoApi } from "../features/logo/logo";
import { damageRepairApi } from "../features/damageRepair/damageRepair";
import { damageRepairedApi } from "../features/damageRepaired/damageRepaired";
import { purchaseRequisitionApi } from "../features/purchaseRequisition/purchaseRequisition";
import { receivedProductApi } from "../features/receivedProduct/receivedProduct";
import { assetsRequisitionApi } from "../features/assetsRequisition/assetsRequisition";
import { posReportApi } from "../features/posReport/posReport";
import { warrantyroductApi } from "../features/warrantyProduct/warrantyProduct";

// ✅ 1) Collect all apis once
const apis = [
  productApi,
  purchaseRequisitionApi,
  receivedProductApi,
  inTransitProductApi,
  returnProductApi,
  purchaseReturnProductApi,
  damageProductApi,
  confirmOrderApi,
  metaApi,
  assetsPurchaseApi,
  assetsRequisitionApi,
  assetsSaleApi,
  assetsDamageApi,
  cashInOutApi,
  pettyCashApi,
  expenseApi,
  bookApi,
  supplierApi,
  wirehouseApi,
  warrantyroductApi,
  categoryApi,
  receiveableApi,
  payableApi,
  overviewApi,
  employeeApi,
  notificationApi,
  salaryApi,
  logoApi,
  posReportApi,
  damageRepairApi,
  damageRepairedApi,
  authApi,
];

// ✅ 2) Build reducer map from apis
const reducer = Object.fromEntries(
  apis.map((api) => [api.reducerPath, api.reducer]),
);

// ✅ 3) Unique middleware only (no duplicates)
const apiMiddlewares = [...new Set(apis.map((api) => api.middleware))];

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiMiddlewares),
});

export default store;
