import { motion } from "framer-motion";
import { RefreshCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useGetAllInventoryOverviewWithoutQueryQuery } from "../../features/inventoryOverview/inventoryOverview";

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
      item?.sale_price ??
      item?.salePrice ??
      item?.selling_price ??
      item?.unitPrice ??
      item?.price ??
      item?.mrp,
  );

const getStockQuantity = (item) =>
  safeNumber(
    item?.quantity ??
      item?.stockQuantity ??
      item?.inHandQuantity ??
      item?.availableQuantity ??
      item?.qty ??
      item?.stock,
  );

const getCostPrice = (item) =>
  safeNumber(
    item?.costPrice ??
      item?.purchase_price ??
      item?.purchasePrice ??
      item?.buyingPrice ??
      item?.cost_price ??
      item?.buyPrice,
  );

const normalizeReceivedProducts = (items = []) =>
  items.map((item, index) => ({
    id: String(item?.Id ?? item?.id ?? item?.productId ?? index),
    productId: item?.productId ?? item?.Id ?? item?.id ?? index,
    name: getProductName(item),
    sku: getProductSku(item),
    quantity: getStockQuantity(item),
    costPrice: getCostPrice(item),
    sellingPrice: getSellingPrice(item),
    unitsSold: safeNumber(
      item?.unitsSold ?? item?.soldQty ?? item?.quantitySold,
    ),
  }));

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 48,
    borderRadius: 16,
    borderColor: state.isFocused ? "#a5b4fc" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(99, 102, 241, 0.12)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#a5b4fc" : "#cbd5e1",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "4px 12px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#64748b",
    fontWeight: 500,
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#eef2ff",
    borderRadius: 10,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#3730a3",
    fontWeight: 700,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#4338ca",
    ":hover": {
      backgroundColor: "#c7d2fe",
      color: "#312e81",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 18,
    overflow: "hidden",
    zIndex: 30,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#e0e7ff"
      : state.isFocused
        ? "#f8fafc"
        : "#ffffff",
    color: "#0f172a",
    padding: 14,
  }),
};

