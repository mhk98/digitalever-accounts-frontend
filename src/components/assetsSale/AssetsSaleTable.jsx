// import { motion } from "framer-motion";
// import { Edit, Plus, Trash2 } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import Select from "react-select";
// import {
//   useDeleteAssetsSaleMutation,
//   useGetAllAssetsSaleQuery,
//   useGetAllAssetsSaleWithoutQueryQuery,
//   useInsertAssetsSaleMutation,
//   useUpdateAssetsSaleMutation,
// } from "../../features/assetsSale/assetsSale";

// const AssetsSaleTable = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalOpen1, setIsModalOpen1] = useState(false);

//   const [currentProduct, setCurrentProduct] = useState(null);

//   const [createProduct, setCreateProduct] = useState({
//     name: "",
//     price: "",
//     quantity: "",
//   });

//   const [products, setProducts] = useState([]);

//   // Filters
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   // ✅ filter will store productId (not name)
//   const [name, setName] = useState("");

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [startPage, setStartPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [pagesPerSet, setPagesPerSet] = useState(10);
//   const itemsPerPage = 10;

//   // All products for select
//   const [productsData, setProductsData] = useState([]);

//   const {
//     data: data2,
//     isLoading: isLoading2,
//     isError: isError2,
//     error: error2,
//   } = useGetAllAssetsSaleWithoutQueryQuery();

//   useEffect(() => {
//     if (isError2) {
//       console.error("Error fetching products", error2);
//     } else if (!isLoading2 && data2) {
//       setProductsData(data2.data || []);
//     }
//   }, [data2, isLoading2, isError2, error2]);

//   // Responsive pagesPerSet
//   useEffect(() => {
//     const updatePagesPerSet = () => {
//       if (window.innerWidth < 640) setPagesPerSet(5);
//       else if (window.innerWidth < 1024) setPagesPerSet(7);
//       else setPagesPerSet(10);
//     };

//     updatePagesPerSet();
//     window.addEventListener("resize", updatePagesPerSet);
//     return () => window.removeEventListener("resize", updatePagesPerSet);
//   }, []);

//   // filter change হলে page reset
//   useEffect(() => {
//     setCurrentPage(1);
//     setStartPage(1);
//   }, [startDate, endDate, name]);

//   // startDate > endDate হলে endDate ঠিক করে দেবে
//   useEffect(() => {
//     if (startDate && endDate && startDate > endDate) {
//       setEndDate(startDate);
//     }
//   }, [startDate, endDate]);

//   // ✅ Query args now uses productId, not name
//   const queryArgs = useMemo(
//     () => ({
//       page: currentPage,
//       limit: itemsPerPage,
//       startDate: startDate || undefined,
//       endDate: endDate || undefined,
//       name: name || undefined, // ✅ send Id
//     }),
//     [currentPage, itemsPerPage, startDate, endDate, name]
//   );

//   const { data, isLoading, isError, error, refetch } =
//     useGetAllAssetsSaleQuery(queryArgs);

//   useEffect(() => {
//     if (isError) {
//       console.error("Error fetching product data", error);
//     } else if (!isLoading && data) {
//       setProducts(data.data || []);
//       setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
//     }
//   }, [data, isLoading, isError, error, currentPage, itemsPerPage]);

//   // Modals
//   const handleModalClose = () => setIsModalOpen(false);
//   const handleAddProduct = () => setIsModalOpen1(true);
//   const handleModalClose1 = () => setIsModalOpen1(false);

//   const handleEditClick = (product) => {
//     setCurrentProduct({
//       ...product,
//       price: product.price ?? "",
//       quantity: product.quantity ?? "",
//     });
//     setIsModalOpen(true);
//   };

//   // Insert
//   const [insertAssetsSale] = useInsertAssetsSaleMutation();
//   const handleCreateProduct = async (e) => {
//     e.preventDefault();

//     if (!createProduct.name?.trim()) return toast.error("Name is required!");
//     if (!createProduct.price) return toast.error("Price is required!");

//     try {
//       const payload = {
//         name: createProduct.name.trim(),
//         quantity: Number(createProduct.quantity),
//         price: Number(createProduct.price),
//       };

//       const res = await insertAssetsSale(payload).unwrap();
//       if (res?.success) {
//         toast.success("Successfully created product");
//         setIsModalOpen1(false);
//         setCreateProduct({ name: "", price: "", quantity: "" });
//         refetch?.();
//       } else {
//         toast.error(res?.message || "Create failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Create failed!");
//     }
//   };

//   // Update
//   const [updateAssetsSale] = useUpdateAssetsSaleMutation();
//   const handleUpdateProduct = async () => {
//     if (!currentProduct?.Id) return toast.error("Invalid item!");
//     if (!currentProduct?.name?.trim()) return toast.error("Name is required!");
//     if (currentProduct?.price === "" || currentProduct?.price === null)
//       return toast.error("Price is required!");
//     if (currentProduct?.quantity === "" || currentProduct?.quantity === null)
//       return toast.error("Quantity is required!");

//     try {
//       const payload = {
//         name: currentProduct.name.trim(),
//         quantity: Number(currentProduct.quantity),
//         price: Number(currentProduct.price),
//       };

//       const res = await updateAssetsSale({
//         id: currentProduct.Id,
//         data: payload,
//       }).unwrap();

//       if (res?.success) {
//         toast.success("Successfully updated product!");
//         setIsModalOpen(false);
//         refetch?.();
//       } else {
//         toast.error(res?.message || "Update failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   // Delete
//   const [deleteAssetsSale] = useDeleteAssetsSaleMutation();
//   const handleDeleteProduct = async (id) => {
//     const confirmDelete = window.confirm("Do you want to delete this product?");
//     if (!confirmDelete) return toast.info("Delete action was cancelled.");

//     try {
//       const res = await deleteAssetsSale(id).unwrap();
//       if (res?.success) {
//         toast.success("Product deleted successfully!");
//         refetch?.();
//       } else {
//         toast.error(res?.message || "Delete failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Delete failed!");
//     }
//   };

//   // Filters clear
//   const clearFilters = () => {
//     setStartDate("");
//     setEndDate("");
//     setName(""); // ✅ clear Id
//   };

//   // Pagination calculations
//   const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     if (pageNumber < startPage) setStartPage(pageNumber);
//     else if (pageNumber > endPage) setStartPage(pageNumber - pagesPerSet + 1);
//   };

//   const handlePreviousSet = () =>
//     setStartPage((prev) => Math.max(prev - pagesPerSet, 1));

//   const handleNextSet = () =>
//     setStartPage((prev) =>
//       Math.min(prev + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1))
//     );

//   // ✅ react-select options store Id in value, show name in label
//   const productOptions = (productsData || []).map((p) => ({
//     value: p.Id, // ✅ important
//     label: p.name,
//   }));

//   return (
//     <motion.div
//       className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.2 }}
//     >
//       {/* Add Button */}
//       <div className="my-6 flex justify-start">
//         <button
//           className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center"
//           onClick={handleAddProduct}
//         >
//           Add <Plus size={18} className="ms-2" />
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-6 w-full justify-center mx-auto">
//         <div className="flex items-center justify-center">
//           <label className="mr-2 text-sm text-white">Start Date:</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="border border-gray-300 rounded p-1 text-black bg-white"
//           />
//         </div>

//         <div className="flex items-center justify-center">
//           <label className="mr-2 text-sm text-white">End Date:</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="border border-gray-300 rounded p-1 text-black bg-white"
//           />
//         </div>

//         {/* ✅ Product filter by Id */}
//         <div className="flex items-center justify-center">
//           <Select
//             options={productOptions}
//             value={productOptions.find((o) => o.value === name) || null}
//             onChange={(selected) =>
//               setName(selected?.value ? String(selected.value) : "")
//             }
//             placeholder="Select Product"
//             isClearable
//             className="text-black w-full"
//           />
//         </div>

//         <button
//           className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto"
//           onClick={clearFilters}
//         >
//           Clear Filters
//         </button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-700">
//           <thead>
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Name
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Quantity
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Price
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-gray-700">
//             {products.map((product) => (
//               <motion.tr
//                 key={product.Id}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
//                   {product.name}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {product.quantity}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(product.price || 0).toFixed(2)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   <button
//                     onClick={() => handleEditClick(product)}
//                     className="text-indigo-600 hover:text-indigo-900"
//                   >
//                     <Edit size={18} />
//                   </button>
//                   <button
//                     onClick={() => handleDeleteProduct(product.Id)}
//                     className="text-red-600 hover:text-red-900 ms-4"
//                   >
//                     <Trash2 size={18} />
//                   </button>
//                 </td>
//               </motion.tr>
//             ))}

//             {!isLoading && products.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={3}
//                   className="px-6 py-6 text-center text-sm text-gray-300"
//                 >
//                   No data found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-center space-x-2 mt-6">
//         <button
//           onClick={handlePreviousSet}
//           disabled={startPage === 1}
//           className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
//         >
//           Prev
//         </button>

//         {[...Array(endPage - startPage + 1)].map((_, index) => {
//           const pageNum = startPage + index;
//           return (
//             <button
//               key={pageNum}
//               onClick={() => handlePageChange(pageNum)}
//               className={`px-3 py-2 text-black rounded-md ${
//                 pageNum === currentPage
//                   ? "bg-white"
//                   : "bg-indigo-500 hover:bg-indigo-400"
//               }`}
//             >
//               {pageNum}
//             </button>
//           );
//         })}

//         <button
//           onClick={handleNextSet}
//           disabled={endPage === totalPages}
//           className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
//         >
//           Next
//         </button>
//       </div>

//       {/* Edit Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">
//               Edit Sale Asset
//             </h2>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Name:</label>
//               <input
//                 type="text"
//                 value={currentProduct?.name || ""}
//                 onChange={(e) =>
//                   setCurrentProduct({ ...currentProduct, name: e.target.value })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Quantity:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct?.quantity || ""}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     quantity: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Price:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct?.price || ""}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     price: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//               />
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
//                 onClick={handleUpdateProduct}
//               >
//                 Save
//               </button>
//               <button
//                 className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
//                 onClick={handleModalClose}
//               >
//                 Cancel
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* Add Modal */}
//       {isModalOpen1 && (
//         <div className="fixed inset-0 top-12 z-10 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">Add Sale Asset</h2>

