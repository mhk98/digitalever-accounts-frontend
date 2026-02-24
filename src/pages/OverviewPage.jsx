// /* eslint-disable no-mixed-spaces-and-tabs */
// import { motion } from "framer-motion";
// import Header from "../components/common/Header";
// import StatCard from "../components/common/StatCard";
// import { useMemo, useState } from "react";
// import {
//   Truck,
//   Receipt,
//   Landmark,
//   CalendarDays,
//   RefreshCcw,
// } from "lucide-react";
// import { useGetOverviewSummaryQuery } from "../features/overview/overview";

// // ✅ helper: default range (এই মাসের ১ তারিখ → আজ)
// const getDefaultRange = () => {
//   const now = new Date();

//   const yyyy = now.getFullYear();
//   const mm = String(now.getMonth() + 1).padStart(2, "0");
//   const dd = String(now.getDate()).padStart(2, "0");

//   const from = `${yyyy}-${mm}-01`;
//   const to = `${yyyy}-${mm}-${dd}`;
//   return { from, to };
// };

// const OverviewPage = () => {
//   const defaultRange = useMemo(() => getDefaultRange(), []);

//   // ✅ input values
//   const [from, setFrom] = useState(defaultRange.from);
//   const [to, setTo] = useState(defaultRange.to);

//   // ✅ applied range (Apply না চাপা পর্যন্ত API call হবে না)
//   const [applied, setApplied] = useState(defaultRange);

//   const {
//     data: summaryRes,
//     isLoading,
//     isError,
//     error,
//   } = useGetOverviewSummaryQuery({ from: applied.from, to: applied.to });

//   const summary = summaryRes?.data || {};

//   console.log("summary", summary);

//   const onApply = () => {
//     if (!from || !to) return;
//     setApplied({ from, to });
//   };

//   const onReset = () => {
//     const d = getDefaultRange();
//     setFrom(d.from);
//     setTo(d.to);
//     setApplied(d);
//   };

//   if (isError) console.error("Overview Summary error:", error);

//   // ✅ values (fallback 0)
//   const totalPurchaseAmount = Number(summary?.totalPurchaseAmount || 0);
//   const inventoryOverview = Number(summary?.totalInventoryOverview || 0);
//   // const inventoryValue = Number(
//   //   summary?.inventoryStock_AfterAdd_SalesReturnProduct || 0,
//   // );
//   const totalMetaAmount = Number(summary?.totalMetaAmount || 0);
//   const totalReceiveableAmount = Number(summary?.totalReceiveableAmount || 0);
//   const totalPayableAmount = Number(summary?.totalPayableAmount || 0);
//   const totalCashInAmount = Number(summary?.totalCashInAmount || 0);
//   const totalCashOutAmount = Number(summary?.totalCashOutAmount || 0);

//   return (
//     <div className="flex-1 overflow-auto">
//       <Header title="Overview" />

//       {/* ✅ Page background */}
//       <main className="min-h-[calc(100vh-64px)] bg-slate-50">
//         <div className="max-w-8xl mx-auto px-4 lg:px-8 py-6">
//           {/* ✅ Top Bar (Date range modern) */}
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6">
//             <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//               <div className="flex items-center gap-2 text-slate-800">
//                 <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
//                   <CalendarDays size={18} className="text-slate-600" />
//                 </div>
//                 <div>
//                   <div className="text-sm font-semibold">Date Range</div>
//                   <div className="text-xs text-slate-500">
//                     Applied: <span className="font-medium">{applied.from}</span>{" "}
//                     → <span className="font-medium">{applied.to}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[160px_160px_auto] gap-3 items-end">
//                 <div className="flex flex-col">
//                   <label className="text-xs text-slate-500 mb-1">From</label>
//                   <input
//                     type="date"
//                     value={from}
//                     onChange={(e) => setFrom(e.target.value)}
//                     className="h-10 px-3 rounded-xl date-black-icon border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
//                   />
//                 </div>

//                 <div className="flex flex-col">
//                   <label className="text-xs text-slate-500 mb-1">To</label>
//                   <input
//                     type="date"
//                     value={to}
//                     onChange={(e) => setTo(e.target.value)}
//                     className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
//                   />
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     onClick={onApply}
//                     className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-[0.99] transition"
//                   >
//                     Apply
//                   </button>

//                   <button
//                     onClick={onReset}
//                     className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 active:scale-[0.99] transition flex items-center gap-2"
//                   >
//                     <RefreshCcw size={16} />
//                     Reset
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* ✅ Loading hint */}
//             <div className="mt-3 text-xs text-slate-500">
//               {isLoading ? "Updating overview..." : "Overview ready"}
//             </div>
//           </div>