const DailyProfitLossTable = () => {
  const {
    data: receivedRes,
    isLoading: receivedLoading,
    isError: receivedError,
    error: receivedErrObj,
  } = useGetAllInventoryOverviewWithoutQueryQuery();

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
  const [marketingSpends, setMarketingSpends] = useState(0);
  const [otherExpenses, setOtherExpenses] = useState(0);
  const [returnPercentage, setReturnPercentage] = useState(0);

  useEffect(() => {
    setSelectedRows((prev) => {
      const prevMap = new Map(prev.map((item) => [item.id, item]));
      const normalizedMap = new Map(
        normalizedProducts.map((item) => [item.id, item]),
      );

      return prev
        .map((item) => {
          const updatedItem = normalizedMap.get(item.id);
          if (!updatedItem) return null;

          const existing = prevMap.get(item.id);
          return existing
            ? {
                ...updatedItem,
                costPrice: existing.costPrice,
                sellingPrice: existing.sellingPrice,
                unitsSold: existing.unitsSold,
              }
            : updatedItem;
        })
        .filter(Boolean);
    });
  }, [normalizedProducts]);

  const productOptions = useMemo(
    () =>
      normalizedProducts.map((item) => ({
        value: item.id,
        label: item.name,
        sku: item.sku,
        quantity: item.quantity,
        data: item,
      })),
    [normalizedProducts],
  );

  const selectedProductOptions = useMemo(() => {
    const selectedIdSet = new Set(selectedRows.map((item) => item.id));

    return productOptions.filter((option) => selectedIdSet.has(option.value));
  }, [productOptions, selectedRows]);

  const handleProductSelect = (selectedOptions) => {
    const options = selectedOptions || [];
    setSelectedRows((prev) => {
      const prevMap = new Map(prev.map((item) => [item.id, item]));

      return options.map((option) => {
        const item = option.data;
        const existing = prevMap.get(option.value);
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
  };

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
    setSelectedRows([]);
    setSearchTerm("");
    setMarketingSpends(0);
    setOtherExpenses(0);
    setReturnPercentage(0);
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
    const baseSummary = filteredRows.reduce(
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

    const marketingCost = safeNumber(marketingSpends);
    const otherCost = safeNumber(otherExpenses);
    const returnRate = safeNumber(returnPercentage);
    const returnDeduction = (baseSummary.totalRevenue * returnRate) / 100;

    return {
      ...baseSummary,
      marketingCost,
      otherCost,
      returnRate,
      returnDeduction,
      finalProfit:
        baseSummary.totalProfit - marketingCost - otherCost - returnDeduction,
    };
  }, [filteredRows, marketingSpends, otherExpenses, returnPercentage]);

  const summaryCards = [
    {
      label: "Selected Products",
      value: selectedRows.length,
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
      value: formatCurrency(summary.finalProfit),
      tone: summary.finalProfit >= 0 ? "text-emerald-600" : "text-rose-600",
      bg:
        summary.finalProfit >= 0
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
            <div className="min-w-[320px] flex-1">
              <Select
                isMulti
                options={productOptions}
                value={selectedProductOptions}
                onChange={handleProductSelect}
                isLoading={receivedLoading}
                isDisabled={receivedLoading || normalizedProducts.length === 0}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                placeholder="Select product by variants"
                styles={selectStyles}
                formatOptionLabel={(option) => (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {option.label}
                      </div>
                      <div className="text-xs font-medium text-slate-500">
                        SKU: {option.sku}
                      </div>
                    </div>
                    <div className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      Qty: {Number(option.quantity || 0).toLocaleString()}
                    </div>
                  </div>
                )}
              />
            </div>

            <label className="relative min-w-[260px] flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search selected product or SKU"
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
                "Purchase Price",
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
                  {selectedRows.length === 0
                    ? "Dropdown থেকে product select করলে এখানে দেখা যাবে।"
                    : "Search অনুযায়ী কোনো product পাওয়া যায়নি।"}
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
                      <div className="space-y-2">
                        <div className="max-w-[270px] truncate text-[15px] font-semibold text-slate-900">
                          {item.name}
                        </div>
                        <div className="inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          Qty: {Number(item.quantity || 0).toLocaleString()}
                        </div>
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

      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900">
            Marketing Spends
          </h3>
          <p className="mt-6 text-sm leading-7 text-slate-500">
            (Optional) Enter any marketing spends for the day to include in the
            profit/loss calculation.
          </p>
          <input
            type="number"
            min="0"
            step="0.01"
            value={marketingSpends}
            onChange={(e) => setMarketingSpends(e.target.value)}
            className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900">Other Expenses</h3>
          <p className="mt-6 text-sm leading-7 text-slate-500">
            (Optional) Enter any other expenses for the day to include in the
            profit/loss calculation.
          </p>
          <input
            type="number"
            min="0"
            step="0.01"
            value={otherExpenses}
            onChange={(e) => setOtherExpenses(e.target.value)}
            className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900">
            Return Percentage
          </h3>
          <p className="mt-6 text-sm leading-7 text-slate-500">
            (Optional) Enter return percentage to deduct from total revenue
            (e.g. 20 for 20%).
          </p>
          <input
            type="number"
            min="0"
            step="0.01"
            value={returnPercentage}
            onChange={(e) => setReturnPercentage(e.target.value)}
            className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900">Actions</h3>
          <button
            type="button"
            className="mt-10 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Calculate Profit/Loss
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="grid grid-cols-1 gap-3 text-sm font-medium text-slate-600 md:grid-cols-2 xl:grid-cols-4">
          <div>
            Gross Profit:{" "}
            <span className="font-bold text-slate-900">
              {formatCurrency(summary.totalProfit)}
            </span>
          </div>
          <div>
            Marketing Spends:{" "}
            <span className="font-bold text-slate-900">
              {formatCurrency(summary.marketingCost)}
            </span>
          </div>
          <div>
            Other Expenses:{" "}
            <span className="font-bold text-slate-900">
              {formatCurrency(summary.otherCost)}
            </span>
          </div>
          <div>
            Return Deduction ({safeNumber(summary.returnRate).toFixed(2)}%):{" "}
            <span className="font-bold text-slate-900">
              {formatCurrency(summary.returnDeduction)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyProfitLossTable;
