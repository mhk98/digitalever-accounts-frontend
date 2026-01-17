import { motion } from "framer-motion";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useDeleteProductMutation,
  useGetAllProductQuery,
  useGetAllProductWithoutQueryQuery,
  useInsertProductMutation,
  useUpdateProductMutation,
} from "../../features/product/product";
import toast from "react-hot-toast";
import Select from "react-select";
import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";

const ProductsTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  const [currentProduct, setCurrentProduct] = useState(null);

  const [createProduct, setCreateProduct] = useState({
    name: "",
    purchase_price: "",
    sale_price: "",
  });

  const [products, setProducts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [name, setName] = useState("");

  console.log("startDate:", startDate);
  console.log("endDate:", endDate);

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);
  const [itemsPerPage] = useState(10);

  const [productsData, setProductsData] = useState([]);

  const {
    data: data2,
    isLoading: isLoading2,
    isError: isError2,
    error: error2,
  } = useGetAllProductWithoutQueryQuery();

  useEffect(() => {
    if (isError2) {
      console.error("Error fetching products", error2);
    } else if (!isLoading2 && data2) {
      setProductsData(data2.data);
    }
  }, [data2, isLoading2, isError2, error2]);

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

  // filter change হলে page 1 এ ফেরত
  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate, name]);

  const queryArgs = {
    page: currentPage,
    limit: itemsPerPage,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    name: name?.trim() ? name.trim() : undefined,
  };

  const { data, isLoading, isError, error, refetch } =
    useGetAllProductQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching product data", error);
    } else if (!isLoading && data) {
      setProducts(data.data);
      setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error, currentPage, itemsPerPage]);

  const handleEditClick = (product) => {
    setCurrentProduct({
      ...product,
      purchase_price: product.purchase_price ?? "",
      sale_price: product.sale_price ?? "",
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => setIsModalOpen(false);
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => setIsModalOpen1(false);

  const [insertProduct] = useInsertProductMutation();
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...createProduct,
        purchase_price: Number(createProduct.purchase_price),
        sale_price: Number(createProduct.sale_price),
      };

      const res = await insertProduct(payload).unwrap();
      if (res.success) {
        toast.success("Successfully created product");
        setIsModalOpen1(false);
        setCreateProduct({
          name: "",
          purchase_price: "",
          sale_price: "",
        });
        refetch?.();
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  const [updateProduct] = useUpdateProductMutation();
  const handleUpdateProduct = async () => {
    try {
      const updatedProduct = {
        name: currentProduct.name,
        purchase_price: Number(currentProduct.purchase_price),
        sale_price: Number(currentProduct.sale_price),
      };

      const res = await updateProduct({
        id: currentProduct.Id,
        data: updatedProduct,
      }).unwrap();

      if (res.success) {
        toast.success("Successfully updated product!");
        setIsModalOpen(false);
        refetch?.();
      } else {
        toast.error("Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const [deleteProduct] = useDeleteProductMutation();
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this product?");
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteProduct(id).unwrap();
      if (res.success) {
        toast.success("Product deleted successfully!");
        refetch?.();
      } else {
        toast.error("Delete failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setName("");
  };

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

  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const productOptions = productsData.map((p) => ({
    value: p.name,
    label: p.name,
  }));

  const {
    data: allSupplierRes,
    isLoading: isLoadingSupplier,
    isError: isErrorSupplier,
    error: errorSupplier,
  } = useGetAllSupplierWithoutQueryQuery();

  const suppliers = allSupplierRes?.data || [];

  useEffect(() => {
    if (isErrorSupplier) {
      console.error("Error fetching products", errorSupplier);
    }
  }, [isErrorSupplier, errorSupplier]);

  console.log("suppliers", suppliers);
  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="my-6 flex justify-start">
        <button
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center"
          onClick={handleAddProduct}
        >
          Add <Plus size={18} className="ms-2" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-6 w-full justify-center mx-auto">
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

        <div className="flex items-center justify-center">
          <Select
            options={productOptions}
            value={productOptions.find((o) => o.value === name) || null}
            onChange={(selected) => setName(selected?.value || "")}
            placeholder="Select Product"
            isClearable
            className="text-black w-full"
          />
        </div>

        <button
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Purchase
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Sale
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {products.map((product) => (
              <motion.tr
                key={product.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(product.purchase_price || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(product.sale_price || 0).toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(product)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.Id)}
                    className="text-red-600 hover:text-red-900 ms-4"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <h2 className="text-lg font-semibold text-white">Edit Product</h2>

            <div className="mt-4">
              <label className="block text-sm text-white">Product:</label>
              <input
                type="text"
                value={currentProduct?.name || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, name: e.target.value })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">Supplier:</label>
              <select
                value={createProduct.supplier}
                onChange={(e) =>
                  setCurrentProduct({
                    ...createProduct,
                    supplier: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                required
              >
                <option value="">Select Supplier</option>

                {isLoadingSupplier ? (
                  <option disabled>Loading...</option>
                ) : (
                  suppliers?.map((supplier) => (
                    <option key={supplier.Id} value={supplier.name}>
                      {supplier}.name
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">
                Purchase Price:
              </label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.purchase_price || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    purchase_price: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">Sale Price:</label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.sale_price || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    sale_price: e.target.value,
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
            <h2 className="text-lg font-semibold text-white">Add Product</h2>

            <form onSubmit={handleCreateProduct}>
              <div className="mt-4">
                <label className="block text-sm text-white">Name:</label>
                <input
                  type="text"
                  value={createProduct.name}
                  onChange={(e) =>
                    setCreateProduct({ ...createProduct, name: e.target.value })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm text-white">Supplier:</label>
                <select
                  value={createProduct.supplier || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      supplier: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                  required
                >
                  <option value="">Select Supplier</option>

                  {isLoadingSupplier ? (
                    <option disabled>Loading...</option>
                  ) : (
                    suppliers?.map((supplier) => (
                      <option key={supplier.Id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-white">
                  Purchase Price:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct.purchase_price}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      purchase_price: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-white">Sale Price:</label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct.sale_price}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      sale_price: e.target.value,
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

export default ProductsTable;
