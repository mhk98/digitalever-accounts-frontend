import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LucideTruck, Pencil, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  useDeleteSupplierMutation,
  useGetAllSupplierQuery,
  useInsertSupplierMutation,
  useUpdateSupplierMutation,
} from "../../features/supplier/supplier";
import Modal from "../common/Modal";
import { Link } from "react-router-dom";

const SupplierTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Edit modal
  const [isModalOpen1, setIsModalOpen1] = useState(false); // Add modal

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [currentProduct, setCurrentProduct] = useState(null);
  const [createProduct, setCreateProduct] = useState({ name: "" });

  const [name, setName] = useState(""); // search term

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);

  const itemsPerPage = 10;

  // ✅ Responsive pagination window
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

  const { data, isLoading, isError, error, refetch } = useGetAllSupplierQuery({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: name || undefined,
  });

  const suppliers = data?.data ?? [];

  useEffect(() => {
    if (isError) {
      console.error("Error fetching supplier data", error);
      return;
    }
    if (!isLoading && data?.meta?.count != null) {
      setTotalPages(Math.max(1, Math.ceil(data.meta.count / itemsPerPage)));
    }
  }, [data, isLoading, isError, error]);

  // ✅ Modals
  const handleModalClose = () => setIsModalOpen(false);
  const handleModalClose1 = () => setIsModalOpen1(false);

  const handleEditSupplier = (item) => {
    setCurrentProduct(item);
    setIsModalOpen(true);
  };

  const handleAddSupplier = () => {
    setCreateProduct({ name: "" });
    setIsModalOpen1(true);
  };

  // ✅ Create
  const [insertSupplier] = useInsertSupplierMutation();
  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!createProduct.name?.trim()) return toast.error("Name is required!");

    try {
      const payload = { name: createProduct.name.trim() };
      const res = await insertSupplier(payload).unwrap();

      if (res?.success) {
        toast.success("Supplier created successfully!");
        setIsModalOpen1(false);
        setCreateProduct({ name: "" });
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // ✅ Update
  const [updateSupplier] = useUpdateSupplierMutation();
  const handleUpdateSupplier = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid supplier selected!");
    if (!currentProduct?.name?.trim()) return toast.error("Name is required!");

    try {
      const updated = {
        name: currentProduct.name.trim(),
        userId: userId,
        actorRole: role,
      };
      const res = await updateSupplier({
        id: currentProduct.Id,
        data: updated,
      }).unwrap();

      if (res?.success) {
        toast.success("Supplier updated successfully!");
        setIsModalOpen(false);
        setCurrentProduct(null);
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // ✅ Delete
  const [deleteSupplier] = useDeleteSupplierMutation();
  const handleDeleteSupplier = async (id) => {
    const confirmDelete = window.confirm(
      "Do you want to delete this supplier?",
    );
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteSupplier(id).unwrap();
      if (res?.success) {
        toast.success("Supplier deleted successfully!");
        refetch?.();
      } else toast.error(res?.message || "Delete failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  // ✅ Pagination
  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const handlePageChange = (pageNumber) => {
    const p = Number(pageNumber);
    setCurrentPage(p);

    if (p < startPage) setStartPage(p);
    else if (p > endPage) setStartPage(p - pagesPerSet + 1);
  };

  const handlePreviousSet = () =>
    setStartPage((p) => Math.max(p - pagesPerSet, 1));

  const handleNextSet = () =>
    setStartPage((p) =>
      Math.min(p + pagesPerSet, Math.max(1, totalPages - pagesPerSet + 1)),
    );

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-[520px]">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setCurrentPage(1);
              setStartPage(1);
            }}
            placeholder="Search supplier..."
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-700 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
        </div>

        {/* Add button */}
        <button
          onClick={handleAddSupplier}
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          <Plus size={18} />
          Add New Supplier
        </button>
      </div>

      {/* List */}
      <div className="mt-6 rounded-2xl border border-slate-200 overflow-hidden">
        {suppliers.map((item) => (
          <div
            key={item.Id}
            className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            {/* Left */}
            <Link
              to={`/supplier-history/${item.Id}`}
              className="flex items-center gap-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                <LucideTruck className="text-indigo-600" size={18} />
              </div>

              <div className="text-[15px] font-semibold text-slate-900 hover:text-indigo-600">
                {item.name}
              </div>
            </Link>

            {/* Right */}
            {(role === "superAdmin" || role === "admin") && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditSupplier(item)}
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition"
                  title="Edit"
                >
                  <Pencil className="text-indigo-600" size={18} />
                </button>

                <button
                  onClick={() => handleDeleteSupplier(item.Id)}
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition"
                  title="Delete"
                >
                  <Trash2 className="text-red-600" size={18} />
                </button>
              </div>
            )}
          </div>
        ))}

        {!isLoading && suppliers.length === 0 && (
          <div className="px-6 py-10 text-sm text-slate-500">No data found</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
        <button
          onClick={handlePreviousSet}
          disabled={startPage === 1}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
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
              className={`px-4 py-2 rounded-xl border transition ${active
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
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
        >
          Next
        </button>
      </div>

      {/* ✅ Edit Modal */}
      <Modal
        isOpen={isModalOpen && !!currentProduct}
        onClose={handleModalClose}
        title="Rename Supplier"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Supplier Name
            </label>
            <input
              type="text"
              value={currentProduct?.name || ""}
              onChange={(e) =>
                setCurrentProduct((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="h-11 px-3 border border-slate-200 rounded-xl w-full text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              placeholder="Enter supplier name"
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition"
              onClick={handleModalClose}
            >
              Cancel
            </button>
            <button
              className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition"
              onClick={handleUpdateSupplier}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* ✅ Add Modal */}
      <Modal
        isOpen={isModalOpen1}
        onClose={handleModalClose1}
        title="Add New Supplier"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Supplier Name
            </label>
            <input
              type="text"
              value={createProduct.name}
              onChange={(e) => setCreateProduct({ name: e.target.value })}
              className="h-11 px-3 border border-slate-200 rounded-xl w-full text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              placeholder="Enter supplier name"
              required
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition"
              onClick={handleModalClose1}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition"
            >
              Add Supplier
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default SupplierTable;