//             <form onSubmit={handleCreateProduct}>
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Name:</label>
//                 <input
//                   type="text"
//                   value={createProduct.name}
//                   onChange={(e) =>
//                     setCreateProduct({ ...createProduct, name: e.target.value })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Quantity:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.quantity}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       quantity: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Price:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.price}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       price: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-6 flex justify-end">
//                 <button
//                   type="submit"
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
//                 >
//                   Save
//                 </button>
//                 <button
//                   type="button"
//                   className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
//                   onClick={handleModalClose1}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </motion.div>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default AssetsSaleTable;

import { motion } from "framer-motion";
import { Edit, Plus, Trash2, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import {
  useDeleteAssetsSaleMutation,
  useGetAllAssetsSaleQuery,
  useGetAllAssetsSaleWithoutQueryQuery,
  useInsertAssetsSaleMutation,
  useUpdateAssetsSaleMutation,
} from "../../features/assetsSale/assetsSale";

const AssetsSaleTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  const [currentProduct, setCurrentProduct] = useState(null);

  const [createProduct, setCreateProduct] = useState({
    name: "",
    price: "",
    quantity: "",
  });

  const [products, setProducts] = useState([]);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ store selected productId (not name)
  const [name, setName] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);
  const itemsPerPage = 10;

  // All products for select
  const [productsData, setProductsData] = useState([]);

  const {
    data: data2,
    isLoading: isLoading2,
    isError: isError2,
    error: error2,
  } = useGetAllAssetsSaleWithoutQueryQuery();

  useEffect(() => {
    if (isError2) {
      console.error("Error fetching products", error2);
    } else if (!isLoading2 && data2) {
      setProductsData(data2.data || []);
    }
  }, [data2, isLoading2, isError2, error2]);

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

  // filter change হলে page reset
  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate, name]);

  // startDate > endDate হলে endDate ঠিক করে দেবে
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  // ✅ Query args now uses productId (not name)
  const queryArgs = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      name: name || undefined, // ✅ send Id
    }),
    [currentPage, itemsPerPage, startDate, endDate, name]
  );

  const { data, isLoading, isError, error, refetch } =
    useGetAllAssetsSaleQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching product data", error);
    } else if (!isLoading && data) {
      setProducts(data.data || []);
      setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error, currentPage, itemsPerPage]);

  // Modals
  const handleModalClose = () => setIsModalOpen(false);
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => setIsModalOpen1(false);

  const handleEditClick = (product) => {
    setCurrentProduct({
      ...product,
      price: product.price ?? "",
      quantity: product.quantity ?? "",
    });
    setIsModalOpen(true);
  };

  // Insert
  const [insertAssetsSale] = useInsertAssetsSaleMutation();
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.name?.trim()) return toast.error("Name is required!");
    if (!createProduct.price) return toast.error("Price is required!");
    if (!createProduct.quantity) return toast.error(" Quantity is required!");

    try {
      const payload = {
        name: createProduct.name.trim(),
        quantity: Number(createProduct.quantity),
        price: Number(createProduct.price),
      };

      const res = await insertAssetsSale(payload).unwrap();
      if (res?.success) {
        toast.success("Successfully created product");
        setIsModalOpen1(false);
        setCreateProduct({ name: "", price: "", quantity: "" });
        refetch?.();
      } else {
        toast.error(res?.message || "Create failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // Update
  const [updateAssetsSale] = useUpdateAssetsSaleMutation();
  const handleUpdateProduct = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid item!");
    if (!currentProduct?.name?.trim()) return toast.error("Name is required!");
    if (currentProduct?.price === "" || currentProduct?.price === null)
      return toast.error("Price is required!");
    if (currentProduct?.quantity === "" || currentProduct?.quantity === null)
      return toast.error("Quantity is required!");

    try {
      const payload = {
        name: currentProduct.name.trim(),
        quantity: Number(currentProduct.quantity),
        price: Number(currentProduct.price),
      };

      const res = await updateAssetsSale({
        id: currentProduct.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated product!");
        setIsModalOpen(false);
        refetch?.();
      } else {
        toast.error(res?.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // Delete
  const [deleteAssetsSale] = useDeleteAssetsSaleMutation();
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this product?");
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteAssetsSale(id).unwrap();
      if (res?.success) {
        toast.success("Product deleted successfully!");
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
    setName(""); // ✅ clear Id
  };

  // Pagination calculations
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
      Math.min(prev + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1))
    );

  // ✅ Select options use Id as value, show name as label
  const productOptions = (productsData || []).map((p) => ({
    value: p.name,
    label: p.name,
  }));

  const {
    data: saleRes,
    isLoading: saleLoading,
    isError: saleError,
    error: saleErrObj,
  } = useGetAllAssetsSaleWithoutQueryQuery();

  const sales = saleRes?.data || [];

  // ✅ totals
  const totalSaleAmount = useMemo(() => {
    return sales.reduce((sum, item) => sum + Number(item?.total || 0), 0);
  }, [sales]);

  if (saleError) console.error("Purchase error:", saleErrObj);

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
            <Truck size={18} className="text-amber-400" />
            <span className="text-sm">Total Sales</span>
          </div>

          <span className="text-white font-semibold tabular-nums">
            {saleLoading ? "Loading..." : totalSaleAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Filters */}
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

        {/* ✅ Filter by productId */}
        <div className="flex items-center justify-center">
          <Select
            options={productOptions}
            value={productOptions.find((o) => o.value === name) || null}
            onChange={(selected) =>
              setName(selected?.value ? String(selected.value) : "")
            }
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {product.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(product.price || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(product.total || 0).toFixed(2)}
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
              Edit Purchase Asset
            </h2>

            <div className="mt-4">
              <label className="block text-sm text-white">Name:</label>
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
              <label className="block text-sm text-white">Quantity:</label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.quantity || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    quantity: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">Price:</label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.price || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    price: e.target.value,
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
              Add Purchase Asset
            </h2>

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
                <label className="block text-sm text-white">Quantity:</label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct.quantity}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      quantity: e.target.value,
                    })
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
                    setCreateProduct({
                      ...createProduct,
                      price: e.target.value,
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

export default AssetsSaleTable;
