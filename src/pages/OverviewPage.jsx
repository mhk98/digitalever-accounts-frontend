// /* eslint-disable no-mixed-spaces-and-tabs */
// import { motion } from "framer-motion";
// import Header from "../components/common/Header";
// import StatCard from "../components/common/StatCard";
// import { useMemo } from "react";
// import { Truck, Receipt, Landmark } from "lucide-react";

// import { useGetAllAssetsSaleWithoutQueryQuery } from "../features/assetsSale/assetsSale";
// import { useGetAllAssetsPurchaseWithoutQueryQuery } from "../features/assetsPurchase/assetsPurchase"; // ✅ তোমার প্রকৃত path/hook নাম বসাও
// import { useGetAllInTransitProductWithoutQueryQuery } from "../features/inTransitProduct/inTransitProduct";
// import { useGetAllReturnProductWithoutQueryQuery } from "../features/returnProduct/returnProduct";
// import { useGetAllConfirmOrderApiWithoutQueryQuery } from "../features/confirmOrder/confirmOrder";
// import { useGetAllPurchaseReturnProductWithoutQueryQuery } from "../features/purchaseReturnProduct/purchaseReturnProduct";
// import { useGetAllMetaWithoutQueryQuery } from "../features/marketing/marketing";
// import { useGetAllReceiveableWithoutQueryQuery } from "../features/receiveable/receiveable";
// import { useGetAllPayableWithoutQueryQuery } from "../features/payable/payable";
// import { useGetAllReceivedProductWithoutQueryQuery } from "../features/receivedProduct/receivedProduct";
// import { useGetAllCashInOutWithoutQueryQuery } from "../features/cashInOut/cashInOut";

// const OverviewPage = () => {
//   // ✅ Digital Marketing Expense data
//   const {
//     data: metaRes,
//     isLoading: metaLoading,
//     isError: metaError,
//     error: metaErrObj,
//   } = useGetAllMetaWithoutQueryQuery();

//   const meta = metaRes?.data || [];

//   const totalMetaAmount = useMemo(() => {
//     return meta.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
//   }, [meta]);

//   if (metaError) console.error("Purchase error:", metaErrObj);

//   //Total Cash In Amount
//   const {
//     data: cashInRes,
//     isLoading: cashInLoading,
//     isError: cashInError,
//     error: cashInErrObj,
//   } = useGetAllCashInOutWithoutQueryQuery();

//   const cashIn = cashInRes?.data || [];

//   const totalCashInAmount = useMemo(() => {
//     return cashIn
//       .filter((item) => item.paymentStatus === "CashIn")
//       .reduce((sum, item) => sum + Number(item?.amount || 0), 0);
//   }, [cashIn]);

//   if (cashInError) console.error("Purchase error:", cashInErrObj);

//   //Total Cash Out Amount
//   const {
//     data: cashOutRes,
//     isLoading: cashOutLoading,
//     isError: cashOutError,
//     error: cashOutErrObj,
//   } = useGetAllCashInOutWithoutQueryQuery();

//   const cashOut = cashOutRes?.data || [];

//   const totalCashOutAmount = useMemo(() => {
//     return cashOut
//       .filter((item) => item.paymentStatus === "CashOut")
//       .reduce((sum, item) => sum + Number(item?.amount || 0), 0);
//   }, [cashOut]);

//   if (cashOutError) console.error("Purchase error:", cashOutErrObj);

//   // ✅ Receiveable data
//   const {
//     data: receiveableRes,
//     isLoading: receiveableLoading,
//     isError: receiveableError,
//     error: receiveableErrObj,
//   } = useGetAllReceiveableWithoutQueryQuery();

//   const receiveable = receiveableRes?.data || [];

//   const totalReceiveableAmount = useMemo(() => {
//     return receiveable.reduce(
//       (sum, item) => sum + Number(item?.amount || 0),
//       0
//     );
//   }, [receiveable]);

//   if (receiveableError) console.error("Purchase error:", receiveableErrObj);

//   // ✅ Payable data
//   const {
//     data: payableRes,
//     isLoading: payableLoading,
//     isError: payableError,
//     error: payableErrObj,
//   } = useGetAllPayableWithoutQueryQuery();

