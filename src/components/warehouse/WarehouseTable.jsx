import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, Warehouse } from "lucide-react";
import toast from "react-hot-toast";
import {
  useDeleteWirehouseMutation,
  useGetAllWirehouseQuery,
  useInsertWirehouseMutation,
  useUpdateWirehouseMutation,
} from "../../features/wirehouse/wirehouse";

const WarehouseTable = () => {
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

  const { data, isLoading, isError, error, refetch } = useGetAllWirehouseQuery({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: name || undefined,
  });

  const warehouses = data?.data ?? [];

  useEffect(() => {
    if (isError) {
      console.error("Error fetching warehouse data", error);
      return;
    }
    if (!isLoading && data?.meta?.count != null) {
      setTotalPages(Math.max(1, Math.ceil(data.meta.count / itemsPerPage)));
    }
  }, [data, isLoading, isError, error]);

  // ✅ Modals
  const handleModalClose = () => setIsModalOpen(false);
  const handleModalClose1 = () => setIsModalOpen1(false);

  const handleEditWarehouse = (item) => {
    setCurrentProduct(item);
    setIsModalOpen(true);
  };

  const handleAddWarehouse = () => {
    setCreateProduct({ name: "" });
    setIsModalOpen1(true);
  };

  // ✅ Create
  const [insertWirehouse] = useInsertWirehouseMutation();
  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    if (!createProduct.name?.trim()) return toast.error("Name is required!");

    try {
      const payload = { name: createProduct.name.trim() };
      const res = await insertWirehouse(payload).unwrap();

      if (res?.success) {
        toast.success("Warehouse created successfully!");
        setIsModalOpen1(false);
        setCreateProduct({ name: "" });
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // ✅ Update
  const [updateWirehouse] = useUpdateWirehouseMutation();
  const handleUpdateWarehouse = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid warehouse selected!");
    if (!currentProduct?.name?.trim()) return toast.error("Name is required!");

    try {
      const updated = {
        name: currentProduct.name.trim(),
        userId: userId,
        actorRole: role,
      };
      const res = await updateWirehouse({
        id: currentProduct.Id,
        data: updated,
      }).unwrap();

      if (res?.success) {
        toast.success("Warehouse updated successfully!");
        setIsModalOpen(false);
        setCurrentProduct(null);
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // ✅ Delete
  const [deleteWirehouse] = useDeleteWirehouseMutation();
  const handleDeleteWarehouse = async (id) => {
    const confirmDelete = window.confirm(
      "Do you want to delete this warehouse?",
    );
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteWirehouse(id).unwrap();
      if (res?.success) {
        toast.success("Warehouse deleted successfully!");
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
            placeholder="Search warehouse..."
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
          onClick={handleAddWarehouse}
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          <Plus size={18} />
          Add New Warehouse
        </button>
      </div>

      {/* List */}
      <div className="mt-6 rounded-2xl border border-slate-200 overflow-hidden">
        {warehouses.map((item) => (
          <div
            key={item.Id}
            className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            {/* Left */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                <Warehouse className="text-indigo-600" size={18} />
              </div>

              <div className="text-[15px] font-semibold text-slate-900">
                {item.name}
              </div>
            </div>

            {/* Right */}
            {(role === "superAdmin" || role === "admin") && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditWarehouse(item)}
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition"
                  title="Edit"
                >
                  <Pencil className="text-indigo-600" size={18} />
                </button>

                <button
                  onClick={() => handleDeleteWarehouse(item.Id)}
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

        {!isLoading && warehouses.length === 0 && (
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
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {isModalOpen && currentProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center   p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-lg border border-slate-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Rename Warehouse
            </h2>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">
                Warehouse Name
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
                className="border bg-white border-slate-200 rounded-xl p-2 w-full mt-1 text-slate-900 outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl"
                onClick={handleUpdateWarehouse}
              >
                Save
              </button>
              <button
                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
                onClick={handleModalClose}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center   p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-lg border border-slate-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Add Warehouse
            </h2>

            <form onSubmit={handleCreateWarehouse}>
              <div className="mt-4">
                <label className="block text-sm text-slate-700">
                  Warehouse Name
                </label>
                <input
                  type="text"
                  value={createProduct.name}
                  onChange={(e) => setCreateProduct({ name: e.target.value })}
                  className="border bg-white border-slate-200 rounded-xl p-2 w-full mt-1 text-slate-900 outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
                  onClick={handleModalClose1}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default WarehouseTable;
