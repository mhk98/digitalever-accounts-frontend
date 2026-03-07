import { motion } from "framer-motion";
import { Edit, Plus, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

import {
  useDeleteProductMutation,
  useGetAllProductQuery,
  useGetAllProductWithoutQueryQuery,
  useInsertProductMutation,
  useUpdateProductMutation,
} from "../../features/product/product";

import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";
import { useGetAllWirehouseWithoutQueryQuery } from "../../features/wirehouse/wirehouse";
import Modal from "../common/Modal";

const ProductsTable = () => {
  const role = localStorage.getItem("role");

  const [isModalOpen, setIsModalOpen] = useState(false); // Edit modal
  const [isModalOpen1, setIsModalOpen1] = useState(false); // Add modal
  const [currentProduct, setCurrentProduct] = useState(null);

  const [createProduct, setCreateProduct] = useState({
    name: "",
    warehouseId: "",
    supplierId: "",
  });

  const [products, setProducts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [name, setName] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [supplier, setSupplier] = useState("");

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
  }, [startDate, endDate, name, warehouse, supplier, itemsPerPage]);

  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (pageNumber < startPage) setStartPage(pageNumber);
    else if (pageNumber > endPage) setStartPage(pageNumber - pagesPerSet + 1);
  };

  const handlePreviousSet = () => setStartPage((prev) => Math.max(prev - pagesPerSet, 1));
  const handleNextSet = () => setStartPage((prev) => Math.min(prev + pagesPerSet, Math.max(1, totalPages - pagesPerSet + 1)));

  const { data: allProductsRes } = useGetAllProductWithoutQueryQuery();
  const productsData = allProductsRes?.data || [];

  const { data: allSupplierRes } = useGetAllSupplierWithoutQueryQuery();
  const suppliers = allSupplierRes?.data || [];

  const { data: allWarehousesRes } = useGetAllWirehouseWithoutQueryQuery();
  const warehouses = allWarehousesRes?.data || [];

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 12,
      borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 4px rgba(99, 102, 241, 0.1)" : "none",
      "&:hover": { borderColor: "#cbd5e1" },
      backgroundColor: "white",
    }),
    placeholder: (base) => ({ ...base, color: "#94a3b8", fontSize: "14px" }),
    singleValue: (base) => ({ ...base, color: "#1e293b", fontSize: "14px", fontWeight: "500" }),
    menu: (base) => ({
      ...base,
      borderRadius: 14,
      overflow: "hidden",
      border: "1px solid #f1f5f9",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
      zIndex: 50
    }),
  };

  const supplierOptions = useMemo(() => suppliers.map((w) => ({ value: w.Id, label: w.name })), [suppliers]);
  const warehouseOptions = useMemo(() => warehouses.map((w) => ({ value: w.Id, label: w.name })), [warehouses]);
  const productOptions = useMemo(() => productsData.map((p) => ({ value: p.name, label: p.name })), [productsData]);

  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      name: name?.trim() ? name.trim() : undefined,
      warehouseId: warehouse || undefined,
      supplierId: supplier || undefined,
    };
    Object.keys(args).forEach((k) => {
      if (!args[k]) delete args[k];
    });
    return args;
  }, [currentPage, itemsPerPage, startDate, endDate, name, warehouse, supplier]);

  const { data, isLoading, isError, error, refetch } = useGetAllProductQuery(queryArgs);

  useEffect(() => {
    if (!isLoading && data?.data) {
      setProducts(data.data);
      setTotalPages(Math.max(1, Math.ceil((data?.meta?.count || 0) / itemsPerPage)));
    }
  }, [data, isLoading, itemsPerPage]);

  const handleEditClick = (product) => {
    setCurrentProduct({
      ...product,
      warehouseId: product.warehouseId ?? product?.warehouse?.Id ?? "",
      supplierId: product.supplierId ?? product?.supplier?.Id ?? "",
    });
    setIsModalOpen(true);
  };

  const [insertProduct] = useInsertProductMutation();
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await insertProduct(createProduct).unwrap();
      if (res?.success) {
        toast.success("Successfully created product");
        setIsModalOpen1(false);
        setCreateProduct({ name: "", warehouseId: "", supplierId: "" });
        refetch();
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  const [updateProduct] = useUpdateProductMutation();
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProduct({
        id: currentProduct.Id,
        data: {
          name: currentProduct.name,
          supplierId: currentProduct.supplierId,
          warehouseId: Number(currentProduct.warehouseId),
        },
      }).unwrap();
      if (res?.success) {
        toast.success("Successfully updated product!");
        setIsModalOpen(false);
        refetch();
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const [deleteProduct] = useDeleteProductMutation();
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Do you want to delete this product?")) {
      try {
        const res = await deleteProduct(id).unwrap();
        if (res?.success) {
          toast.success("Product deleted successfully!");
          refetch();
        }
      } catch (err) {
        toast.error(err?.data?.message || "Delete failed!");
      }
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setName("");
    setWarehouse("");
    setSupplier("");
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-sm rounded-3xl p-4 sm:p-8 border border-slate-100 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Products Inventory</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage and monitor all warehouse products</p>
        </div>
        <button
          className="group relative inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-all px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 active:scale-95 overflow-hidden"
          onClick={() => setIsModalOpen1(true)}
          type="button"
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-10 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 items-end">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Per Page</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold text-sm appearance-none cursor-pointer"
          >
            {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="flex flex-col lg:col-span-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Warehouse</label>
          <Select
            options={warehouseOptions}
            value={warehouseOptions.find(o => String(o.value) === String(warehouse)) || null}
            onChange={(s) => setWarehouse(s?.value || "")}
            placeholder="Warehouse..."
            isClearable
            styles={selectStyles}
          />
        </div>

        <div className="flex flex-col lg:col-span-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Supplier</label>
          <Select
            options={supplierOptions}
            value={supplierOptions.find(o => String(o.value) === String(supplier)) || null}
            onChange={(s) => setSupplier(s?.value || "")}
            placeholder="Supplier..."
            isClearable
            styles={selectStyles}
          />
        </div>

        <div className="flex flex-col lg:col-span-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Product</label>
          <Select
            options={productOptions}
            value={productOptions.find(o => o.value === name) || null}
            onChange={(s) => setName(s?.value || "")}
            placeholder="Search..."
            isClearable
            styles={selectStyles}
          />
        </div>

        <button
          className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 transition rounded-xl px-4 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 border border-slate-200"
          onClick={clearFilters}
          type="button"
        >
          <X size={16} /> Clear
        </button>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  Product Details
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  Warehouse
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  Supplier
                </th>
                <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <motion.tr
                  key={product.Id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold bg-white text-slate-600 border border-slate-200 shadow-sm">
                      {product.warehouse?.name || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm shadow-indigo-50">
                      {product.supplier?.name || "-"}
                    </span>
                  </td>

                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    {(role === "superAdmin" || role === "admin") && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition shadow-sm active:scale-90"
                          title="Edit"
                          type="button"
                        >
                          <Edit className="text-indigo-600" size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product.Id)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition shadow-sm active:scale-90"
                          title="Delete"
                          type="button"
                        >
                          <Trash2 className="text-red-600" size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600/20 border-t-indigo-600"></div>
              <p className="text-slate-500 text-sm mt-4 font-bold tracking-tight">Syncing Inventory...</p>
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <div className="text-4xl mb-4 opacity-20">📦</div>
              <p className="font-bold text-sm italic">No matching products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-6 px-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Showing Page <span className="text-indigo-600">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousSet}
            disabled={startPage === 1}
            className="h-11 px-5 border border-slate-200 rounded-2xl bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 transition active:scale-95 flex items-center gap-2 shadow-sm"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <div className="flex items-center gap-1.5">
            {[...Array(endPage - startPage + 1)].map((_, index) => {
              const pageNum = startPage + index;
              const active = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-11 w-11 rounded-2xl font-black text-sm transition-all active:scale-90 ${active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "bg-white text-slate-600 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleNextSet}
            disabled={endPage === totalPages}
            className="h-11 px-5 border border-slate-200 rounded-2xl bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 transition active:scale-95 flex items-center gap-2 shadow-sm"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Product Info"
      >
        <form onSubmit={handleUpdateProduct} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Product Name</label>
            <input
              type="text"
              required
              value={currentProduct?.name || ""}
              onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
              className="h-12 border border-slate-200 rounded-2xl px-4 w-full text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold"
              placeholder="Enter product name..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Warehouse</label>
              <select
                required
                value={currentProduct?.warehouseId || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, warehouseId: e.target.value })}
                className="h-12 border border-slate-200 rounded-2xl px-4 w-full text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold appearance-none cursor-pointer"
              >
                <option value="">Select...</option>
                {warehouses.map((w) => <option key={w.Id} value={w.Id}>{w.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Supplier</label>
              <select
                required
                value={currentProduct?.supplierId || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, supplierId: e.target.value })}
                className="h-12 border border-slate-200 rounded-2xl px-4 w-full text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold appearance-none cursor-pointer"
              >
                <option value="">Select...</option>
                {suppliers.map((s) => <option key={s.Id} value={s.Id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition active:scale-95"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 active:scale-95"
            >
              Update Product
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isModalOpen1}
        onClose={() => setIsModalOpen1(false)}
        title="Register New Product"
      >
        <form onSubmit={handleCreateProduct} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Product Name</label>
            <input
              type="text"
              required
              value={createProduct.name}
              onChange={(e) => setCreateProduct({ ...createProduct, name: e.target.value })}
              className="h-12 border border-slate-200 rounded-2xl px-4 w-full bg-white text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold"
              placeholder="e.g. MacBook Pro M3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Warehouse</label>
              <select
                required
                value={createProduct.warehouseId}
                onChange={(e) => setCreateProduct({ ...createProduct, warehouseId: e.target.value })}
                className="h-12 border border-slate-200 rounded-2xl px-4 w-full text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold appearance-none cursor-pointer"
              >
                <option value="">Select...</option>
                {warehouses.map((w) => <option key={w.Id} value={w.Id}>{w.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Supplier</label>
              <select
                required
                value={createProduct.supplierId}
                onChange={(e) => setCreateProduct({ ...createProduct, supplierId: e.target.value })}
                className="h-12 border border-slate-200 rounded-2xl px-4 w-full text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold appearance-none cursor-pointer"
              >
                <option value="">Select...</option>
                {suppliers.map((s) => <option key={s.Id} value={s.Id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition active:scale-95"
              onClick={() => setIsModalOpen1(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 active:scale-95"
            >
              Add Product
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default ProductsTable;