//   const payable = payableRes?.data || [];

//   const totalPayableAmount = useMemo(() => {
//     return payable.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
//   }, [payable]);

//   if (payableError) console.error("Purchase error:", payableErrObj);

//   // ✅ Purchase data
//   const {
//     data: purchaseRes,
//     isLoading: purchaseLoading,
//     isError: purchaseError,
//     error: purchaseErrObj,
//   } = useGetAllAssetsPurchaseWithoutQueryQuery();

//   const purchases = purchaseRes?.data || [];

//   const totalPurchaseAmount = useMemo(() => {
//     return purchases.reduce((sum, item) => sum + Number(item?.total || 0), 0);
//   }, [purchases]);

//   if (purchaseError) console.error("Purchase error:", purchaseErrObj);

//   // ✅ Sale data
//   const {
//     data: saleRes,
//     isLoading: saleLoading,
//     isError: saleError,
//     error: saleErrObj,
//   } = useGetAllAssetsSaleWithoutQueryQuery();

//   const sales = saleRes?.data || [];

//   const totalSaleAmount = useMemo(() => {
//     return sales.reduce((sum, item) => sum + Number(item?.total || 0), 0);
//   }, [sales]);

//   // ✅ remaining amount (purchase - sale)
//   const remainingAmount = useMemo(() => {
//     return totalPurchaseAmount - totalSaleAmount;
//   }, [totalPurchaseAmount, totalSaleAmount]);

//   if (saleError) console.error("Sale error:", saleErrObj);

//   const assetsLoading = purchaseLoading || saleLoading;

//   // Inventory Data

//   //Purchase Product
//   const {
//     data: receivedProductRes,
//     isLoading: receivedProductLoading,
//     isError: receivedProductError,
//     error: receivedProductErrObj,
//   } = useGetAllReceivedProductWithoutQueryQuery();

//   const receivedProducts = receivedProductRes?.data || [];

//   const totalReceivedProductAmount = useMemo(() => {
//     return receivedProducts.reduce(
//       (sum, item) => sum + Number(item?.quantity || 0),
//       0
//     );
//   }, [receivedProducts]);

//   //Purchase Return Product
//   const {
//     data: purchaseReturnProductRes,
//     isLoading: purchaseReturnProductLoading,
//     isError: purchaseReturnProductError,
//     error: purchaseReturnProductErrObj,
//   } = useGetAllPurchaseReturnProductWithoutQueryQuery();

//   const purchaseReturnProducts = purchaseReturnProductRes?.data || [];

//   const totalPurchaseReturnProductAmount = useMemo(() => {
//     return purchaseReturnProducts.reduce(
//       (sum, item) => sum + Number(item?.quantity || 0),
//       0
//     );
//   }, [purchaseReturnProducts]);

//   //Intransit Product
//   const {
//     data: intransitProductRes,
//     isLoading: intransitProductLoading,
//     isError: intransitProductError,
//     error: intransitProductErrObj,
//   } = useGetAllInTransitProductWithoutQueryQuery();

//   const intransitProducts = intransitProductRes?.data || [];

//   const totalIntransitProductAmount = useMemo(() => {
//     return intransitProducts.reduce(
//       (sum, item) => sum + Number(item?.quantity || 0),
//       0
//     );
//   }, [intransitProducts]);

//   //Intransit Product
//   const {
//     data: salesReturnProductRes,
//     isLoading: salesReturnProductLoading,
//     isError: salesReturnProductError,
//     error: salesReturnProductErrObj,
//   } = useGetAllReturnProductWithoutQueryQuery();

//   const salesReturnProducts = salesReturnProductRes?.data || [];

//   const totalSalesReturnProductAmount = useMemo(() => {
//     return salesReturnProducts.reduce(
//       (sum, item) => sum + Number(item?.quantity || 0),
//       0
//     );
//   }, [salesReturnProducts]);

//   //Intransit Product
//   const {
//     data: confirmOrderProductRes,
//     isLoading: confirmOrderProductLoading,
//     isError: confirmOrderProductError,
//     error: confirmOrderProductErrObj,
//   } = useGetAllConfirmOrderApiWithoutQueryQuery();

