import { motion } from "framer-motion";
import { Edit, Notebook, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

import { useGetAllAssetsPurchaseWithoutQueryQuery } from "../../features/assetsPurchase/assetsPurchase";
import {
  useDeleteAssetsDamageMutation,
  useGetAllAssetsDamageQuery,
  useInsertAssetsDamageMutation,
  useUpdateAssetsDamageMutation,
} from "../../features/assetsDamage/assetsDamage";

const AssetsDamageTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [currentProduct, setCurrentProduct] = useState(null);

  // ✅ INSERT form
  const [createProduct, setCreateProduct] = useState({
    productId: "",
    name: "",
    quantity: "",
    price: "",
  });

  const [products, setProducts] = useState([]);

  console.log("products", products);

  // ✅ Filters: start/end + productId (strong & clean)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterProductName, setFilterProductName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);
  const itemsPerPage = 10;

  // ✅ All products (Purchase list)
  const {
    data: allProductsRes,
    isLoading: isLoadingAllProducts,
    isError: isErrorAllProducts,
    error: errorAllProducts,
  } = useGetAllAssetsPurchaseWithoutQueryQuery();

  const productsData = allProductsRes?.data || [];

  useEffect(() => {
    if (isErrorAllProducts)
      console.error("Error fetching products", errorAllProducts);
  }, [isErrorAllProducts, errorAllProducts]);

  // ✅ Dropdown options
  const productDropdownOptions = useMemo(() => {
    return (productsData || []).map((p) => ({
      value: p.Id,
      label: p.name || "Unnamed",
    }));
  }, [productsData]);

  // ✅ productId -> name map
  const productNameMap = useMemo(() => {
    const m = new Map();
    (productsData || []).forEach((p) => {
      const key = p.Id;
      m.set(key, p.name);
    });
    return m;
  }, [productsData]);

  const resolveProductName = (row) => {
    // ✅ backend sale row already has name
    if (row?.name) return row.name;

    // fallback (future if you add productId relation)
    const pid = row?.productId ?? row?.product?.Id ?? row?.product?.id;
    if (!pid) return "N/A";
    return productNameMap.get(String(pid)) || "N/A";
  };

  // ✅ Responsive pagination
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

  // ✅ reset page on filters change
  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate, filterProductName]);

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ Query args clean
  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      name: filterProductName || undefined, // ✅ name যাবে
    };

    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "")
        delete args[k];
    });

    return args;
  }, [currentPage, itemsPerPage, startDate, endDate, filterProductName]);

  const { data, isLoading, isError, error, refetch } =
    useGetAllAssetsDamageQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching assets sale", error);
      return;
    }
    if (!isLoading && data) {
      setProducts(data?.data || []);
      setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

  // ✅ Modals
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => setIsModalOpen1(false);
  const handleDeleteClose = () => setIsModalOpen2(false);

  const handleDeleteClick = (row) => {
    setCurrentProduct({
      ...row,
      productId: String(row.productId ?? ""),
      quantity: row.quantity ?? "",
      price: row.price ?? "",
      userId: userId,
    });
    setIsModalOpen2(true);
  };
  const handleEditClick = (row) => {
    setCurrentProduct({
      ...row,
      productId: String(row.productId ?? ""),
      quantity: row.quantity ?? "",
      price: row.price ?? "",
      userId: userId,
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => setIsModalOpen(false);

  // ✅ Insert
  const [insertAssetsDamage] = useInsertAssetsDamageMutation();

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.productId) return toast.error("Please select a product");
    if (!createProduct.quantity || Number(createProduct.quantity) <= 0)
      return toast.error("Please enter a valid quantity");
    if (createProduct.price === "" || Number(createProduct.price) < 0)
      return toast.error("Please enter a valid price");

    try {
      const payload = {
        productId: Number(createProduct.productId),
        quantity: Number(createProduct.quantity),
        price: Number(createProduct.price),
      };

      const res = await insertAssetsDamage(payload).unwrap();

      if (res?.success) {
        toast.success("Successfully created sale!");
        setIsModalOpen1(false);
        setCreateProduct({ productId: "", quantity: "", price: "" });
        refetch?.();
      } else {
        toast.error(res?.message || "Create failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // ✅ Update
  const [updateAssetsDamage] = useUpdateAssetsDamageMutation();

  const handleUpdateDelete = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid item!");
    if (currentProduct?.note === "" || currentProduct?.note === null)
      return toast.error("Note is required!");

    try {
      const payload = {
        productId: Number(currentProduct.productId),
        quantity: Number(currentProduct.quantity),
        price: Number(currentProduct.price),
        note: currentProduct.note,
        status: currentProduct.status,
        userId: userId,
      };

      const res = await updateAssetsDamage({
        id: currentProduct.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated product!");
        setIsModalOpen2(false);
        refetch?.();
      } else {
        toast.error(res?.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleUpdateProduct = async () => {
    const rowId = currentProduct?.Id ?? currentProduct?.id;
    if (!rowId) return toast.error("Invalid row!");
    if (!currentProduct?.productId)
      return toast.error("Please select a product");
    if (!currentProduct?.quantity || Number(currentProduct.quantity) <= 0)
      return toast.error("Please enter a valid quantity");
    if (currentProduct.price === "" || Number(currentProduct.price) < 0)
      return toast.error("Please enter a valid price");

    try {
      const payload = {
        productId: Number(currentProduct.productId),
        quantity: Number(currentProduct.quantity),
        price: Number(currentProduct.price),
        note: currentProduct.note,
        status: currentProduct.status,
        userId: userId,
      };

      const res = await updateAssetsDamage({
        id: rowId,
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
  const [deleteAssetsDamage] = useDeleteAssetsDamageMutation();

  const handleDeleteProduct = async (rowId) => {
    if (!window.confirm("Do you want to delete this sale row?")) return;

    try {
      const res = await deleteAssetsDamage(rowId).unwrap();
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

  // ✅ Clear Filters
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterProductName("");
  };

  // ✅ Pagination
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
      Math.min(p + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1)),
    );

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Add Button + Total */}
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
            <ShoppingBasket size={18} className="text-amber-400" />
            <span className="text-sm">Total Damage</span>
          </div>

          <span className="text-white font-semibold tabular-nums">
            {isLoading ? "Loading..." : data?.meta?.totalQuantity}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-6 w-full justify-center mx-auto">
        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
          />
        </div>

        <div className="flex items-center justify-center mt-6">
          <Select
            className="text-black"
            options={productDropdownOptions}
            value={
              filterProductName
                ? productDropdownOptions.find(
                    (o) => o.label === filterProductName,
                  )
                : null
            }
            onChange={(selected) => setFilterProductName(selected?.label || "")}
            placeholder="Select Assets"
            isClearable
          />
        </div>

        <button
          className="flex items-center mt-6 bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto"
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
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Price
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {products.map((row) => {
              const rowId = row.Id ?? row.id;
              const total = Number(
                row.total ?? Number(row.quantity || 0) * Number(row.price || 0),
              );

              return (
                <motion.tr
                  key={rowId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    {resolveProductName(row)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {Number(row.quantity || 0).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {Number(row.price || 0).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {total.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {row.status}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {row.note && (
                      <button
                        className="text-white-600 hover:text-white-900"
                        title={row.note}
                      >
                        <Notebook size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditClick(row)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={18} />
                    </button>

                    {role === "superAdmin" || row.status === "Approved" ? (
                      <button
                        onClick={() => handleDeleteProduct(rowId)}
                        className="text-red-600 hover:text-red-900 ms-4"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteClick(row)}
                        className="text-red-600 hover:text-red-900 ms-4"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </motion.tr>
              );
            })}

            {!isLoading && products.length === 0 && (
              <tr>
                <td
                  colSpan={5}
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
      {isModalOpen && currentProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">Edit Sale</h2>

            <div className="mt-4">
              <label className="block text-sm text-white">Product:</label>
              <Select
                options={productDropdownOptions}
                value={
                  currentProduct.productId
                    ? productDropdownOptions.find(
                        (o) => o.value === String(currentProduct.productId),
                      )
                    : null
                }
                onChange={(selected) =>
                  setCurrentProduct((p) => ({
                    ...p,
                    productId: selected?.value || "",
                  }))
                }
                placeholder="Select Product"
                isClearable
                className="text-black w-full"
                isDisabled={isLoadingAllProducts}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">Quantity:</label>
              <input
                type="number"
                step="0.01"
                value={currentProduct.quantity}
                onChange={(e) =>
                  setCurrentProduct((p) => ({ ...p, quantity: e.target.value }))
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">Price:</label>
              <input
                type="number"
                step="0.01"
                value={currentProduct.price}
                onChange={(e) =>
                  setCurrentProduct((p) => ({ ...p, price: e.target.value }))
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                required
              />
            </div>

            {role === "superAdmin" ? (
              <div className="mt-4">
                <label className="block text-sm text-white">Status</label>
                <select
                  value={currentProduct.status || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      status: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            ) : (
              <div className="mt-4">
                <label className="block text-sm text-white">Note:</label>
                <textarea
                  type="text"
                  value={currentProduct?.note || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      note: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                />
              </div>
            )}

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
            <h2 className="text-lg font-semibold text-white">Add Sale</h2>

            <form onSubmit={handleCreateProduct}>
              <div className="mt-4">
                <label className="block text-sm text-white">Product:</label>
                <Select
                  options={productDropdownOptions}
                  value={
                    createProduct.productId
                      ? productDropdownOptions.find(
                          (o) => o.value === String(createProduct.productId),
                        )
                      : null
                  }
                  onChange={(selected) =>
                    setCreateProduct((p) => ({
                      ...p,
                      productId: selected?.value || "",
                    }))
                  }
                  placeholder="Select Product"
                  isClearable
                  className="text-black w-full"
                  isDisabled={isLoadingAllProducts}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-white">Quantity:</label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct.quantity}
                  onChange={(e) =>
                    setCreateProduct((p) => ({
                      ...p,
                      quantity: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-white">Price:</label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct.price}
                  onChange={(e) =>
                    setCreateProduct((p) => ({ ...p, price: e.target.value }))
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

      {/* Edit Delete */}
      {isModalOpen2 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">
              Edit Purchase Asset
            </h2>

            {role === "superAdmin" ? (
              <div className="mt-4">
                <label className="block text-sm text-white">Status</label>
                <select
                  value={currentProduct.status || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      status: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            ) : (
              <div className="mt-4">
                <label className="block text-sm text-white">Note:</label>
                <textarea
                  type="text"
                  value={currentProduct?.note || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      note: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
                onClick={handleUpdateDelete}
              >
                Save
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                onClick={handleDeleteClose}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AssetsDamageTable;
