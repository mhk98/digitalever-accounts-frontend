// /* eslint-disable no-mixed-spaces-and-tabs */
// import { motion } from "framer-motion";
// import StatCard from "../common/StatCard";
// import { useMemo, useState } from "react";
// import {
//   CalendarDays,
//   RefreshCcw,
//   PackageCheck, // Received Product
//   RotateCcw, // Return
//   Truck, // Intransit
//   ClipboardCheck, // Confirm Order
//   TriangleAlert, // Damage Product
//   Wrench, // Damage Repair
//   ShieldCheck, // Damage Repaired / Completed
// } from "lucide-react";
// import { useGetInventorySummaryQuery } from "../../features/inventoryDashboard/inventoryDashboard";

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

// const InventoryDashboardTable = () => {

//   const defaultRange = useMemo(() => getDefaultRange(), []);

//   const [from, setFrom] = useState(defaultRange.from);
//   const [to, setTo] = useState(defaultRange.to);
//   const [applied, setApplied] = useState(defaultRange);

//   const {
//     data: summaryRes,
//     isLoading,
//     isError,
//     error,
//   } = useGetInventorySummaryQuery({ from: applied.from, to: applied.to });

//   const summary = summaryRes?.data || {};

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

//   const totalReceivedProduct = Number(summary?.totalReceivedProduct || 0);
//   const totalPurchaseReturnProduct = Number(
//     summary?.totalPurchaseReturnProduct || 0,
//   );
//   const totalIntransitProduct = Number(summary?.totalIntransitProduct || 0);
//   const totalSalesReturnProduct = Number(summary?.totalSalesReturnProduct || 0);
//   const totalConfirmOrder = Number(summary?.totalConfirmOrder || 0);
//   const totalDamageProduct = Number(summary?.totalDamageProduct || 0);
//   const totalDamageRepair = Number(summary?.totalDamageRepair || 0);
//   const totalDamageRepaired = Number(summary?.totalDamageRepaired || 0);

//   return (
//     <div className="flex-1 overflow-auto">
//       <main className="min-h-[calc(100vh-64px)] bg-slate-50">
//         <div className="max-w-8xl mx-auto px-4 lg:px-8 py-6">
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

//             <div className="mt-3 text-xs text-slate-500">
//               {isLoading ? "Updating overview..." : "Overview ready"}
//             </div>
//           </div>

//           <motion.div
//             className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
//             initial={{ opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.45 }}
//           >
//             <StatCard
//               name="Received Product"
//               icon={PackageCheck}
//               value={isLoading ? "Loading..." : totalReceivedProduct}
//               iconBg="#EEF2FF"
//               iconColor="#4F46E5"
//             />

//             <StatCard
//               name="Purchase Return"
//               icon={RotateCcw}
//               value={isLoading ? "Loading..." : totalPurchaseReturnProduct}
//               iconBg="#ECFDF5"
//               iconColor="#059669"
//             />

//             <StatCard
//               name="Intransit Product"
//               icon={Truck}
//               value={isLoading ? "Loading..." : totalIntransitProduct}
//               iconBg="#E0F2FE"
//               iconColor="#0284C7"
//             />

//             <StatCard
//               name="Sales Return Product"
//               icon={RotateCcw}
//               value={isLoading ? "Loading..." : totalSalesReturnProduct}
//               iconBg="#FFF7ED"
//               iconColor="#D97706"
//             />

//             <StatCard
//               name="Confirm Order"
//               icon={ClipboardCheck}
//               value={isLoading ? "Loading..." : totalConfirmOrder}
//               iconBg="#FEE2E2"
//               iconColor="#DC2626"
//             />

//             <StatCard
//               name="Damage Product"
//               icon={TriangleAlert}
//               value={isLoading ? "Loading..." : totalDamageProduct}
//               iconBg="#F3E8FF"
//               iconColor="#7C3AED"
//             />

//             <StatCard
//               name="Damage Repair"
//               icon={Wrench}
//               value={isLoading ? "Loading..." : totalDamageRepair}
//               iconBg="#F3E8FF"
//               iconColor="#7C3AED"
//             />

//             <StatCard
//               name="Damage Repaired"
//               icon={ShieldCheck}
//               value={isLoading ? "Loading..." : totalDamageRepaired}
//               iconBg="#F3E8FF"
//               iconColor="#7C3AED"
//             />
//           </motion.div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default InventoryDashboardTable;