//   const confirmOrderProducts = confirmOrderProductRes?.data || [];

//   const totalConfirmOrderProductAmount = useMemo(() => {
//     return confirmOrderProducts.reduce(
//       (sum, item) => sum + Number(item?.quantity || 0),
//       0
//     );
//   }, [confirmOrderProducts]);

//   if (receivedProductError) console.error("Sale error:", receivedProductErrObj);
//   if (purchaseReturnProductError)
//     console.error("Sale error:", purchaseReturnProductErrObj);
//   if (intransitProductError)
//     console.error("Sale error:", intransitProductErrObj);
//   if (salesReturnProductError)
//     console.error("Sale error:", salesReturnProductErrObj);
//   if (confirmOrderProductError)
//     console.error("Sale error:", confirmOrderProductErrObj);

//   const inventoryLoading =
//     receivedProductLoading ||
//     purchaseReturnProductLoading ||
//     intransitProductLoading ||
//     salesReturnProductLoading ||
//     confirmOrderProductLoading;

//   // এখানে স্টক থাকা ত্রুটিযুক্ত বা অবিক্রিত প্রডাক্ট ফেরত দেওয়া হয়েছে + কুরিয়ারে থাকা প্রডাক্ট + অর্ডার কনফার্ম হওয়া প্রডাক্ট (আলাদাভাবে যোগ করা হয়েছে)
//   const totalInventoryExpense = Number(
//     totalPurchaseReturnProductAmount +
//       totalIntransitProductAmount +
//       totalConfirmOrderProductAmount
//   );

//   // স্যেসব প্রডাক্ট বিক্রি হয় নি বা ফেরত এসেছে। এগুলো স্টকে থাকা প্রডাক্টের সাথে সাথে যোগ করা হয়েছে।
//   const inventoryStock_AfterAdd_SalesReturnProduct = Number(
//     totalReceivedProductAmount + totalSalesReturnProductAmount
//   );

//   // স্টক থাকা ত্রুটিযুক্ত বা অবিক্রিত প্রডাক্ট ফেরত দেওয়া হয়েছে + কুরিয়ারে থাকা প্রডাক্ট + অর্ডার কনফার্ম হওয়া প্রডাক্ট - এগুলো বাদ দিয়ে বাকি স্টকে থাকা প্রডাক্ট আলাদা করা হয়েছে।
//   const remainingInventoryStock_AfterMinus_InventoryExpense =
//     inventoryStock_AfterAdd_SalesReturnProduct - totalInventoryExpense;

//   console.log("totalReceivedProductAmount", totalReceivedProductAmount);

//   return (
//     <div className="flex-1 overflow-auto relative z-10">
//       <Header title="Overview" />

//       <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
//         <motion.div
//           className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1 }}
//         >
//           <StatCard
//             name="Total Asset Value"
//             icon={Truck}
//             value={assetsLoading ? "Loading..." : remainingAmount.toFixed(2)}
//             color="#F59E0B"
//           />

//           <StatCard
//             name="Total Inventory Value"
//             icon={Receipt}
//             value={
//               inventoryLoading
//                 ? "Loading..."
//                 : remainingInventoryStock_AfterMinus_InventoryExpense
//             } // ✅ তোমার expense API থাকলে এখানে বসাবে
//             color="#EF4444"
//           />
//           <StatCard
//             name="Total Marketing Expense"
//             icon={Receipt}
//             value={metaLoading ? "Loading..." : totalMetaAmount} // ✅ তোমার expense API থাকলে এখানে বসাবে
//             color="#EF4444"
//           />
//           <StatCard
//             name="Total Receiveable Amount"
//             icon={Receipt}
//             value={receiveableLoading ? "Loading..." : totalReceiveableAmount}
//             color="#EF4444"
//           />
//           <StatCard
//             name="Total Payable Amount"
//             icon={Receipt}
//             value={payableLoading ? "Loading..." : totalPayableAmount}
//             // ✅ তোমার expense API থাকলে এখানে বসাবে
//             color="#EF4444"
//           />

