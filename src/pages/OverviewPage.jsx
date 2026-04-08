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
import { useGetTrendingProductsQuery } from "../features/confirmOrder/confirmOrder";
import { useLayout } from "../context/LayoutContext";
import { translations } from "../utils/translations";
import { useGetInventoryOverviewLowStockQuery } from "../features/inventoryOverview/inventoryOverview";

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
  const { language } = useLayout();
  const t = translations[language] || translations.EN;
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
  const [trendDays, setTrendDays] = useState(1);

  const {
    data: trendingRes,
    isLoading: trendingLoading,
    isError: trendingIsError,
    error: trendingErr,
    refetch: refetchTrending,
  } = useGetTrendingProductsQuery({
    days: trendDays,
    limit: 10,
  });

  const trending = trendingRes?.data ?? [];

  if (trendingIsError) console.error("Trending error:", trendingErr);

  const trendSummary = useMemo(() => {
    if (!trending.length) {
      return {
        topProductName: "No product data",
        topSoldQty: 0,
        totalSoldQty: 0,
        totalRevenue: 0,
        avgRevenue: 0,
        productCount: 0,
      };
    }

    const totalSoldQty = trending.reduce(
      (sum, item) => sum + Number(item?.soldQty || 0),
      0,
    );

    const totalRevenue = trending.reduce(
      (sum, item) => sum + Number(item?.revenue || 0),
      0,
    );

    const topProduct = trending[0] || {};
    const productCount = trending.length;
    const avgRevenue = productCount > 0 ? totalRevenue / productCount : 0;

    return {
      topProductName:
        topProduct?.product?.name || topProduct?.name || "Unknown Product",
      topSoldQty: Number(topProduct?.soldQty || 0),
      totalSoldQty,
      totalRevenue,
      avgRevenue,
      productCount,
    };
  }, [trending]);

  // useGetInventoryOverviewLowStockQuery

  const {
    data: lowStockRes,
    isLoading: isLowStockLoading,
    isError: isLowStockError,
    error: lowStockError,
  } = useGetInventoryOverviewLowStockQuery();

  const lowStockProducts = lowStockRes?.data ?? [];

  if (isLowStockError) console.error("Low stock error:", lowStockError);

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50">
      <Header title={t.management_console} />

      {/* ✅ Page background */}
      <main className="min-h-[calc(100vh-64px)] py-8 px-4 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {t.executive_dashboard}
              </h1>
              <p className="text-slate-500 text-base mt-2 font-medium max-w-2xl">
                {t.real_time_view}
              </p>
            </div>

            {/* ✅ Date Range Filter Container */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-end gap-3 lg:gap-4 ring-1 ring-slate-100">
              <div className="flex flex-col flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5">
                  <CalendarDays size={12} className="text-indigo-500" />{" "}
                  {t.start_date}
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex flex-col flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5">
                  <CalendarDays size={12} className="text-indigo-500" />{" "}
                  {t.end_date}
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={onApply}
                  className="h-11 px-6 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-100"
                >
                  {t.apply}
                </button>

                <button
                  onClick={onReset}
                  className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-600 active:scale-[0.98] transition flex items-center justify-center hover:bg-slate-50"
                  title="Reset to default range"
                >
                  <RefreshCcw size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* ✅ Status Indicator */}
          <div className="mb-8 px-2">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white border border-slate-100 shadow-sm">
              <div
                className={`h-2 w-2 rounded-full ${isLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`}
              ></div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">
                {isLoading
                  ? t.syncing
                  : `${t.live_summary}: ${applied.from} → ${applied.to}`}
              </span>
            </div>
          </div>

          {/* ✅ Stat Cards */}
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <StatCard
              name={t.asset_portfolio}
              icon={Truck}
              value={
                isLoading
                  ? "..."
                  : `৳${totalPurchaseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              }
              iconBg="#EEF2FF"
              iconColor="#4F46E5"
            />

            <StatCard
              name={t.liquid_stock}
              icon={Receipt}
              value={
                isLoading
                  ? "..."
                  : `৳${inventoryOverview.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              }
              iconBg="#ECFDF5"
              iconColor="#059669"
            />

            <StatCard
              name={t.marketing_investment}
              icon={TrendingUp}
              value={
                isLoading
                  ? "..."
                  : `৳${totalMetaAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              }
              iconBg="#E0F2FE"
              iconColor="#0284C7"
            />

            <StatCard
              name={t.expected_receivables}
              icon={Receipt}
              value={
                isLoading
                  ? "..."
                  : `৳${totalReceiveableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              }
              iconBg="#FFF7ED"
              iconColor="#D97706"
            />

            <StatCard
              name={t.liabilities}
              icon={Receipt}
              value={
                isLoading
                  ? "..."
                  : `৳${totalPayableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              }
              iconBg="#FFF1F2"
              iconColor="#E11D48"
            />

            <StatCard
              name={t.cash_in}
              icon={Landmark}
              value={
                isLoading
                  ? "..."
                  : `৳${totalCashInAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              }
              iconBg="#F5F3FF"
              iconColor="#7C3AED"
            />

            <StatCard
              name={t.cash_out}
              icon={Landmark}
              value={
                isLoading
                  ? "..."
                  : `৳${totalCashOutAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              }
              iconBg="#F0FDFA"
              iconColor="#0D9488"
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* ✅ Trending Products (Modern) */}
            <motion.div
              className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 }}
            >
              {/* Header */}
              <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900 tracking-tight">
                      {t.top_selling_products}
                    </div>
                    <div className="text-xs font-bold text-slate-400 mt-0.5">
                      {t.performance_analytics_last} {trendDays} {t.day_s}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={trendDays}
                    onChange={(e) => setTrendDays(Number(e.target.value))}
                    className="h-11 pl-4 pr-10 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/10 transition appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      backgroundSize: "16px",
                    }}
                  >
                    <option value={1}> {t.today}</option>
                    <option value={2}>2 {t.days}</option>
                    <option value={7}>7 {t.days}</option>
                    <option value={15}>15 {t.days}</option>
                    <option value={30}>30 {t.days}</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => refetchTrending?.()}
                    className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 active:scale-[0.98] transition flex items-center justify-center"
                  >
                    <RefreshCcw size={18} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {trendingLoading ? (
                  <div className="py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-indigo-600/20 border-t-indigo-600"></div>
                  </div>
                ) : trendingIsError ? (
                  <div className="py-20 text-center text-red-500 font-bold italic">
                    {t.system_error_trends}
                  </div>
                ) : trending.length === 0 ? (
                  <div className="py-20 text-center text-slate-300 font-black italic text-sm">
                    <Package size={40} className="mx-auto mb-3 opacity-10" />
                    {t.no_significant_performance}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trending.map((row, idx) => {
                      const soldQty = Number(row?.soldQty || 0);
                      const revenue = Number(row?.revenue || 0);
                      const pName =
                        row?.product?.name || row?.name || t.inventory_item;

                      return (
                        <motion.div
                          key={row?.productId ?? idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Package size={20} />
                              </div>
                              <div className="absolute -top-2 -left-2 h-6 w-6 rounded-lg bg-slate-900 group-hover:bg-indigo-600 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                                {idx + 1}
                              </div>
                            </div>

                            {/* <div className="min-w-0">
                              <div className="text-sm font-black text-slate-900 truncate tracking-tight">{pName}</div>
                              <div className="text-[10px] font-black text-slate-400 mt-0.5 uppercase tracking-widest">ID: {row?.productId?.slice(-6).toUpperCase() ?? "NEW"}</div>
                            </div> */}

                            <div className="min-w-0">
                              <div className="text-sm font-black text-slate-900 truncate tracking-tight">
                                {pName}
                              </div>
                              <div className="text-[10px] font-black text-slate-400 mt-0.5 uppercase tracking-widest">
                                ID:{" "}
                                {row?.productId != null
                                  ? String(row.productId)
                                      .slice(-6)
                                      .toUpperCase()
                                  : "NEW"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="text-right hidden sm:block">
                              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                {t.velocity}
                              </div>
                              <div className="text-sm font-black text-slate-700">
                                {soldQty} {t.units}
                              </div>
                            </div>
                            <div className="text-right min-w-[100px]">
                              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                {t.revenue_impact}
                              </div>
                              <div className="text-sm font-black text-indigo-600">
                                ৳
                                {revenue.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm border border-rose-100/50">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900 tracking-tight">
                      Low Stock Products
                    </div>
                    <div className="text-xs font-bold text-slate-400 mt-0.5">
                      Items that need restocking soon
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isLowStockLoading ? (
                  <div className="py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-rose-600/20 border-t-rose-600"></div>
                  </div>
                ) : isLowStockError ? (
                  <div className="py-20 text-center text-red-500 font-bold italic">
                    Failed to load low stock products.
                  </div>
                ) : lowStockProducts.length === 0 ? (
                  <div className="py-20 text-center text-slate-300 font-black italic text-sm">
                    <Package size={40} className="mx-auto mb-3 opacity-10" />
                    No low stock products found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-6 gap-4">
                    {lowStockProducts.map((item, idx) => {
                      const productName =
                        item?.name || item?.product?.name || t.inventory_item;
                      const productId =
                        item?.productId ?? item?.id ?? item?.Id ?? idx;
                      const currentStock = Number(
                        item?.currentStock ??
                          item?.stock ??
                          item?.quantity ??
                          0,
                      );
                      const minStock = Number(
                        item?.minimumStock ??
                          item?.minStock ??
                          item?.threshold ??
                          0,
                      );

                      return (
                        <motion.div
                          key={productId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5 hover:shadow-lg hover:shadow-rose-100/50 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-black text-slate-900 truncate tracking-tight">
                                {productName}
                              </div>
                              <div className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                                ID: {String(productId).slice(-6).toUpperCase()}
                              </div>
                            </div>

                            <div className="px-2.5 py-1 rounded-full bg-white text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">
                              Low
                            </div>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-white p-3 border border-slate-100">
                              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                Current Stock
                              </div>
                              <div className="text-lg font-black text-rose-600 mt-1">
                                {currentStock}
                              </div>
                            </div>

                            <div className="rounded-xl bg-white p-3 border border-slate-100">
                              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                Minimum Stock
                              </div>
                              <div className="text-lg font-black text-slate-700 mt-1">
                                {minStock}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-lg font-black tracking-tight mb-2">Performance Summary</h3>
                  <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-80">Your product velocity is increasing across 4 core categories compared to the last audit period.</p>
                  <button className="mt-8 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition active:scale-95 border border-white/20">Download Report</button>
                </div>
                <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <h3 className="text-slate-900 font-black tracking-tight mb-4">Live Indicators</h3>
                <div className="space-y-4">
                  {[
                    { label: "Purchase Flow", val: 84, color: "bg-indigo-500" },
                    { label: "Inventory Health", val: 62, color: "bg-emerald-500" },
                    { label: "Profit Margin", val: 78, color: "bg-blue-500" }
                  ].map((stat, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>{stat.label}</span>
                        <span className="text-slate-900">{stat.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.val}%` }}
                          className={`h-full ${stat.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}

            {/* <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-black tracking-tight mb-2">
                  {t.performance_summary}
                </h3>

                {trendingLoading ? (
                  <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-80">
                    {t.loading_product_performance}
                  </p>
                ) : trendingIsError ? (
                  <p className="text-red-100 text-sm font-medium leading-relaxed">
                    {t.failed_load_summary}
                  </p>
                ) : trending.length === 0 ? (
                  <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-80">
                    {t.no_selling_data}
                  </p>
                ) : (
                  <div className="space-y-3 mt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-indigo-200 font-black">
                        {t.top_selling_product}
                      </p>
                      <p className="text-xl font-black text-white">
                        {trendSummary.topProductName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-indigo-200 font-black">
                          {t.top_sold_qty}
                        </p>
                        <p className="text-xl font-black text-white">
                          {trendSummary.topSoldQty}
                        </p>
                      </div>

                      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-indigo-200 font-black">
                          {t.total_sold}
                        </p>
                        <p className="text-xl font-black text-white">
                          {trendSummary.totalSoldQty}
                        </p>
                      </div>

                      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-indigo-200 font-black">
                          {t.total_revenue}
                        </p>
                        <p className="text-lg font-black text-white">
                          ৳
                          {trendSummary.totalRevenue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-indigo-200 font-black">
                          {t.avg_revenue}
                        </p>
                        <p className="text-lg font-black text-white">
                          ৳
                          {trendSummary.avgRevenue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>

                    <p className="text-indigo-100 text-xs font-medium leading-relaxed opacity-80 pt-2">
                      {t.based_on_performance_last} {trendDays} {trendDays > 1 ? t.days : t.day}
                    </p>
                  </div>
                )}
              </div>

              <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
