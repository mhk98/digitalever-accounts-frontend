import { motion } from "framer-motion";
import { Edit, PackageSearch, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  useDeleteMetaMutation,
  useGetAllMetaQuery,
  useGetAllMetaWithoutQueryQuery,
  useInsertMetaMutation,
  useUpdateMetaMutation,
} from "../../features/marketing/marketing";

const SEOTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  const [currentProduct, setCurrentProduct] = useState(null);

  // ✅ Add form state
  const [createProduct, setCreateProduct] = useState({
    amount: "",
  });

  const [products, setProducts] = useState([]);

  // ✅ Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);
  const itemsPerPage = 10;

  // Responsive pagesPerSet
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

  // Filters change হলে page reset
  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate]);

  // startDate > endDate হলে endDate ঠিক করে দেবে
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  // Query args
  const queryArgs = {
    page: currentPage,
    limit: itemsPerPage,
    platform: "SEO",
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data, isLoading, isError, error, refetch } =
    useGetAllMetaQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching meta data", error);
    } else if (!isLoading && data) {
      const onlySEO = (data.data || []).filter(
        (item) => item.platform === "SEO",
      );
      setProducts(onlySEO);
      setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error, currentPage]);

  // Modals
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => setIsModalOpen1(false);

  const handleEditClick = (rp) => {
    setCurrentProduct({
      ...rp,
      amount: rp.amount ?? "",
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => setIsModalOpen(false);

  // ✅ Insert
  const [insertMeta] = useInsertMetaMutation();
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.amount) return toast.error("Amount is required!");

    try {
      const payload = {
        platform: "SEO",
        amount: Number(createProduct.amount),
      };

      const res = await insertMeta(payload).unwrap();
      if (res?.success) {
        toast.success("Successfully created meta");
        setIsModalOpen1(false);
        setCreateProduct({ amount: "" });
        refetch?.();
      } else {
        toast.error(res?.message || "Create failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // ✅ Update
  const [updateMeta] = useUpdateMetaMutation();
  const handleUpdateProduct = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid item!");

    try {
      const payload = {
        amount: Number(currentProduct.amount),
      };

      const res = await updateMeta({
        id: currentProduct.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated!");
        setIsModalOpen(false);
        refetch?.();
      } else {
        toast.error(res?.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // ✅ Delete
  const [deleteMeta] = useDeleteMetaMutation();
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this item?");
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteMeta(id).unwrap();
      if (res?.success) {
        toast.success("Deleted successfully!");
        refetch?.();
      } else {
        toast.error(res?.message || "Delete failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  // Filters clear
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  // Pagination
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
      Math.min(prev + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1)),
    );

  const {
    data: seoRes,
    isLoading: seoLoading,
    isError: seoError,
    error: seoErrObj,
  } = useGetAllMetaWithoutQueryQuery();

  const seo = seoRes?.data || [];

  // ✅ totals
  const totalSEOAmount = useMemo(() => {
    return seo
      ?.filter((item) => item.platform === "SEO")
      .reduce((sum, item) => sum + Number(item?.amount || 0), 0);
  }, [seo]);

  if (seoError) console.error("Purchase error:", seoErrObj);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Add Button */}
      <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          Add <Plus size={18} className="ml-2" />
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-3 rounded-md border border-gray-700 bg-gray-800/60 px-4 py-2">
          <div className="flex items-center gap-2 text-gray-300">
            <PackageSearch size={18} className="text-amber-400" />
            <span className="text-sm">Total SEO Expense</span>
          </div>

          <span className="text-white font-semibold tabular-nums">
            {seoLoading ? "Loading..." : totalSEOAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6 w-full justify-center mx-auto">
        <div className="flex items-center justify-center">
          <label className="mr-2 text-sm text-white">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded p-1 text-black bg-white"
          />
        </div>

        <div className="flex items-center justify-center">
          <label className="mr-2 text-sm text-white">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded p-1 text-black bg-white"
          />
        </div>

        <button
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {products.map((rp) => (
              <motion.tr
                key={rp.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {rp.createdAt
                    ? new Date(rp.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(rp.amount || 0).toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(rp)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(rp.Id)}
                    className="text-red-600 hover:text-red-900 ms-4"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}

            {!isLoading && products.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-6 text-center text-sm text-gray-300"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
              className={`px-3 py-2 text-black rounded-md ${
                pageNum === currentPage
                  ? "bg-white"
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
              Edit Meta Expense
            </h2>

            <div className="mt-4">
              <label className="block text-sm text-white">Amount:</label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.amount || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    amount: e.target.value, // ✅ fixed
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
                onClick={handleUpdateProduct}
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
            <h2 className="text-lg font-semibold text-white">
              Add SEO Expense
            </h2>

            <form onSubmit={handleCreateProduct}>
              <div className="mt-4">
                <label className="block text-sm text-white">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct.amount}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      amount: e.target.value,
                    })
                  }
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

export default SEOTable;
