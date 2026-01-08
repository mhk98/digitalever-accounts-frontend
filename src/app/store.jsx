// import cartSlice from "@/Redux-Thunk/reducers/cartSlice";

import { configureStore } from "@reduxjs/toolkit";
import { productApi } from "../features/product/product";
import { authApi } from "../features/auth/auth";
import { receivedProductApi } from "../features/receivedProduct/receivedProduct";
import { inTransitProductApi } from "../features/inTransitProduct/inTransitProduct";
import { returnProductApi } from "../features/returnProduct/inTransitProduct";
import { metaApi } from "../features/marketing/marketing";
import { assetsPurchaseApi } from "../features/assetsPurchase/assetsPurchase";
import { assetsSaleApi } from "../features/assetsSale/assetsSale";
import { confirmOrderApi } from "../features/confirmOrder/confirmOrder";
import { pettyCashApi } from "../features/pettyCash/pettyCash";
import { expenseApi } from "../features/expense/expense";
import { bookApi } from "../features/book/book";
import { cashInOutApi } from "../features/cashInOut/cashInOut";










const store = configureStore({
  reducer: {
    [productApi.reducerPath]: productApi.reducer,
    [receivedProductApi.reducerPath]: receivedProductApi.reducer,
    [inTransitProductApi.reducerPath]: inTransitProductApi.reducer,
    [returnProductApi.reducerPath]: returnProductApi.reducer,
    [confirmOrderApi.reducerPath]: confirmOrderApi.reducer,
    [metaApi.reducerPath]: metaApi.reducer,
    [assetsPurchaseApi.reducerPath]: assetsPurchaseApi.reducer,
    [assetsSaleApi.reducerPath]: assetsSaleApi.reducer,
    [cashInOutApi.reducerPath]: cashInOutApi.reducer,
    [pettyCashApi.reducerPath]: pettyCashApi.reducer,
    [expenseApi.reducerPath]: expenseApi.reducer,
    [bookApi.reducerPath]: bookApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
   
  

  
  
  
 
  },

  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
        productApi.middleware,
        receivedProductApi.middleware,
        inTransitProductApi.middleware,
        returnProductApi.middleware,
        confirmOrderApi.middleware,
        metaApi.middleware,
        assetsPurchaseApi.middleware,
        assetsSaleApi.middleware,
        cashInOutApi.middleware,
        pettyCashApi.middleware,
        expenseApi.middleware,
        bookApi.middleware,
        authApi.middleware,
    
     
     

    
      
    ),
});

export default store;