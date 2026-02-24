/* eslint-disable no-mixed-spaces-and-tabs */
import { motion } from "framer-motion";
import StatCard from "../common/StatCard";
import { useMemo, useState } from "react";
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
import { useGetInventorySummaryQuery } from "../../features/inventoryDashboard/inventoryDashboard";

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

const InventoryDashboardTable = () => {
  const defaultRange = useMemo(() => getDefaultRange(), []);

  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [applied, setApplied] = useState(defaultRange);

  const {
    data: summaryRes,
    isLoading,
    isError,
    error,
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

  if (isError) console.error("Overview Summary error:", error);

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
    <div className="flex-1 overflow-auto">
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

            <div className="mt-3 text-xs text-slate-500">
              {isLoading ? "Updating overview..." : "Overview ready"}
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
              value={isLoading ? "Loading..." : totalReceivedProduct}
              iconBg="#EEF2FF"
              iconColor="#4F46E5"
            />

            <StatCard
              name="Purchase Return"
              icon={RotateCcw}
              value={isLoading ? "Loading..." : totalPurchaseReturnProduct}
              iconBg="#ECFDF5"
              iconColor="#059669"
            />

            <StatCard
              name="Intransit Product"
              icon={Truck}
              value={isLoading ? "Loading..." : totalIntransitProduct}
              iconBg="#E0F2FE"
              iconColor="#0284C7"
            />

            <StatCard
              name="Sales Return Product"
              icon={RotateCcw}
              value={isLoading ? "Loading..." : totalSalesReturnProduct}
              iconBg="#FFF7ED"
              iconColor="#D97706"
            />

            <StatCard
              name="Confirm Order"
              icon={ClipboardCheck}
              value={isLoading ? "Loading..." : totalConfirmOrder}
              iconBg="#FEE2E2"
              iconColor="#DC2626"
            />

            <StatCard
              name="Damage Product"
              icon={TriangleAlert}
              value={isLoading ? "Loading..." : totalDamageProduct}
              iconBg="#F3E8FF"
              iconColor="#7C3AED"
            />

            <StatCard
              name="Damage Repair"
              icon={Wrench}
              value={isLoading ? "Loading..." : totalDamageRepair}
              iconBg="#F3E8FF"
              iconColor="#7C3AED"
            />

            <StatCard
              name="Damage Repaired"
              icon={ShieldCheck}
              value={isLoading ? "Loading..." : totalDamageRepaired}
              iconBg="#F3E8FF"
              iconColor="#7C3AED"
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default InventoryDashboardTable;