//           {/* ✅ Stat Cards */}
//           <motion.div
//             className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
//             initial={{ opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.45 }}
//           >
//             <StatCard
//               name="Total Asset Value"
//               icon={Truck}
//               value={isLoading ? "Loading..." : totalPurchaseAmount.toFixed(2)}
//               iconBg="#EEF2FF"
//               iconColor="#4F46E5"
//             />

//             <StatCard
//               name="Total Inventory Amount"
//               icon={Receipt}
//               value={isLoading ? "Loading..." : inventoryOverview.toFixed(2)}
//               iconBg="#ECFDF5"
//               iconColor="#059669"
//             />

//             <StatCard
//               name="Total Marketing Expense"
//               icon={Receipt}
//               value={isLoading ? "Loading..." : totalMetaAmount.toFixed(2)}
//               iconBg="#E0F2FE"
//               iconColor="#0284C7"
//             />

//             <StatCard
//               name="Total Receiveable Amount"
//               icon={Receipt}
//               value={
//                 isLoading ? "Loading..." : totalReceiveableAmount.toFixed(2)
//               }
//               iconBg="#FFF7ED"
//               iconColor="#D97706"
//             />

//             <StatCard
//               name="Total Payable Amount"
//               icon={Receipt}
//               value={isLoading ? "Loading..." : totalPayableAmount.toFixed(2)}
//               iconBg="#FEE2E2"
//               iconColor="#DC2626"
//             />

//             <StatCard
//               name="Total Cash In Amount"
//               icon={Landmark}
//               value={isLoading ? "Loading..." : totalCashInAmount.toFixed(2)}
//               iconBg="#F3E8FF"
//               iconColor="#7C3AED"
//             />

