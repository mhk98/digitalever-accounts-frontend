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

const SupplierTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Edit modal
  const [isModalOpen1, setIsModalOpen1] = useState(false); // Add modal

  const [currentProduct, setCurrentProduct] = useState(null);

  const [createProduct, setCreateProduct] = useState({ name: "" });
  const [name, setName] = useState(""); // ✅ search state

  console.log("name", name);

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);
  const itemsPerPage = 10;

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

  // const queryArgs = useMemo(
  //     () => ({
  //       page: currentPage,
  //       limit: itemsPerPage,
  //       name: name || undefined, // ✅ send Id
  //     }),
  //     [currentPage, itemsPerPage, name]
  //   );

  const { data, isLoading, isError, error, refetch } = useGetAllSupplierQuery({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: name || undefined,
  });

  const suppliers = data?.data ?? [];

  useEffect(() => {
    if (isError) {
      console.error("Error fetching supplier data", error);
    } else if (!isLoading && data?.meta?.total != null) {
      setTotalPages(Math.max(1, Math.ceil(data.meta.total / itemsPerPage)));
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

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

  // Create
  const [insertSupplier] = useInsertSupplierMutation();
  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: createProduct.name };

      const res = await insertSupplier(payload).unwrap();
      if (res?.success) {
        toast.success("Successfully created supplier");
        setIsModalOpen1(false);
        setCreateProduct({ name: "" });
        refetch?.();
      } else {
        toast.error("Create failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // Update
  const [updateSupplier] = useUpdateSupplierMutation();
  const handleUpdateSupplier = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid supplier selected!");

    try {
      const updated = { name: currentProduct.name || "" };

      const res = await updateSupplier({
        id: currentProduct.Id,
        data: updated,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated supplier!");
        setIsModalOpen(false);
        setCurrentProduct(null);
        refetch?.();
      } else {
        toast.error("Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // Delete
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
      } else {
        toast.error("Delete failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (pageNumber < startPage) setStartPage(pageNumber);
    else if (pageNumber > endPage) setStartPage(pageNumber - pagesPerSet + 1);
  };

  const handlePreviousSet = () =>
    setStartPage((p) => Math.max(p - pagesPerSet, 1));
  const handleNextSet = () =>
    setStartPage((p) =>
      Math.min(p + pagesPerSet, Math.max(1, totalPages - pagesPerSet + 1)),
    );

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="relative w-full max-w-[520px]">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setCurrentPage(1);
              setStartPage(1);
            }}
            placeholder="Search by supplier name..."
            className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-700 outline-none focus:border-gray-300"
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
        </div>

        {/* Add button */}
        <button
          onClick={handleAddSupplier}
          type="button"
          className="ml-6 inline-flex h-11 w-[320px] items-center justify-center gap-2 rounded bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add New Supplier
        </button>
      </div>

      {/* List */}
      <div className="mt-10">
        {suppliers.map((item) => (
          <div
            key={item.Id}
            className="flex items-center justify-between border-b border-gray-100 py-6"
          >
            {/* Left */}

            <div className="flex items-center gap-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50">
                <LucideTruck className="text-indigo-600" size={18} />
              </div>

              <div>
                <div className="text-[16px] font-semibold text-white">
                  {item.name}
                </div>
                {/* <div className="mt-1 text-sm text-white">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "-"}
                </div> */}
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4 pr-2">
              <button
                onClick={() => handleEditSupplier(item)}
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-gray-50"
                title="Edit"
              >
                <Pencil className="text-indigo-600" size={18} />
              </button>

              <button
                onClick={() => handleDeleteSupplier(item.Id)}
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-gray-50"
                title="Delete"
              >
                <Trash2 className="text-red-600" size={18} />
              </button>
            </div>
          </div>
        ))}

        {!isLoading && suppliers.length === 0 && (
          <div className="py-10 text-sm text-gray-500">No data found</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={handlePreviousSet}
          disabled={startPage === 1}
          className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
        >
          Prev
        </button>

        {[...Array(endPage - startPage + 1)].map((_, index) => {
          const pageNum = startPage + index;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-2 text-white rounded-md ${
                pageNum === currentPage
                  ? "bg-indigo-600"
                  : "bg-indigo-500 hover:bg-indigo-400"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={handleNextSet}
          disabled={endPage === totalPages}
          className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">
              Rename Supplier
            </h2>

            <div className="mt-4">
              <label className="block text-sm text-white">Supplier Name</label>
              <input
                type="text"
                value={currentProduct?.name || ""}
                onChange={(e) =>
                  setCurrentProduct((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
                onClick={handleUpdateSupplier}
              >
                Save
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
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
        <div className="fixed inset-0 top-12 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">Add Supplier</h2>

            <form onSubmit={handleCreateSupplier}>
              <div className="mt-4">
                <label className="block text-sm text-white">
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={createProduct.name}
                  onChange={(e) => setCreateProduct({ name: e.target.value })}
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
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

export default SupplierTable;