//           <StatCard
//             name="Total Cash In Amount"
//             icon={Landmark}
//             value={cashInLoading ? "Loading..." : totalCashInAmount}
//             color="#8B5CF6"
//           />
//           <StatCard
//             name="Total Cash Out Amount"
//             icon={Landmark}
//             value={cashOutLoading ? "Loading..." : totalCashOutAmount}
//             color="#8B5CF6"
//           />
//         </motion.div>
//       </main>
//     </div>
//   );
// };

// export default OverviewPage;

/* eslint-disable no-mixed-spaces-and-tabs */
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { useMemo, useState } from "react";
import { Truck, Receipt, Landmark } from "lucide-react";
import { useGetOverviewSummaryQuery } from "../features/overview/overview";

// ✅ helper: default range (এই মাসের ১ তারিখ → আজ)
const getDefaultRange = () => {
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const from = `${yyyy}-${mm}-01`;
  const to = `${yyyy}-${mm}-${dd}`;
  return { from, to };
};

const OverviewPage = () => {
  const defaultRange = useMemo(() => getDefaultRange(), []);

  // ✅ input values
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);

  // ✅ applied range (Apply না চাপা পর্যন্ত API call হবে না)
  const [applied, setApplied] = useState(defaultRange);

  const {
    data: summaryRes,
    isLoading,
    isError,
    error,
  } = useGetOverviewSummaryQuery({ from: applied.from, to: applied.to });

  const summary = summaryRes?.data || {};

  const onApply = () => {
    if (!from || !to) return;
    setApplied({ from, to });
  };

  const onReset = () => {
    const d = getDefaultRange();
    setFrom(d.from);
    setTo(d.to);
    setApplied(d);
  };

  if (isError) console.error("Overview Summary error:", error);

  // ✅ values (fallback 0)
  const remainingAmount = Number(summary?.remainingAmount || 0);
  const inventoryValue = Number(
    summary?.remainingInventoryStock_AfterMinus_InventoryExpense || 0
  );
  const totalMetaAmount = Number(summary?.totalMetaAmount || 0);
  const totalReceiveableAmount = Number(summary?.totalReceiveableAmount || 0);
  const totalPayableAmount = Number(summary?.totalPayableAmount || 0);
  const totalCashInAmount = Number(summary?.totalCashInAmount || 0);
  const totalCashOutAmount = Number(summary?.totalCashOutAmount || 0);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Overview" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* ✅ Date Range Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center  mb-6 w-full mx-auto">
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-1">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-1">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
              />
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={onApply}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              >
                Apply
              </button>
              <button
                onClick={onReset}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
            <div className="text-sm text-gray-400 text-right">
              Showing: <span className="text-gray-200">{applied.from}</span> to{" "}
              <span className="text-gray-200">{applied.to}</span>
            </div>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Asset Value"
            icon={Truck}
            value={isLoading ? "Loading..." : remainingAmount.toFixed(2)}
            color="#F59E0B"
          />

          <StatCard
            name="Total Inventory Quantity"
            icon={Receipt}
            value={isLoading ? "Loading..." : inventoryValue}
            color="#EF4444"
          />

          <StatCard
            name="Total Marketing Expense"
            icon={Receipt}
            value={isLoading ? "Loading..." : totalMetaAmount.toFixed(2)}
            color="#EF4444"
          />

          <StatCard
            name="Total Receiveable Amount"
            icon={Receipt}
            value={isLoading ? "Loading..." : totalReceiveableAmount.toFixed(2)}
            color="#EF4444"
          />

          <StatCard
            name="Total Payable Amount"
            icon={Receipt}
            value={isLoading ? "Loading..." : totalPayableAmount.toFixed(2)}
            color="#EF4444"
          />

          <StatCard
            name="Total Cash In Amount"
            icon={Landmark}
            value={isLoading ? "Loading..." : totalCashInAmount.toFixed(2)}
            color="#8B5CF6"
          />

          <StatCard
            name="Total Cash Out Amount"
            icon={Landmark}
            value={isLoading ? "Loading..." : totalCashOutAmount.toFixed(2)}
            color="#8B5CF6"
          />
        </motion.div>
      </main>
    </div>
  );
};

export default OverviewPage;
