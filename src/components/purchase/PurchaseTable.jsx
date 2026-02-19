import { motion } from "framer-motion";
import { Download, Edit, FileDown, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useDeletePurchaseMutation,
  useGetAllPurchaseQuery,
  useInsertPurchaseMutation,
  useUpdatePurchaseMutation,
} from "../../features/purchase/purchase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable
import * as XLSX from "xlsx";
import Select from "react-select";
import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";
import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";
const PurchaseTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [createPurchase, setCreatePurchase] = useState({
    product_name: "",
    supplier_name: "",
    transaction_date: "",
    quantity: 0,
    rate: 0,
    paid_amount: 0,
    due_amount: 0,
    remarks: "",
    supplierId: "",
  });
  const [purchases, setPurchases] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // initial value as 1
  const [pagesPerSet, setPagesPerSet] = useState(10);
  // eslint-disable-next-line no-unused-vars
  const [itemsPerPage, setItemsPerPage] = useState(10); // 2 items per page

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

  console.log("supplierId", supplierId);

  const { data, isLoading, isError, error } = useGetAllPurchaseQuery({
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
      setPurchases(data.data);
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

  const handleEditClick = (product) => {
    console.log("editPurchase", product);
    setCurrentPurchase(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => {
    setIsModalOpen1(false);
  };

  const [insertPurchase] = useInsertPurchaseMutation();
  const handlecreatePurchase = async (e) => {
    e.preventDefault();

    const purchaseData = {
      transaction_date: createPurchase.transaction_date,
      quantity: parseFloat(createPurchase.quantity),
      rate: parseFloat(createPurchase.rate),
      paid_amount: parseFloat(createPurchase.paid_amount),
      remarks: createPurchase.remarks,
      supplierId: createPurchase.supplierId,
      productId: createPurchase.productId,
    };

    console.log("purchaseData", purchaseData);

    try {
      const res = await insertPurchase(purchaseData).unwrap();
      if (res.success) {
        toast.success("Successfully created purchase");
        // window.location.reload();
        setIsModalOpen1(false);
      } else {
        toast.error("Insert failed!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.data.message);
    }
  };

  const [updateProduct] = useUpdatePurchaseMutation();
  const handleUpdateProduct = async () => {
    const updatedProduct = {
      transaction_date: currentPurchase.transaction_date,
      quantity: parseFloat(currentPurchase.quantity),
      rate: parseFloat(currentPurchase.rate),
      paid_amount: parseFloat(currentPurchase.paid_amount),
      remarks: currentPurchase.remarks,
      supplierId: currentPurchase.supplierId,
      productId: currentPurchase.productId,
    };

    try {
      const res = await updateProduct({
        id: currentPurchase.Id,
        data: updatedProduct,
      }).unwrap();
      if (res.success) {
        toast.success("Successfully updated purchase!");
        // window.location.reload();
        setIsModalOpen(false);
      } else {
        toast.error("Update failed!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.data.message);
    }
  };

  const [deletePurchase] = useDeletePurchaseMutation();
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Do you want to delete this purchase?",
    );
    if (confirmDelete) {
      try {
        const res = await deletePurchase(id).unwrap();
        if (res.success) {
          toast.success("Successfully deleted purchase!");
          // window.location.reload();
        } else {
          toast.error("Delete failed!");
        }
      } catch (error) {
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

  const [suppliers, setSuppliers] = useState([]);

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
      setSuppliers(data1.data);
    }
  }, [data1, isLoading1, isError1, error1]);

  console.log("suppliers", suppliers);

  const [products, setProducts] = useState([]);

  const {
    data: data2,
    isLoading: isLoading2,
    isError: isError2,
    error: error2,
  } = useGetAllProductWithoutQueryQuery();

  useEffect(() => {
    if (isError2) {
      console.error("Error fetching purchase data", error2);
    } else if (!isLoading2 && data2) {
      setProducts(data2.data);
    }
  }, [data2, isLoading2, isError2, error2]);

  console.log("suppliers", suppliers);

  const handleDownload = (product) => {
    const doc = new jsPDF();

    // Add Invoice Header
    doc.setFontSize(20);
    doc.text("Purchase Record", 14, 20);

    // Add Invoice Details with reduced bottom margin
    doc.setFontSize(12);
    doc.text(`Record #${product.Id}`, 14, 30); // Changed from 60 to 30
    // doc.text(`Date: ${product.supplier_name}`, 14, 35); // Changed from 65 to 35
    doc.text(`Date: ${product.transaction_date}`, 14, 35); // Changed from 65 to 35

    const data = [
      [
        "Product Name",
        "Supplier Name",
        "Quantity",
        "Price",
        "Paid Amount",
        "Due Amount",
      ],
      [
        product.product_name,
        product.supplier_name,
        product.quantity,
        product.price,
        product.paid_amount,
        product.due_amount,
      ],
    ];

    autoTable(doc, {
      head: data.slice(0, 1), // Header row
      body: data.slice(1), // Data rows
      startY: 50, // Adjust starting position for the table to accommodate reduced spacing
    });

    doc.save(`Purchaserecord.pdf`);
  };

  // Function to export data to Excel
  const exportToExcel = () => {
    // Extract the "data" array from the JSON response
    const jsonData = purchases;

    // Create a worksheet from the JSON data
    const ws = XLSX.utils.json_to_sheet(jsonData);

    // Create a new workbook and append the worksheet to it
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "purchase.xlsx");
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

  const productOptions = products.map((product) => ({
    value: product.Id,
    label: product.name,
  }));

  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier.Id,
    label: supplier.name,
  }));

  console.log("productOptions", productOptions);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="my-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
        <button
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center"
          onClick={handleAddProduct}
        >
          Add <Plus size={18} className="ms-2" />
        </button>
        <button
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center"
          onClick={exportToExcel}
        >
          Export <FileDown size={18} className="ms-2" />
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
              (option) => option.value === currentPurchase?.supplierId,
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
                Transaction Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Supplier Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Paid Amount
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
            {purchases.map((product) => (
              <motion.tr
                key={product.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {new Date(product.transaction_date).toLocaleDateString(
                    "en-GB",
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {product.product_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {product.supplier_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(product.quantity || 0).toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(product.rate || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(product.price || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(product.paid_amount || 0).toFixed(2)}
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
                    onClick={() => handleDownload(product)}
                  >
                    <Download size={18} />
                  </button>
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
              className={`px-3 py-2 text-white rounded-md ${pageNum === currentPage ? "bg-indigo-600" : "bg-indigo-500 hover:bg-indigo-400"}`}
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
        <div className="fixed inset-0 top-72 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">Edit Purchase</h2>

            <div className="mt-4">
              <label className="block text-sm text-white">Product Name:</label>
              <Select
                options={productOptions}
                value={productOptions.find(
                  (option) => option.value === currentPurchase.productId,
                )}
                onChange={(selectedOption) =>
                  setCurrentPurchase({
                    ...currentPurchase,
                    productId: selectedOption?.value,
                  })
                }
                placeholder="Select Product"
                isClearable
                className="text-black"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">Supplier Name:</label>
              <Select
                options={supplierOptions}
                value={supplierOptions.find(
                  (option) => option.value === currentPurchase.supplierId,
                )}
                onChange={(selectedOption) =>
                  setCurrentPurchase({
                    ...currentPurchase,
                    supplierId: selectedOption?.value,
                  })
                }
                placeholder="Select Supplier"
                isClearable
                className="text-black"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white"> Date:</label>
              <input
                type="date"
                value={currentPurchase?.transaction_date}
                onChange={(e) =>
                  setCurrentPurchase({
                    ...currentPurchase,
                    transaction_date: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-1 text-black bg-white"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-white">Quantity:</label>
              <input
                type="number"
                value={currentPurchase?.quantity}
                onChange={(e) =>
                  setCurrentPurchase({
                    ...currentPurchase,
                    quantity: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-white">Rate:</label>
              <input
                type="number"
                value={currentPurchase?.rate}
                onChange={(e) =>
                  setCurrentPurchase({
                    ...currentPurchase,
                    rate: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-white">Paid Amount:</label>
              <input
                type="number"
                value={currentPurchase?.paid_amount}
                onChange={(e) =>
                  setCurrentPurchase({
                    ...currentPurchase,
                    paid_amount: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black"
              />
            </div>
            {/* <div className='mt-4'>
                            <label className='block text-sm text-white'>Due Amount:</label>
                            <input type='number' value={currentPurchase?.due_amount} onChange={(e) => setCurrentPurchase({ ...currentPurchase, due_amount: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div> */}
            <div className="mt-4">
              <label className="block text-sm text-white">Remarks:</label>
              <textarea
                value={currentPurchase?.remarks}
                onChange={(e) =>
                  setCurrentPurchase({
                    ...currentPurchase,
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
        <div className="fixed inset-0 top-72  flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">Add Purchase</h2>

            <div className="mt-4">
              <label className="block text-sm text-white">Product Name:</label>
              <Select
                options={productOptions}
                value={productOptions.find(
                  (option) => option.value === createPurchase.productId,
                )}
                onChange={(selectedOption) =>
                  setCreatePurchase({
                    ...createPurchase,
                    productId: selectedOption?.value,
                  })
                }
                placeholder="Select Product"
                isClearable
                className="text-black"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">Supplier Name:</label>
              <Select
                options={supplierOptions}
                value={supplierOptions.find(
                  (option) => option.value === createPurchase.supplierId,
                )}
                onChange={(selectedOption) =>
                  setCreatePurchase({
                    ...createPurchase,
                    supplierId: selectedOption?.value,
                  })
                }
                placeholder="Select Supplier"
                isClearable
                className="text-black"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white"> Date:</label>
              <input
                type="date"
                value={createPurchase?.transaction_date}
                onChange={(e) =>
                  setCreatePurchase({
                    ...createPurchase,
                    transaction_date: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-1 text-black bg-white"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">Quantity:</label>
              <input
                type="number"
                value={createPurchase?.quantity}
                onChange={(e) =>
                  setCreatePurchase({
                    ...createPurchase,
                    quantity: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-white">Rate:</label>
              <input
                type="number"
                value={createPurchase?.rate}
                onChange={(e) =>
                  setCreatePurchase({ ...createPurchase, rate: e.target.value })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-white">Paid Amount:</label>
              <input
                type="number"
                value={createPurchase?.paid_amount}
                onChange={(e) =>
                  setCreatePurchase({
                    ...createPurchase,
                    paid_amount: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black"
              />
            </div>
            {/* <div className='mt-4'>
                            <label className='block text-sm text-white'>Due Amount:</label>
                            <input type='number' value={createPurchase?.due_amount} onChange={(e) => setCreatePurchase({ ...createPurchase, due_amount: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div> */}
            <div className="mt-4">
              <label className="block text-sm text-white">Remarks:</label>
              <textarea
                value={createPurchase?.remarks}
                onChange={(e) =>
                  setCreatePurchase({
                    ...createPurchase,
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
                onClick={handlecreatePurchase}
              >
                Save
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                onClick={handleModalClose1}
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

export default PurchaseTable;
