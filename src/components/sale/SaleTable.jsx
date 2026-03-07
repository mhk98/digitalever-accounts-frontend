import { motion } from "framer-motion";
import { Download, Edit, FileDown, Plus, Trash2, Search, Calendar, Filter, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  useDeleteSaleMutation,
  useGetAllSaleQuery,
  useInsertSaleMutation,
  useUpdateSaleMutation,
} from "../../features/sale/sale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Select from "react-select";
import { useGetAllBuyerWithoutQueryQuery } from "../../features/buyer/buyer";
import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";
import Modal from "../common/Modal";

const SaleTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [createSale, setCreateSale] = useState({
    transaction_date: new Date().toISOString().split("T")[0],
    quantity: "",
    rate: "",
    paid_amount: "",
    remarks: "",
    buyerId: "",
    productId: "",
  });
  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [buyerId, setBuyerId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  const { data, isLoading, isError, error } = useGetAllSaleQuery({
    startDate,
    endDate,
    buyerId,
    page: currentPage,
    limit: itemsPerPage,
  });

  useEffect(() => {
    if (isError) {
      console.error("Error fetching sale data", error);
    } else if (!isLoading && data) {
      setSales(data.data || []);
      setTotalPages(Math.ceil((data.meta?.count || 0) / itemsPerPage));
    }
  }, [data, isLoading, isError, error, currentPage, itemsPerPage, startDate, endDate, buyerId]);

  const { data: productsRes } = useGetAllProductWithoutQueryQuery();
  const products = productsRes?.data || [];

  const { data: buyersRes } = useGetAllBuyerWithoutQueryQuery();
  const buyers = buyersRes?.data || [];

  const handleEditClick = (sale) => {
    setCurrentSale({
      ...sale,
      transaction_date: sale.transaction_date ? new Date(sale.transaction_date).toISOString().split("T")[0] : ""
    });
    setIsModalOpen(true);
  };

  const [insertSale] = useInsertSaleMutation();
  const handleCreateSale = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    try {
      const res = await insertSale({ ...createSale, userId }).unwrap();
      if (res.success) {
        toast.success("Sale created successfully");
        setIsModalOpen1(false);
        setCreateSale({
          transaction_date: new Date().toISOString().split("T")[0],
          quantity: "",
          rate: "",
          paid_amount: "",
          remarks: "",
          buyerId: "",
          productId: "",
        });
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create sale");
    }
  };

  const [updateSale] = useUpdateSaleMutation();
  const handleUpdateSale = async (e) => {
    e.preventDefault();
    try {
      const res = await updateSale({
        id: currentSale.Id,
        data: currentSale,
      }).unwrap();
      if (res.success) {
        toast.success("Sale updated successfully");
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update sale");
    }
  };

  const [deleteSale] = useDeleteSaleMutation();
  const handleDeleteSale = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        const res = await deleteSale(id).unwrap();
        if (res.success) {
          toast.success("Sale deleted successfully");
        }
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete sale");
      }
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setBuyerId("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (page < startPage) setStartPage(page);
    else if (page > startPage + pagesPerSet - 1) setStartPage(page - pagesPerSet + 1);
  };

  const handlePreviousSet = () => setStartPage(prev => Math.max(prev - pagesPerSet, 1));
  const handleNextSet = () => setStartPage(prev => Math.min(prev + pagesPerSet, Math.max(1, totalPages - pagesPerSet + 1)));

  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sales);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, "sales_report.xlsx");
  };

  const productOptions = useMemo(() => products.map(p => ({ value: p.Id, label: p.name })), [products]);
  const buyerOptions = useMemo(() => buyers.map(b => ({ value: b.Id, label: b.name })), [buyers]);

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 12,
      borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 4px rgba(99, 102, 241, 0.1)" : "none",
      "&:hover": { borderColor: "#cbd5e1" },
    }),
    placeholder: (base) => ({ ...base, color: "#94a3b8", fontSize: "14px" }),
    singleValue: (base) => ({ ...base, color: "#1e293b", fontSize: "14px", fontWeight: "500" }),
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-sm rounded-3xl p-4 sm:p-8 border border-slate-100 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Records</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor all sales transactions</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setIsModalOpen1(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-md shadow-indigo-100 active:scale-95"
          >
            <Plus size={18} /> Add Sale
          </button>
          <button
            onClick={exportToExcel}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition active:scale-95"
          >
            <FileDown size={18} /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Start Date</label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">End Date</label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Buyer</label>
          <Select
            options={buyerOptions}
            value={buyerOptions.find(o => o.value === buyerId)}
            onChange={(opt) => setBuyerId(opt?.value || "")}
            placeholder="Select Buyer..."
            isClearable
            styles={selectStyles}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full h-11 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-xl transition active:scale-95"
          >
            <X size={16} /> Clear Filters
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden border border-slate-100 rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Buyer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Qty</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right text-indigo-600">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right text-emerald-600">Paid</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right text-rose-600">Due</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((sale) => (
                <motion.tr
                  key={sale.Id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                    {sale.transaction_date ? new Date(sale.transaction_date).toLocaleDateString("en-GB") : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{sale.product_name}</div>
                    <div className="text-xs text-slate-400 font-medium">Rate: {Number(sale.rate || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{sale.buyer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 text-right">
                    {Number(sale.quantity || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 text-right">
                    ৳{Number(sale.rate || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-indigo-600 text-right">
                    ৳{Number(sale.price || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-emerald-600 text-right">
                    ৳{Number(sale.paid_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-rose-600 text-right">
                    ৳{Number(sale.due_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(sale)}
                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale.Id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {isLoading && (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600/20 border-t-indigo-600"></div>
              <p className="text-slate-500 text-sm mt-4 font-medium italic">Loading transactions...</p>
            </div>
          )}
          {!isLoading && sales.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <p>No sales records found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4 px-2">
        <p className="text-sm font-bold text-slate-500">
          Showing <span className="text-slate-900">1</span> to <span className="text-slate-900">{sales.length}</span> of <span className="text-slate-900">{data?.meta?.count || 0}</span> entries
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousSet}
            disabled={startPage === 1}
            className="h-10 px-4 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition font-bold text-sm"
          >
            Prev
          </button>
          <div className="flex items-center gap-1.5">
            {[...Array(endPage - startPage + 1)].map((_, idx) => {
              const page = startPage + idx;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`h-10 w-10 rounded-xl transition font-bold text-sm ${page === currentPage ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleNextSet}
            disabled={endPage === totalPages}
            className="h-10 px-4 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition font-bold text-sm"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Sale Modal */}
      <Modal
        isOpen={isModalOpen1}
        onClose={() => setIsModalOpen1(false)}
        title="Create New Sale"
      >
        <form onSubmit={handleCreateSale} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Date</label>
              <input
                type="date"
                required
                value={createSale.transaction_date}
                onChange={(e) => setCreateSale({ ...createSale, transaction_date: e.target.value })}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Buyer</label>
              <Select
                options={buyerOptions}
                onChange={(opt) => setCreateSale({ ...createSale, buyerId: opt?.value || "" })}
                placeholder="Select Buyer..."
                isClearable
                styles={selectStyles}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Product</label>
            <Select
              options={productOptions}
              onChange={(opt) => setCreateSale({ ...createSale, productId: opt?.value || "" })}
              placeholder="Select Product..."
              isClearable
              styles={selectStyles}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Qty</label>
              <input
                type="number"
                step="0.001"
                required
                placeholder="0"
                value={createSale.quantity}
                onChange={(e) => setCreateSale({ ...createSale, quantity: e.target.value })}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Rate</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={createSale.rate}
                onChange={(e) => setCreateSale({ ...createSale, rate: e.target.value })}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Paid</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={createSale.paid_amount}
                onChange={(e) => setCreateSale({ ...createSale, paid_amount: e.target.value })}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Remarks</label>
            <textarea
              value={createSale.remarks}
              onChange={(e) => setCreateSale({ ...createSale, remarks: e.target.value })}
              className="w-full min-h-[100px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition resize-none"
              placeholder="Add notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen1(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 active:scale-95"
            >
              Confirm Sale
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Sale Modal */}
      <Modal
        isOpen={isModalOpen && !!currentSale}
        onClose={() => setIsModalOpen(false)}
        title="Edit Sale Record"
      >
        <form onSubmit={handleUpdateSale} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Date</label>
              <input
                type="date"
                required
                value={currentSale?.transaction_date || ""}
                onChange={(e) => setCurrentSale({ ...currentSale, transaction_date: e.target.value })}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Buyer</label>
              <Select
                options={buyerOptions}
                value={buyerOptions.find(o => o.value === currentSale?.buyerId)}
                onChange={(opt) => setCurrentSale({ ...currentSale, buyerId: opt?.value || "" })}
                placeholder="Select Buyer..."
                isClearable
                styles={selectStyles}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Product</label>
            <Select
              options={productOptions}
              value={productOptions.find(o => o.value === currentSale?.productId)}
              onChange={(opt) => setCurrentSale({ ...currentSale, productId: opt?.value || "" })}
              placeholder="Select Product..."
              isClearable
              styles={selectStyles}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Qty</label>
              <input
                type="number"
                step="0.001"
                required
                value={currentSale?.quantity || ""}
                onChange={(e) => setCurrentSale({ ...currentSale, quantity: e.target.value })}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Rate</label>
              <input
                type="number"
                step="0.01"
                required
                value={currentSale?.rate || ""}
                onChange={(e) => setCurrentSale({ ...currentSale, rate: e.target.value })}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Paid</label>
              <input
                type="number"
                step="0.01"
                value={currentSale?.paid_amount || ""}
                onChange={(e) => setCurrentSale({ ...currentSale, paid_amount: e.target.value })}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Remarks</label>
            <textarea
              value={currentSale?.remarks || ""}
              onChange={(e) => setCurrentSale({ ...currentSale, remarks: e.target.value })}
              className="w-full min-h-[100px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition resize-none"
              placeholder="Add notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 active:scale-95"
            >
              Update Sale
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default SaleTable;