//             <StatCard
//               name="Total Cash Out Amount"
//               icon={Landmark}
//               value={isLoading ? "Loading..." : totalCashOutAmount.toFixed(2)}
//               iconBg="#F3E8FF"
//               iconColor="#7C3AED"
//             />
//           </motion.div>
//         </div>
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
import {
  Truck,
  Receipt,
  Landmark,
  CalendarDays,
  RefreshCcw,
  TrendingUp,
  Package,
} from "lucide-react";
import { useGetOverviewSummaryQuery } from "../features/overview/overview";
import { useGetTrendingProductsQuery } from "../features/confirmOrder/confirmOrder"; // ✅ adjust path if needed

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
  const totalPurchaseAmount = Number(summary?.totalPurchaseAmount || 0);
  const inventoryOverview = Number(summary?.totalInventoryOverview || 0);
  const totalMetaAmount = Number(summary?.totalMetaAmount || 0);
  const totalReceiveableAmount = Number(summary?.totalReceiveableAmount || 0);
  const totalPayableAmount = Number(summary?.totalPayableAmount || 0);
  const totalCashInAmount = Number(summary?.totalCashInAmount || 0);
  const totalCashOutAmount = Number(summary?.totalCashOutAmount || 0);

  // =========================
  // ✅ Trending Products
  // =========================
  const [trendDays, setTrendDays] = useState(7);
  // const [trendSortBy, setTrendSortBy] = useState("soldQty"); // soldQty | revenue

  const {
    data: trendingRes,
    isLoading: trendingLoading,
    isError: trendingIsError,
    error: trendingErr,
    refetch: refetchTrending,
  } = useGetTrendingProductsQuery({
    days: trendDays,
    limit: 10,
    // sortBy: trendSortBy,
  });

  const trending = trendingRes?.data ?? [];

  if (trendingIsError) console.error("Trending error:", trendingErr);

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Overview" />

      {/* ✅ Page background */}
      <main className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="max-w-8xl mx-auto px-4 lg:px-8 py-6">
          {/* ✅ Top Bar (Date range modern) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <CalendarDays size={18} className="text-slate-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Date Range</div>
                  <div className="text-xs text-slate-500">
                    Applied: <span className="font-medium">{applied.from}</span>{" "}
                    → <span className="font-medium">{applied.to}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[160px_160px_auto] gap-3 items-end">
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 mb-1">From</label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="h-10 px-3 rounded-xl date-black-icon border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 mb-1">To</label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onApply}
                    className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-[0.99] transition"
                  >
                    Apply
                  </button>

                  <button
                    onClick={onReset}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 active:scale-[0.99] transition flex items-center gap-2"
                  >
                    <RefreshCcw size={16} />
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* ✅ Loading hint */}
            <div className="mt-3 text-xs text-slate-500">
              {isLoading ? "Updating overview..." : "Overview ready"}
            </div>
          </div>

          {/* ✅ Stat Cards */}
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <StatCard
              name="Total Asset Value"
              icon={Truck}
              value={isLoading ? "Loading..." : totalPurchaseAmount.toFixed(2)}
              iconBg="#EEF2FF"
              iconColor="#4F46E5"
            />

            <StatCard
              name="Total Inventory Amount"
              icon={Receipt}
              value={isLoading ? "Loading..." : inventoryOverview.toFixed(2)}
              iconBg="#ECFDF5"
              iconColor="#059669"
            />

            <StatCard
              name="Total Marketing Expense"
              icon={Receipt}
              value={isLoading ? "Loading..." : totalMetaAmount.toFixed(2)}
              iconBg="#E0F2FE"
              iconColor="#0284C7"
            />

            <StatCard
              name="Total Receiveable Amount"
              icon={Receipt}
              value={
                isLoading ? "Loading..." : totalReceiveableAmount.toFixed(2)
              }
              iconBg="#FFF7ED"
              iconColor="#D97706"
            />

            <StatCard
              name="Total Payable Amount"
              icon={Receipt}
              value={isLoading ? "Loading..." : totalPayableAmount.toFixed(2)}
              iconBg="#FEE2E2"
              iconColor="#DC2626"
            />

            <StatCard
              name="Total Cash In Amount"
              icon={Landmark}
              value={isLoading ? "Loading..." : totalCashInAmount.toFixed(2)}
              iconBg="#F3E8FF"
              iconColor="#7C3AED"
            />

            <StatCard
              name="Total Cash Out Amount"
              icon={Landmark}
              value={isLoading ? "Loading..." : totalCashOutAmount.toFixed(2)}
              iconBg="#F3E8FF"
              iconColor="#7C3AED"
            />
          </motion.div>

          {/* ✅ Trending Products (Modern) */}
          <motion.div
            className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            {/* Header */}
            <div className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <TrendingUp size={18} className="text-slate-700" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Trending Products
                  </div>
                  <div className="text-xs text-slate-500">
                    Based on Confirm Orders (last {trendDays} days)
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {/* Days dropdown */}
                <select
                  value={trendDays}
                  onChange={(e) => setTrendDays(Number(e.target.value))}
                  className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={15}>Last 15 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>

                {/* Sort toggle */}
                {/* <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTrendSortBy("soldQty")}
                    className={`h-10 px-3 text-sm font-semibold transition ${
                      trendSortBy === "soldQty"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    By Qty
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendSortBy("revenue")}
                    className={`h-10 px-3 text-sm font-semibold transition border-l border-slate-200 ${
                      trendSortBy === "revenue"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    By Revenue
                  </button>
                </div> */}

                {/* Refresh */}
                <button
                  type="button"
                  onClick={() => refetchTrending?.()}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 active:scale-[0.99] transition flex items-center gap-2"
                >
                  <RefreshCcw size={16} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5">
              {trendingLoading ? (
                <div className="text-sm text-slate-500">
                  Loading trending products...
                </div>
              ) : trendingIsError ? (
                <div className="text-sm text-red-600">
                  Failed to load trending products.
                </div>
              ) : trending.length === 0 ? (
                <div className="text-sm text-slate-500">No data found.</div>
              ) : (
                <div className="space-y-3">
                  {trending.map((row, idx) => {
                    const soldQty = Number(row?.soldQty || 0);
                    const revenue = Number(row?.revenue || 0);
                    const pName =
                      row?.product?.name || row?.name || "Unknown Product";

                    return (
                      <div
                        key={row?.productId ?? idx}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/40 px-4 py-3"
                      >
                        {/* Left */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                            <Package size={18} className="text-slate-700" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                                #{idx + 1}
                              </span>
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                {pName}
                              </div>
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              Product ID: {row?.productId ?? "-"}
                            </div>
                          </div>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-slate-500">
                              Sold Qty
                            </div>
                            <div className="text-sm font-bold text-slate-900">
                              {soldQty}
                            </div>
                          </div>

                          <div className="text-right min-w-[110px]">
                            <div className="text-xs text-slate-500">
                              Revenue
                            </div>
                            <div className="text-sm font-bold text-slate-900">
                              {revenue.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer hint */}
              <div className="mt-4 text-xs text-slate-500">
                Tip: “By Revenue” select করলে বেশি বিক্রি নয়, বেশি টাকার sale
                আগে দেখাবে।
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
