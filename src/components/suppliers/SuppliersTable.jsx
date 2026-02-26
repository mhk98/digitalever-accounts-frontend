import { motion } from "framer-motion";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

// import axios from "axios";
import {
  useDeleteSupplierMutation,
  useGetAllSupplierQuery,
  useGetAllSupplierWithoutQueryQuery,
  useInsertSupplierMutation,
  useUpdateSupplierMutation,
} from "../../features/supplier/supplier";

const SuppliersTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [createSupplier, setCreateSupplier] = useState({
    name: "",
    remarks: "",
  });
  const [suppliers, setSuppliers] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // initial value as 1
  const [pagesPerSet, setPagesPerSet] = useState(10);
  // eslint-disable-next-line no-unused-vars
  const [itemsPerPage, setItemsPerPage] = useState(10); // 2 items per page

  const [suppliersData, setSuppliersData] = useState([]);

  const {
    data: data1,
    isLoading: isLoading1,
    isError: isError1,
    error: error1,
  } = useGetAllSupplierWithoutQueryQuery();

  useEffect(() => {
    if (isError1) {
      console.error("Error fetching purchase data", error1);
    } else if (!isLoading1 && data1) {
      setSuppliersData(data1.data);
    }
  }, [data1, isLoading1, isError1, error1]);

  console.log("suppliers", suppliers);

  useEffect(() => {
    const updatePagesPerSet = () => {
      if (window.innerWidth < 640) {
        setPagesPerSet(5);
      } else if (window.innerWidth < 1024) {
        setPagesPerSet(7);
      } else {
        setPagesPerSet(10);
      }
    };

    updatePagesPerSet();
    window.addEventListener("resize", updatePagesPerSet);
    return () => window.removeEventListener("resize", updatePagesPerSet);
  }, []);

  const { data, isLoading, isError, error } = useGetAllSupplierQuery({
    startDate,
    endDate,
    supplierId,
    page: currentPage,
    limit: itemsPerPage,
  });

  useEffect(() => {
    if (isError) {
      console.error("Error fetching product data", error);
    } else if (!isLoading && data) {
      setSuppliers(data.data);
      setTotalPages(Math.ceil(data.meta.count / itemsPerPage)); // totalPages is calculated dynamically from API response
    }
  }, [
    data,
    isLoading,
    isError,
    error,
    currentPage,
    itemsPerPage,
    startDate,
    endDate,
    supplierId,
  ]);

  // useEffect(() => {
  //     const fetchData = async () => {
  //         try {
  //             const response = await axios.get(` https://apikafela.digitalever.com.bd/api/v1/supplier`, {
  //                 params: { startDate, endDate, supplierId }
  //             });
  //             setFilterData(response.data.data);
  //         } catch (err) {
  //             console.log(err.message);
  //         }
  //     };
  //     // Only fetch data if both dates are defined
  //     if (startDate && endDate || supplierId) {
  //         fetchData();
  //     }
  // }, [startDate, endDate, supplierId]);

  const handleEditClick = (product) => {
    setCurrentSupplier(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => {
    setIsModalOpen1(false);
  };

  const [insertSupplier] = useInsertSupplierMutation();
  const handlecreateSupplier = async (e) => {
    e.preventDefault();
    const res = await insertSupplier(createSupplier).unwrap();
    if (res.success) {
      toast.success("Successfully created supplier");
    }
    setIsModalOpen1(false);
  };

  const [updateSupplier] = useUpdateSupplierMutation();
  const handleUpdateProduct = async () => {
    const updatedProduct = {
      name: currentSupplier.name,
      remarks: currentSupplier.remarks,
    };

    try {
      const res = await updateSupplier({
        id: currentSupplier.Id,
        data: updatedProduct,
      }).unwrap();
      if (res.success) {
        toast.success("Successfully updated supplier!");
        setIsModalOpen(false);
      } else {
        toast.error("Update failed!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.data.message);
    }
  };

  const [deleteProduct] = useDeleteSupplierMutation();
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Do you want to delete this supplier?",
    );

    if (confirmDelete) {
      try {
        const res = await deleteProduct(id).unwrap();
        if (res.success) {
          toast.success("Successfully deleted supplier!");
        } else {
          toast.error("Delete failed!");
        }
      } catch (error) {
        console.log(error);
        toast.error(error.data.message);
      }
    } else {
      toast.info("Delete action was cancelled.");
    }
  };

  // New function to clear filters
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSupplierId("");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (pageNumber < startPage) {
      setStartPage(pageNumber);
    } else if (pageNumber > endPage) {
      setStartPage(pageNumber - pagesPerSet + 1);
    }
  };

  const handlePreviousSet = () =>
    setStartPage((prevStart) => Math.max(prevStart - pagesPerSet, 1));
  const handleNextSet = () =>
    setStartPage((prevStart) =>
      Math.min(prevStart + pagesPerSet, totalPages - pagesPerSet + 1),
    );

  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const supplierOptions = suppliersData.map((supplier) => ({
    value: supplier.Id,
    label: supplier.name,
  }));

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
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded p-1 text-black bg-white"
          />
        </div>
        <div className="flex items-center justify-center">
          <label className="mr-2 text-sm text-white">End Date:</label>
          <input
            type="date"
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded p-1 text-black bg-white"
          />
        </div>

        <div className="flex items-center justify-center">
          <Select
            options={supplierOptions}
            value={supplierOptions.find(
              (option) => option.value === currentSupplier?.supplierId,
            )} // Optional chaining ব্যবহার করা হলো
            onChange={(selectedOption) => setSupplierId(selectedOption?.value)}
            placeholder="Select Supplier"
            isClearable
            className="text-black"
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
                Due Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {suppliers.map((product) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(product.due_amount || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {product.remarks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    className="text-indigo-400 hover:text-indigo-300 mr-2"
                    onClick={() => handleEditClick(product)}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDeleteProduct(product.Id)}
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

      {/* Modal for editing product */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">Edit Supplier</h2>
            <div className="mt-4">
              <label className="block text-sm text-white">Name:</label>
              <input
                type="text"
                value={currentSupplier?.name}
                onChange={(e) =>
                  setCurrentSupplier({
                    ...currentSupplier,
                    name: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black"
              />
            </div>

            {/* <div className='mt-4'>
                            <label className='block text-sm text-white'>Due Amount:</label>
                            <input type='number' value={currentSupplier?.due_amount} onChange={(e) => setCurrentSupplier({ ...currentSupplier, due_amount: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div> */}

            <div className="mt-4">
              <label className="block text-sm text-white">Remarks:</label>
              <textarea
                value={currentSupplier?.remarks}
                onChange={(e) =>
                  setCurrentSupplier({
                    ...currentSupplier,
                    remarks: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black"
                rows={4} // You can adjust the number of rows as needed
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

      {/* Modal for adding product */}
      {isModalOpen1 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">Add Supplier</h2>
            <form onSubmit={handlecreateSupplier}>
              <div className="mt-4">
                <label className="block text-sm text-white">Name:</label>
                <input
                  type="text"
                  value={createSupplier.name}
                  onChange={(e) =>
                    setCreateSupplier({
                      ...createSupplier,
                      name: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-black"
                  required
                />
              </div>
              {/* <div className='mt-4'>
                                <label className='block text-sm text-white'>Due Amount:</label>
                                <input type='number' value={createSupplier.due_amount} onChange={(e) => setCreateSupplier({ ...createSupplier, due_amount: parseInt(e.target.value) })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' required />
                            </div> */}
              <div className="mt-4">
                <label className="block text-sm text-white">Remarks:</label>
                <textarea
                  value={createSupplier?.remarks}
                  onChange={(e) =>
                    setCreateSupplier({
                      ...createSupplier,
                      remarks: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-black"
                  rows={4} // You can adjust the number of rows as needed
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

export default SuppliersTable;
