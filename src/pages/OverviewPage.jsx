/* eslint-disable no-mixed-spaces-and-tabs */
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { useMemo } from "react";
import { Truck, Receipt, Landmark } from "lucide-react";

import { useGetAllAssetsSaleWithoutQueryQuery } from "../features/assetsSale/assetsSale";
import { useGetAllAssetsPurchaseWithoutQueryQuery } from "../features/assetsPurchase/assetsPurchase"; // ✅ তোমার প্রকৃত path/hook নাম বসাও
import { useGetAllInTransitProductWithoutQueryQuery } from "../features/inTransitProduct/inTransitProduct";
import { useGetAllReturnProductWithoutQueryQuery } from "../features/returnProduct/returnProduct";
import { useGetAllConfirmOrderApiWithoutQueryQuery } from "../features/confirmOrder/confirmOrder";
import { useGetAllPurchaseReturnProductWithoutQueryQuery } from "../features/purchaseReturnProduct/purchaseReturnProduct";
import { useGetAllMetaWithoutQueryQuery } from "../features/marketing/marketing";
import { useGetAllReceiveableWithoutQueryQuery } from "../features/receiveable/receiveable";
import { useGetAllPayableWithoutQueryQuery } from "../features/payable/payable";
import { useGetAllReceivedProductWithoutQueryQuery } from "../features/receivedProduct/receivedProduct";