import { useEffect, useMemo, useState } from "react";
import {
  useGetInventoryListQuery,
  useGetInventorySummaryQuery,
} from "../../features/inventoryDashboard/inventoryDashboard";
import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";
import Select from "react-select";
import { motion } from "framer-motion";
import StatCard from "../common/StatCard";

import {
  CalendarDays,
  RefreshCcw,
  PackageCheck, // Received Product
  RotateCcw, // Return
  Truck, // Intransit
  ClipboardCheck, // Confirm Order
  TriangleAlert, // Damage Product
  Wrench, // Damage Repair
  ShieldCheck, // Damage Repaired / Completed
} from "lucide-react";

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

const InventoryOverviewTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ✅ filters
  const [productName, setProductName] = useState("");
  const [startDate, setStartDate] = useState(""); // from
  const [endDate, setEndDate] = useState(""); // to

  // ✅ query params (এটাই API তে যাবে)
  const query = useMemo(() => {
    return {
      page,
      limit,
      from: startDate || undefined,
      to: endDate || undefined,
      name: productName || undefined,
    };
  }, [page, limit, startDate, endDate, productName]);

  const { data, isLoading, isError, error } = useGetInventoryListQuery(query);

  const rows = data?.data ?? [];

  console.log("rows", rows);
  const totalCount = Number(data?.meta?.count || 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  useEffect(() => {
    if (isError) console.error("Inventory list error:", error);
  }, [isError, error]);

  // ✅ All products (for dropdown)
  const {
    data: allProductsRes,
    isLoading: isLoadingAllProducts,
    isError: isErrorAllProducts,
    error: errorAllProducts,
  } = useGetAllProductWithoutQueryQuery();

  const productsData = allProductsRes?.data || [];

  useEffect(() => {
    if (isErrorAllProducts)
      console.error("Error fetching products", errorAllProducts);
  }, [isErrorAllProducts, errorAllProducts]);

  const productDropdownOptions = useMemo(() => {
    return (productsData || []).map((p) => ({
      value: String(p.Id ?? p.id ?? p._id),
      label: p.name,
    }));
  }, [productsData]);

  // ✅ Filters clear
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setProductName("");
    setPage(1);
  };

  // ✅ filter change করলে page 1 করা ভালো
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, productName, limit]);

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 14,
      borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
      "&:hover": { borderColor: "#cbd5e1" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    placeholder: (base) => ({ ...base, color: "#64748b" }),
    menu: (base) => ({ ...base, borderRadius: 14, overflow: "hidden" }),
  };

  const defaultRange = useMemo(() => getDefaultRange(), []);

  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [applied, setApplied] = useState(defaultRange);

  const {
    data: summaryRes,
    isLoading: isLoading1,
    isError: isError1,
    error: error1,
  } = useGetInventorySummaryQuery({ from: applied.from, to: applied.to });

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

  if (isError1) console.error("Overview Summary error:", error1);

  const totalReceivedProduct = Number(summary?.totalReceivedProduct || 0);
  const totalPurchaseReturnProduct = Number(
    summary?.totalPurchaseReturnProduct || 0,
  );
  const totalIntransitProduct = Number(summary?.totalIntransitProduct || 0);
  const totalSalesReturnProduct = Number(summary?.totalSalesReturnProduct || 0);
  const totalConfirmOrder = Number(summary?.totalConfirmOrder || 0);
  const totalDamageProduct = Number(summary?.totalDamageProduct || 0);
  const totalDamageRepair = Number(summary?.totalDamageRepair || 0);
  const totalDamageRepaired = Number(summary?.totalDamageRepaired || 0);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-8xl mx-auto px-4 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <CalendarDays size={18} className="text-slate-600" />
              </div>
              <div>
                <div className="text-sm font-semibold">Date Range</div>
                <div className="text-xs text-slate-500">
                  Applied: <span className="font-medium">{applied.from}</span> →{" "}
                  <span className="font-medium">{applied.to}</span>
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

          <div className="mt-3 text-xs text-slate-500">
            {isLoading1 ? "Updating overview..." : "Overview ready"}
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <StatCard
            name="Received Product"
            icon={PackageCheck}
            value={isLoading1 ? "Loading..." : totalReceivedProduct}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
          />

          <StatCard
            name="Purchase Return"
            icon={RotateCcw}
            value={isLoading1 ? "Loading..." : totalPurchaseReturnProduct}
            iconBg="#ECFDF5"
            iconColor="#059669"
          />

          <StatCard
            name="Intransit Product"
            icon={Truck}
            value={isLoading1 ? "Loading..." : totalIntransitProduct}
            iconBg="#E0F2FE"
            iconColor="#0284C7"
          />

          <StatCard
            name="Sales Return Product"
            icon={RotateCcw}
            value={isLoading1 ? "Loading..." : totalSalesReturnProduct}
            iconBg="#FFF7ED"
            iconColor="#D97706"
          />

          <StatCard
            name="Confirm Order"
            icon={ClipboardCheck}
            value={isLoading1 ? "Loading..." : totalConfirmOrder}
            iconBg="#FEE2E2"
            iconColor="#DC2626"
          />

          <StatCard
            name="Damage Product"
            icon={TriangleAlert}
            value={isLoading1 ? "Loading..." : totalDamageProduct}
            iconBg="#F3E8FF"
            iconColor="#7C3AED"
          />

          <StatCard
            name="Damage Repair"
            icon={Wrench}
            value={isLoading1 ? "Loading..." : totalDamageRepair}
            iconBg="#F3E8FF"
            iconColor="#7C3AED"
          />

          <StatCard
            name="Damage Repaired"
            icon={ShieldCheck}
            value={isLoading1 ? "Loading..." : totalDamageRepaired}
            iconBg="#F3E8FF"
            iconColor="#7C3AED"
          />
        </motion.div>
      </div>

      <div className="max-w-8xl mx-auto px-4 lg:px-8 py-6">
        {/* Filters row */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-4 items-end w-full">
          <div className="flex flex-col">
            <label className="text-sm text-slate-600 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-slate-600 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
            />
          </div>

          {/* Product Filter (stores NAME) */}
          <div className="flex flex-col">
            <label className="text-sm text-slate-600 mb-1">Product</label>
            <Select
              options={productDropdownOptions}
              value={
                productDropdownOptions.find((o) => o.label === productName) ||
                null
              }
              onChange={(selected) => setProductName(selected?.label || "")}
              placeholder={
                isLoadingAllProducts ? "Loading..." : "Select Product"
              }
              isClearable
              className="text-black"
              isDisabled={isLoadingAllProducts}
              styles={selectStyles}
            />
          </div>

          <button
            type="button"
            className="h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition rounded-xl px-4 text-sm font-semibold"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

          {/* Optional: Per Page */}
          <div className="flex flex-col">
            <label className="text-sm text-slate-600 mb-1">Per Page</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
            >
              {[10, 20, 50, 100].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {/* <div className="mt-5 rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[180px_1fr_140px] bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
          <div>DATE</div>
          <div className="text-center lg:text-left">Category</div>
          <div className="text-right">QUANTITY</div>
        </div>

        <div className="min-h-[150px] bg-white">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading...
            </div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No data found
            </div>
          ) : (
            rows.map((r) => (
              <div
                key={r.Id}
                className="grid grid-cols-[180px_1fr_140px] px-4 py-3 border-t border-slate-100 text-sm text-slate-700"
              >
                <div>
                  {r.date ? new Date(r.date).toLocaleDateString() : "-"}
                </div>
                <div className="text-center lg:text-left font-medium text-slate-800">
                  {r.source || "-"}
                </div>
                <div className="text-right tabular-nums">{r.quantity ?? 0}</div>
              </div>
            ))
          )}
        </div>
      </div> */}

        {/* Table */}
        <div className="overflow-x-auto mt-6 rounded-2xl border border-slate-200">
          <table className="w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Category
                </th>

                {/* ✅ Quantity placed at end */}
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Quantity
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {rows.map((rp) => (
                <motion.tr
                  key={rp.Id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {rp.date ? new Date(rp.date).toLocaleDateString() : "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {rp.source || "-"}
                  </td>

                  {/* ✅ Quantity placed at end */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {Number(rp.quantity || 0).toFixed(2)}
                  </td>
                </motion.tr>
              ))}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Prev
          </button>

          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-semibold">
            {page}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
};

export default InventoryOverviewTable;
