import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";
import { useGetAllInventoryOverviewQuery } from "../../features/inventoryOverview/inventoryOverview";
import { ShoppingBasket } from "lucide-react";

// import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";
// import { useGetAllWirehouseWithoutQueryQuery } from "../../features/wirehouse/wirehouse";

const InventoryOverviewTable = () => {
  // const [warehouse, setWarehouse] = useState("");
  // const [supplier, setSupplier] = useState("");

  const [rows, setRows] = useState([]);

  // ✅ Filters: start/end + product NAME
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productName, setProductName] = useState("");

  //Pagination calculation start
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);

  useEffect(() => {
    const updatePagesPerSet = () => {
      if (window.innerWidth < 640) setPagesPerSet(5);
      else if (window.innerWidth < 1024) setPagesPerSet(7);
      else setPagesPerSet(10);
    };
    updatePagesPerSet();
    window.addEventListener("resize", updatePagesPerSet);
    return () => window.removeEventListener("resize", updatePagesPerSet);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate, productName, itemsPerPage]);

  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (pageNumber < startPage) setStartPage(pageNumber);
    else if (pageNumber > endPage) setStartPage(pageNumber - pagesPerSet + 1);
  };

  const handlePreviousSet = () =>
    setStartPage((prev) => Math.max(prev - pagesPerSet, 1));

  const handleNextSet = () =>
    setStartPage((prev) =>
      Math.min(prev + pagesPerSet, totalPages - pagesPerSet + 1),
    );

  //Pagination calculation end

  // ✅ startDate > endDate fix
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ All products (for dropdown + name mapping)
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

  // ✅ Dropdown options (value = Id, label = name)
  const productDropdownOptions = useMemo(() => {
    return (productsData || []).map((p) => ({
      value: String(p.Id ?? p.id ?? p._id),
      label: p.name,
    }));
  }, [productsData]);

  // ✅ productId -> productName map
  const productNameMap = useMemo(() => {
    const m = new Map();
    (productsData || []).forEach((p) => {
      const key = String(p.Id ?? p.id ?? p._id);
      m.set(key, p.name);
    });
    return m;
  }, [productsData]);

  // ✅ resolve name for table
  const resolveProductName = (rp) => {
    const pid =
      rp.productId ??
      rp.product_id ??
      rp.ProductId ??
      rp.product?.Id ??
      rp.product?.id ??
      rp.product?._id;

    if (rp.productName) return rp.productName;
    if (rp.product?.name) return rp.product?.name;

    if (pid === null || pid === undefined || pid === "") return "N/A";

    const byId = productNameMap.get(String(pid));
    if (byId) return byId;

    const pidText = String(pid);
    const looksLikeName = (productsData || []).some((p) => p.name === pidText);
    if (looksLikeName) return pidText;

    return "N/A";
  };

  // ✅ Query args
  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      name: productName || undefined, // ✅ backend filter by name
    };
    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "")
        delete args[k];
    });
    return args;
  }, [currentPage, itemsPerPage, startDate, endDate, productName]);

  const { data, isLoading, isError, error } =
    useGetAllInventoryOverviewQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching received product data", error);
      return;
    }
    if (!isLoading && data) {
      setRows(data.data || []);
      setTotalPages(
        Math.max(1, Math.ceil((data?.meta?.count || 0) / itemsPerPage)),
      );
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

  // ✅ Filters clear
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setProductName("");
  };

  // ✅ react-select light styles (so it looks good in light UI)
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 14,
      borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0", // indigo-200 / slate-200
      boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
      "&:hover": { borderColor: "#cbd5e1" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    placeholder: (base) => ({ ...base, color: "#64748b" }),
    menu: (base) => ({ ...base, borderRadius: 14, overflow: "hidden" }),
  };

  // ✅ suppliers
  // const {
  //   data: allSupplierRes,
  //   isLoading: isLoadingSupplier,
  //   isError: isErrorSupplier,
  //   error: errorSupplier,
  // } = useGetAllSupplierWithoutQueryQuery();
  // const suppliers = allSupplierRes?.data || [];

  // useEffect(() => {
  //   if (isErrorSupplier)
  //     console.error("Error fetching suppliers", errorSupplier);
  // }, [isErrorSupplier, errorSupplier]);

  // ✅ Dropdown options

  // const supplierOptions = useMemo(
  //   () =>
  //     (suppliers || []).map((w) => ({
  //       value: w.Id,
  //       label: w.name,
  //     })),
  //   [suppliers],
  // );

  // ✅ warehouses
  // const {
  //   data: allWarehousesRes,
  //   isLoading: isLoadingWarehouse,
  //   isError: isErrorWarehouse,
  //   error: errorWarehouse,
  // } = useGetAllWirehouseWithoutQueryQuery();
  // const warehouses = allWarehousesRes?.data || [];

  // useEffect(() => {
  //   if (isErrorWarehouse)
  //     console.error("Error fetching warehouses", errorWarehouse);
  // }, [isErrorWarehouse, errorWarehouse]);

  // const warehouseOptions = useMemo(
  //   () =>
  //     (warehouses || []).map((w) => ({
  //       value: w.Id,
  //       label: w.name,
  //     })),
  //   [warehouses],
  // );

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top Bar */}
      <div className="my-2 flex flex-col gap-3 md:justify-end sm:flex-row sm:items-center sm:justify-center">
        {/* <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Add <Plus size={18} className="ml-2" />
        </button> */}

        <div className="flex items-center justify-between sm:justify-end gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <ShoppingBasket size={18} className="text-amber-500" />
            <span className="text-sm">Total Inventory Quantity</span>
          </div>

          <span className="text-slate-900 font-semibold tabular-nums">
            {isLoading ? "Loading..." : (data?.meta?.totalQuantity ?? 0)}
          </span>
        </div>
      </div>

      {/* Filters */}
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

        {/* ✅ Per Page Dropdown (same position like your screenshot) */}
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Per Page</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
              setStartPage(1);
            }}
            className="px-3 py-[10px] rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
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
            placeholder={isLoadingAllProducts ? "Loading..." : "Select Product"}
            isClearable
            className="text-black"
            isDisabled={isLoadingAllProducts}
            styles={selectStyles}
          />
        </div>

        {/* <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Warehouse</label>
          <Select
            options={warehouseOptions}
            value={
              warehouseOptions.find(
                (o) => String(o.value) === String(warehouse),
              ) || null
            }
            onChange={(selected) => setWarehouse(selected?.value || "")}
            placeholder="Select Warehouse"
            isClearable
            className="text-black"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Supplier</label>
          <Select
            options={supplierOptions}
            value={
              supplierOptions.find(
                (o) => String(o.value) === String(supplier),
              ) || null
            }
            onChange={(selected) => setSupplier(selected?.value || "")}
            placeholder="Select Supplier"
            isClearable
            className="text-black"
          />
        </div> */}

        <button
          type="button"
          className="h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition rounded-xl px-4 text-sm font-semibold"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-6 rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Date
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Purchase Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Sale Price
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
                  {resolveProductName(rp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(rp.quantity || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(rp.purchase_price || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(rp.sale_price || 0).toFixed(2)}
                </td>
              </motion.tr>
            ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
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
      <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
        <button
          onClick={handlePreviousSet}
          disabled={startPage === 1}
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
        >
          Prev
        </button>

        {[...Array(endPage - startPage + 1)].map((_, index) => {
          const pageNum = startPage + index;
          const active = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-4 py-2 rounded-xl border transition ${
                active
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={handleNextSet}
          disabled={endPage === totalPages}
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default InventoryOverviewTable;