const OverviewPage = () => {
  // ✅ Digital Marketing Expense data
  const {
    data: metaRes,
    isLoading: metaLoading,
    isError: metaError,
    error: metaErrObj,
  } = useGetAllMetaWithoutQueryQuery();

  const meta = metaRes?.data || [];

  const totalMetaAmount = useMemo(() => {
    return meta.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
  }, [meta]);

  if (metaError) console.error("Purchase error:", metaErrObj);

  // ✅ Receiveable data
  const {
    data: receiveableRes,
    isLoading: receiveableLoading,
    isError: receiveableError,
    error: receiveableErrObj,
  } = useGetAllReceiveableWithoutQueryQuery();

  const receiveable = receiveableRes?.data || [];

  const totalReceiveableAmount = useMemo(() => {
    return receiveable.reduce(
      (sum, item) => sum + Number(item?.amount || 0),
      0
    );
  }, [receiveable]);

  if (receiveableError) console.error("Purchase error:", receiveableErrObj);

  // ✅ Payable data
  const {
    data: payableRes,
    isLoading: payableLoading,
    isError: payableError,
    error: payableErrObj,
  } = useGetAllPayableWithoutQueryQuery();

  const payable = payableRes?.data || [];

  const totalPayableAmount = useMemo(() => {
    return payable.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
  }, [payable]);

  if (payableError) console.error("Purchase error:", payableErrObj);

  // ✅ Purchase data
  const {
    data: purchaseRes,
    isLoading: purchaseLoading,
    isError: purchaseError,
    error: purchaseErrObj,
  } = useGetAllAssetsPurchaseWithoutQueryQuery();

  const purchases = purchaseRes?.data || [];

  const totalPurchaseAmount = useMemo(() => {
    return purchases.reduce((sum, item) => sum + Number(item?.total || 0), 0);
  }, [purchases]);

  if (purchaseError) console.error("Purchase error:", purchaseErrObj);

  // ✅ Sale data
  const {
    data: saleRes,
    isLoading: saleLoading,
    isError: saleError,
    error: saleErrObj,
  } = useGetAllAssetsSaleWithoutQueryQuery();

  const sales = saleRes?.data || [];

  const totalSaleAmount = useMemo(() => {
    return sales.reduce((sum, item) => sum + Number(item?.total || 0), 0);
  }, [sales]);

  // ✅ remaining amount (purchase - sale)
  const remainingAmount = useMemo(() => {
    return totalPurchaseAmount - totalSaleAmount;
  }, [totalPurchaseAmount, totalSaleAmount]);

  if (saleError) console.error("Sale error:", saleErrObj);

  const assetsLoading = purchaseLoading || saleLoading;

  // Inventory Data

  //Purchase Product
  const {
    data: receivedProductRes,
    isLoading: receivedProductLoading,
    isError: receivedProductError,
    error: receivedProductErrObj,
  } = useGetAllReceivedProductWithoutQueryQuery();

  const receivedProducts = receivedProductRes?.data || [];

  const totalReceivedProductAmount = useMemo(() => {
    return receivedProducts.reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0
    );
  }, [receivedProducts]);

  //Purchase Return Product
  const {
    data: purchaseReturnProductRes,
    isLoading: purchaseReturnProductLoading,
    isError: purchaseReturnProductError,
    error: purchaseReturnProductErrObj,
  } = useGetAllPurchaseReturnProductWithoutQueryQuery();

  const purchaseReturnProducts = purchaseReturnProductRes?.data || [];

  const totalPurchaseReturnProductAmount = useMemo(() => {
    return purchaseReturnProducts.reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0
    );
  }, [purchaseReturnProducts]);

  //Intransit Product
  const {
    data: intransitProductRes,
    isLoading: intransitProductLoading,
    isError: intransitProductError,
    error: intransitProductErrObj,
  } = useGetAllInTransitProductWithoutQueryQuery();

  const intransitProducts = intransitProductRes?.data || [];

  const totalIntransitProductAmount = useMemo(() => {
    return intransitProducts.reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0
    );
  }, [intransitProducts]);

  //Intransit Product
  const {
    data: salesReturnProductRes,
    isLoading: salesReturnProductLoading,
    isError: salesReturnProductError,
    error: salesReturnProductErrObj,
  } = useGetAllReturnProductWithoutQueryQuery();

  const salesReturnProducts = salesReturnProductRes?.data || [];

  const totalSalesReturnProductAmount = useMemo(() => {
    return salesReturnProducts.reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0
    );
  }, [salesReturnProducts]);

  //Intransit Product
  const {
    data: confirmOrderProductRes,
    isLoading: confirmOrderProductLoading,
    isError: confirmOrderProductError,
    error: confirmOrderProductErrObj,
  } = useGetAllConfirmOrderApiWithoutQueryQuery();

  const confirmOrderProducts = confirmOrderProductRes?.data || [];

  const totalConfirmOrderProductAmount = useMemo(() => {
    return confirmOrderProducts.reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0
    );
  }, [confirmOrderProducts]);

  if (receivedProductError) console.error("Sale error:", receivedProductErrObj);
  if (purchaseReturnProductError)
    console.error("Sale error:", purchaseReturnProductErrObj);
  if (intransitProductError)
    console.error("Sale error:", intransitProductErrObj);
  if (salesReturnProductError)
    console.error("Sale error:", salesReturnProductErrObj);
  if (confirmOrderProductError)
    console.error("Sale error:", confirmOrderProductErrObj);

  const inventoryLoading =
    receivedProductLoading ||
    purchaseReturnProductLoading ||
    intransitProductLoading ||
    salesReturnProductLoading ||
    confirmOrderProductLoading;

  // এখানে স্টক থাকা ত্রুটিযুক্ত বা অবিক্রিত প্রডাক্ট ফেরত দেওয়া হয়েছে + কুরিয়ারে থাকা প্রডাক্ট + অর্ডার কনফার্ম হওয়া প্রডাক্ট (আলাদাভাবে যোগ করা হয়েছে)
  const totalInventoryExpense = Number(
    totalPurchaseReturnProductAmount +
      totalIntransitProductAmount +
      totalConfirmOrderProductAmount
  );

  // স্যেসব প্রডাক্ট বিক্রি হয় নি বা ফেরত এসেছে। এগুলো স্টকে থাকা প্রডাক্টের সাথে সাথে যোগ করা হয়েছে।
  const inventoryStock_AfterAdd_SalesReturnProduct = Number(
    totalReceivedProductAmount + totalSalesReturnProductAmount
  );

  // স্টক থাকা ত্রুটিযুক্ত বা অবিক্রিত প্রডাক্ট ফেরত দেওয়া হয়েছে + কুরিয়ারে থাকা প্রডাক্ট + অর্ডার কনফার্ম হওয়া প্রডাক্ট - এগুলো বাদ দিয়ে বাকি স্টকে থাকা প্রডাক্ট আলাদা করা হয়েছে।
  const remainingInventoryStock_AfterMinus_InventoryExpense =
    inventoryStock_AfterAdd_SalesReturnProduct - totalInventoryExpense;

  console.log("totalReceivedProductAmount", totalReceivedProductAmount);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Overview" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Asset Value"
            icon={Truck}
            value={assetsLoading ? "Loading..." : remainingAmount.toFixed(2)}
            color="#F59E0B"
          />

          <StatCard
            name="Total Inventory Value"
            icon={Receipt}
            value={
              inventoryLoading
                ? "Loading..."
                : remainingInventoryStock_AfterMinus_InventoryExpense
            } // ✅ তোমার expense API থাকলে এখানে বসাবে
            color="#EF4444"
          />
          <StatCard
            name="Total Marketing Expense"
            icon={Receipt}
            value={metaLoading ? "Loading..." : totalMetaAmount} // ✅ তোমার expense API থাকলে এখানে বসাবে
            color="#EF4444"
          />
          <StatCard
            name="Total Receiveable Amount"
            icon={Receipt}
            value={receiveableLoading ? "Loading..." : totalReceiveableAmount}
            color="#EF4444"
          />
          <StatCard
            name="Total Payable Amount"
            icon={Receipt}
            value={payableLoading ? "Loading..." : totalPayableAmount}
            // ✅ তোমার expense API থাকলে এখানে বসাবে
            color="#EF4444"
          />

          <StatCard
            name="Total Bank Amount"
            icon={Landmark}
            value={"0.00"} // ✅ তোমার bank API থাকলে এখানে বসাবে
            color="#8B5CF6"
          />
        </motion.div>
      </main>
    </div>
  );
};

export default OverviewPage;
