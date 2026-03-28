import { motion } from "framer-motion";
import { RefreshCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useGetAllReceivedProductWithoutQueryQuery } from "../../features/receivedProduct/receivedProduct";

const safeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value) =>
  `৳${safeNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getProductName = (item) =>
  item?.name ||
  item?.productName ||
  item?.product?.name ||
  item?.title ||
  "Unnamed Product";

const getProductSku = (item) =>
  item?.sku ||
  item?.productSku ||
  item?.product?.sku ||
  item?.SKU ||
  `SKU-BASE-${item?.Id || item?.id || Math.floor(Math.random() * 100000)}`;

const getSellingPrice = (item) =>
  safeNumber(
    item?.sellingPrice ??
      item?.salePrice ??
      item?.selling_price ??
      item?.unitPrice ??
      item?.price ??
      item?.mrp,
  );

const getCostPrice = (item) =>
  safeNumber(
    item?.costPrice ??
      item?.purchasePrice ??
      item?.buyingPrice ??
      item?.cost_price ??
      item?.purchase_price ??
      item?.buyPrice,
  );

const normalizeReceivedProducts = (items = []) =>
  items.map((item, index) => ({
    id: String(item?.Id ?? item?.id ?? item?.productId ?? index),
    productId: item?.productId ?? item?.Id ?? item?.id ?? index,
    name: getProductName(item),
    sku: getProductSku(item),
    costPrice: getCostPrice(item),
    sellingPrice: getSellingPrice(item),
    unitsSold: safeNumber(
      item?.unitsSold ?? item?.soldQty ?? item?.quantitySold,
    ),
  }));

const DailyProfitLossTable = () => {
  const {
    data: receivedRes,
    isLoading: receivedLoading,
    isError: receivedError,
    error: receivedErrObj,
  } = useGetAllReceivedProductWithoutQueryQuery();

  const receivedData = useMemo(() => receivedRes?.data || [], [receivedRes]);

  useEffect(() => {
    if (receivedError) console.error("Received fetch error:", receivedErrObj);
  }, [receivedError, receivedErrObj]);

  const normalizedProducts = useMemo(
    () => normalizeReceivedProducts(receivedData),
    [receivedData],
  );

  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSelectedRows((prev) => {
      const prevMap = new Map(prev.map((item) => [item.id, item]));

      return normalizedProducts.map((item) => {
        const existing = prevMap.get(item.id);
        return existing
          ? {
              ...item,
              costPrice: existing.costPrice,
              sellingPrice: existing.sellingPrice,
              unitsSold: existing.unitsSold,
            }
          : item;
      });
    });
  }, [normalizedProducts]);

  const handleFieldChange = (id, field, value) => {
    setSelectedRows((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value === "" ? "" : safeNumber(value),
            }
          : item,
      ),
    );
  };

  const handleRemoveRow = (id) => {
    setSelectedRows((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setSelectedRows(normalizedProducts);
    setSearchTerm("");
  };

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return selectedRows;

    return selectedRows.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term),
    );
  }, [searchTerm, selectedRows]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (acc, item) => {
        const sellingPrice = safeNumber(item.sellingPrice);
        const costPrice = safeNumber(item.costPrice);
        const unitsSold = safeNumber(item.unitsSold);
        const revenue = sellingPrice * unitsSold;
        const totalCost = costPrice * unitsSold;
        const profit = revenue - totalCost;

        acc.totalRevenue += revenue;
        acc.totalCost += totalCost;
        acc.totalProfit += profit;
        acc.totalUnits += unitsSold;
        return acc;
      },
      {
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        totalUnits: 0,
      },
    );
  }, [filteredRows]);

  const summaryCards = [
    {
      label: "Selected Variants",
      value: filteredRows.length,
      tone: "text-slate-900",
      bg: "from-slate-50 to-white",
    },
    {
      label: "Units Sold",
      value: summary.totalUnits,
      tone: "text-sky-700",
      bg: "from-sky-50 to-white",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      tone: "text-indigo-700",
      bg: "from-indigo-50 to-white",
    },
    {
      label: "Profit/Loss",
      value: formatCurrency(summary.totalProfit),
      tone: summary.totalProfit >= 0 ? "text-emerald-600" : "text-rose-600",
      bg:
        summary.totalProfit >= 0
          ? "from-emerald-50 to-white"
          : "from-rose-50 to-white",
    },
  ];

  return (
    <motion.div
      className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Selected Product Variants
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Received product list থেকে cost, sold unit, revenue আর profit/loss
              live calculate হচ্ছে।
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-[260px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product or SKU"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${card.bg} p-4`}
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {card.label}
              </p>
              <p className={`mt-3 text-2xl font-black ${card.tone}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-[1120px] w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left">
              {[
                "Product",
                "SKU",
                "Cost Price",
                "Selling Price",
                "Units Sold",
                "Total Revenue",
                "Total Cost",
                "Profit/Loss",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="border-b border-slate-200 px-3 py-4 text-sm font-bold text-slate-700 first:pl-2"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {receivedLoading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-16 text-center text-sm font-medium text-slate-500"
                >
                  Loading received products...
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-16 text-center text-sm font-medium text-slate-500"
                >
                  কোনো product পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredRows.map((item) => {
                const unitsSold = safeNumber(item.unitsSold);
                const sellingPrice = safeNumber(item.sellingPrice);
                const costPrice = safeNumber(item.costPrice);
                const totalRevenue = sellingPrice * unitsSold;
                const totalCost = costPrice * unitsSold;
                const profit = totalRevenue - totalCost;

                return (
                  <tr key={item.id} className="group">
                    <td className="border-b border-slate-100 px-3 py-4 first:pl-2">
                      <div className="max-w-[270px] truncate text-[15px] font-semibold text-slate-900">
                        {item.name}
                      </div>
                    </td>

                    <td className="border-b border-slate-100 px-3 py-4 text-sm font-medium text-slate-500">
                      {item.sku}
                    </td>

                    <td className="border-b border-slate-100 px-3 py-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.costPrice}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            "costPrice",
                            e.target.value,
                          )
                        }
                        className="h-10 w-[110px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      />
                    </td>

                    <td className="border-b border-slate-100 px-3 py-4 text-[15px] font-semibold text-slate-800">
                      {safeNumber(item.sellingPrice).toFixed(2)}
                    </td>

                    <td className="border-b border-slate-100 px-3 py-4">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.unitsSold}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            "unitsSold",
                            e.target.value,
                          )
                        }
                        className="h-10 w-[82px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      />
                    </td>

                    <td className="border-b border-slate-100 px-3 py-4 text-[15px] font-semibold text-slate-900">
                      {formatCurrency(totalRevenue)}
                    </td>

                    <td className="border-b border-slate-100 px-3 py-4 text-[15px] font-semibold text-slate-700">
                      {formatCurrency(totalCost)}
                    </td>

                    <td
                      className={`border-b border-slate-100 px-3 py-4 text-[15px] font-bold ${
                        profit >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(profit)}
                    </td>

                    <td className="border-b border-slate-100 px-3 py-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(item.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                        title="Remove row"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default DailyProfitLossTable;
