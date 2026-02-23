// import { motion } from "framer-motion";
// import { Edit, Plus, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";
// import {
//   useDeleteProductMutation,
//   useGetAllProductQuery,
//   useGetAllProductWithoutQueryQuery,
//   useInsertProductMutation,
//   useUpdateProductMutation,
// } from "../../features/product/product";
// import toast from "react-hot-toast";
// import Select from "react-select";
// import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";
// import { useGetAllWirehouseWithoutQueryQuery } from "../../features/wirehouse/wirehouse";

// const ProductsTable = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalOpen1, setIsModalOpen1] = useState(false);
//   const role = localStorage.getItem("role");

//   const [currentProduct, setCurrentProduct] = useState(null);

//   const [createProduct, setCreateProduct] = useState({
//     name: "",
//     purchase_price: "",
//     sale_price: "",
//   });

//   const [products, setProducts] = useState([]);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [name, setName] = useState("");
//   const [warehouse, setWarehouse] = useState("");

//   console.log("startDate:", startDate);
//   console.log("endDate:", endDate);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [startPage, setStartPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [pagesPerSet, setPagesPerSet] = useState(10);
//   const [itemsPerPage] = useState(10);

//   const [productsData, setProductsData] = useState([]);

//   const {
//     data: data2,
//     isLoading: isLoading2,
//     isError: isError2,
//     error: error2,
//   } = useGetAllProductWithoutQueryQuery();

//   useEffect(() => {
//     if (isError2) {
//       console.error("Error fetching products", error2);
//     } else if (!isLoading2 && data2) {
//       setProductsData(data2.data);
//     }
//   }, [data2, isLoading2, isError2, error2]);

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

//   // filter change হলে page 1 এ ফেরত
//   useEffect(() => {
//     setCurrentPage(1);
//     setStartPage(1);
//   }, [startDate, endDate, name]);

//   const queryArgs = {
//     page: currentPage,
//     limit: itemsPerPage,
//     startDate: startDate || undefined,
//     endDate: endDate || undefined,
//     name: name?.trim() ? name.trim() : undefined,
//     warehouseId: warehouse || undefined,
//   };

//   const { data, isLoading, isError, error, refetch } =
//     useGetAllProductQuery(queryArgs);

//   useEffect(() => {
//     if (isError) {
//       console.error("Error fetching product data", error);
//     } else if (!isLoading && data) {
//       setProducts(data.data);
//       setTotalPages(Math.ceil((data?.meta?.count || 0) / itemsPerPage) || 1);
//     }
//   }, [data, isLoading, isError, error, currentPage, itemsPerPage]);

//   const handleEditClick = (product) => {
//     setCurrentProduct({
//       ...product,
//       purchase_price: product.purchase_price ?? "",
//       sale_price: product.sale_price ?? "",
//     });
//     setIsModalOpen(true);
//   };

//   const handleModalClose = () => setIsModalOpen(false);
//   const handleAddProduct = () => setIsModalOpen1(true);
//   const handleModalClose1 = () => setIsModalOpen1(false);

//   const [insertProduct] = useInsertProductMutation();
//   const handleCreateProduct = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         ...createProduct,
//         purchase_price: Number(createProduct.purchase_price),
//         sale_price: Number(createProduct.sale_price),
//         warehouseId: createProduct.warehouseId,
//       };

//       const res = await insertProduct(payload).unwrap();
//       if (res.success) {
//         toast.success("Successfully created product");
//         setIsModalOpen1(false);
//         setCreateProduct({
//           name: "",
//           purchase_price: "",
//           sale_price: "",
//         });
//         refetch?.();
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Create failed!");
//     }
//   };

//   const [updateProduct] = useUpdateProductMutation();
//   const handleUpdateProduct = async () => {
//     try {
//       const updatedProduct = {
//         name: currentProduct.name,
//         purchase_price: Number(currentProduct.purchase_price),
//         sale_price: Number(currentProduct.sale_price),
//         warehouseId: currentProduct.warehouseId,
//       };

//       const res = await updateProduct({
//         id: currentProduct.Id,
//         data: updatedProduct,
//       }).unwrap();

//       if (res.success) {
//         toast.success("Successfully updated product!");
//         setIsModalOpen(false);
//         refetch?.();
//       } else {
//         toast.error("Update failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   const [deleteProduct] = useDeleteProductMutation();
//   const handleDeleteProduct = async (id) => {
//     const confirmDelete = window.confirm("Do you want to delete this product?");
//     if (!confirmDelete) return toast.info("Delete action was cancelled.");

//     try {
//       const res = await deleteProduct(id).unwrap();
//       if (res.success) {
//         toast.success("Product deleted successfully!");
//         refetch?.();
//       } else {
//         toast.error("Delete failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Delete failed!");
//     }
//   };

//   const clearFilters = () => {
//     setStartDate("");
//     setEndDate("");
//     setName("");
//     setWarehouse("");
//   };

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     if (pageNumber < startPage) setStartPage(pageNumber);
//     else if (pageNumber > endPage) setStartPage(pageNumber - pagesPerSet + 1);
//   };

//   const handlePreviousSet = () =>
//     setStartPage((prev) => Math.max(prev - pagesPerSet, 1));

//   const handleNextSet = () =>
//     setStartPage((prev) =>
//       Math.min(prev + pagesPerSet, totalPages - pagesPerSet + 1),
//     );

//   const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

//   const productOptions = productsData.map((p) => ({
//     value: p.name,
//     label: p.name,
//   }));

//   const {
//     data: allSupplierRes,
//     isLoading: isLoadingSupplier,
//     isError: isErrorSupplier,
//     error: errorSupplier,
//   } = useGetAllSupplierWithoutQueryQuery();

//   const suppliers = allSupplierRes?.data || [];

//   useEffect(() => {
//     if (isErrorSupplier) {
//       console.error("Error fetching products", errorSupplier);
//     }
//   }, [isErrorSupplier, errorSupplier]);

//   console.log("suppliers", suppliers);

//   const {
//     data: allWarehousesRes,
//     isLoading: isLoadingWarehouse,
//     isError: isErrorWarehouse,
//     error: errorWarehouse,
//   } = useGetAllWirehouseWithoutQueryQuery();

//   const warehouses = allWarehousesRes?.data || [];

//   console.log("warehouses", warehouses);

//   useEffect(() => {
//     if (isErrorWarehouse) {
//       console.error("Error fetching warehouses", errorWarehouse);
//     }
//   }, [isErrorWarehouse, errorWarehouse]);

//   console.log("warehouses", warehouses);

//   const warehouseOptions = warehouses.map((warehouse) => ({
//     value: warehouse.Id,
//     label: warehouse.name,
//   }));

//   return (
//     <motion.div
//       className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.2 }}
//     >
//       <div className="my-6 flex justify-start">
//         <button
//           className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center"
//           onClick={handleAddProduct}
//         >
//           Add <Plus size={18} className="ms-2" />
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-6 w-full justify-center mx-auto">
//         <div className="flex flex-col">
//           <label className="text-sm text-gray-400 mb-1">From</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-sm text-gray-400 mb-1">To</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
//           />
//         </div>

//         <div className="flex items-center justify-center mt-6">
//           <Select
//             options={warehouseOptions}
//             value={warehouseOptions.find((o) => o.value === warehouse) || null}
//             onChange={(selected) => setWarehouse(selected?.value || "")}
//             placeholder="Select Warehouse"
//             isClearable
//             className="text-black w-full"
//           />
//         </div>

//         <div className="flex items-center justify-center mt-6">
//           <Select
//             options={productOptions}
//             value={productOptions.find((o) => o.value === name) || null}
//             onChange={(selected) => setName(selected?.value || "")}
//             placeholder="Select Product"
//             isClearable
//             className="text-black w-full"
//           />
//         </div>

//         <button
//           className="flex items-center mt-6 bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto"
//           onClick={clearFilters}
//         >
//           Clear Filters
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-700">
//           <thead>
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Product
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Supplier
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Purchase
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Sale
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
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
//                   {product.supplier}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(product.purchase_price || 0).toFixed(2)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(product.sale_price || 0).toFixed(2)}
//                 </td>

//                 {(role === "superAdmin" || role === "admin") && (
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button
//                       onClick={() => handleEditClick(product)}
//                       className="text-indigo-600 hover:text-indigo-900"
//                     >
//                       <Edit size={18} />
//                     </button>
//                     <button
//                       onClick={() => handleDeleteProduct(product.Id)}
//                       className="text-red-600 hover:text-red-900 ms-4"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </td>
//                 )}
//               </motion.tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

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
//             <h2 className="text-lg font-semibold text-white">Edit Product</h2>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Product:</label>
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
//               <label className="block text-sm text-white">Warehouse:</label>
//               <select
//                 value={createProduct.warehouse}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...createProduct,
//                     warehouse: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                 required
//               >
//                 <option value="">Select Warehouse</option>

//                 {isLoadingWarehouse ? (
//                   <option disabled>Loading...</option>
//                 ) : (
//                   warehouses?.map((warehouse) => (
//                     <option key={warehouse.Id} value={warehouse.Id}>
//                       {warehouse.name}
//                     </option>
//                   ))
//                 )}
//               </select>
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Supplier:</label>
//               <select
//                 value={createProduct.supplier}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...createProduct,
//                     supplier: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                 required
//               >
//                 <option value="">Select Supplier</option>

//                 {isLoadingSupplier ? (
//                   <option disabled>Loading...</option>
//                 ) : (
//                   suppliers?.map((supplier) => (
//                     <option key={supplier.Id} value={supplier.name}>
//                       {supplier}.name
//                     </option>
//                   ))
//                 )}
//               </select>
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">
//                 Purchase Price:
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct?.purchase_price || ""}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     purchase_price: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Sale Price:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct?.sale_price || ""}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     sale_price: e.target.value,
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
//             <h2 className="text-lg font-semibold text-white">Add Product</h2>

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
//                 <label className="block text-sm text-white">Warehouse:</label>
//                 <select
//                   value={createProduct.warehouse || ""}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       warehouse: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                   required
//                 >
//                   <option value="">Select Warehouse</option>

//                   {isLoadingWarehouse ? (
//                     <option disabled>Loading...</option>
//                   ) : (
//                     warehouses?.map((warehouse) => (
//                       <option key={warehouse.Id} value={warehouse.Id}>
//                         {warehouse.name}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Supplier:</label>
//                 <select
//                   value={createProduct.supplier || ""}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       supplier: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                   required
//                 >
//                   <option value="">Select Supplier</option>

//                   {isLoadingSupplier ? (
//                     <option disabled>Loading...</option>
//                   ) : (
//                     suppliers?.map((supplier) => (
//                       <option key={supplier.Id} value={supplier.name}>
//                         {supplier.name}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">
//                   Purchase Price:
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.purchase_price}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       purchase_price: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Sale Price:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.sale_price}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       sale_price: e.target.value,
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

// export default ProductsTable;

import { motion } from "framer-motion";
import { Edit, Plus, Trash2 } from "lucide-react";
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

const ProductsTable = () => {
  const role = localStorage.getItem("role");

  const [isModalOpen, setIsModalOpen] = useState(false); // Edit modal
  const [isModalOpen1, setIsModalOpen1] = useState(false); // Add modal
  const [currentProduct, setCurrentProduct] = useState(null);

  // ✅ create state
  const [createProduct, setCreateProduct] = useState({
    name: "",
    purchase_price: "",
    sale_price: "",
    warehouseId: "",
    supplierId: "",
  });

  const [products, setProducts] = useState([]);

  // ✅ Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [name, setName] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [supplier, setSupplier] = useState("");

  //Pagination calculation start
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
  }, [startDate, endDate, name, warehouse, itemsPerPage]);

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
      Math.min(prev + pagesPerSet, totalPages - pagesPerSet + 1),
    );

  //Pagination calculation end

  // ✅ date sanity
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ all products for dropdown
  const [productsData, setProductsData] = useState([]);
  const {
    data: allProductsRes,
    isLoading: allProductsLoading,
    isError: allProductsError,
    error: allProductsErrObj,
  } = useGetAllProductWithoutQueryQuery();

  useEffect(() => {
    if (allProductsError)
      console.error("Error fetching products", allProductsErrObj);
    if (!allProductsLoading && allProductsRes?.data)
      setProductsData(allProductsRes.data);
  }, [allProductsRes, allProductsLoading, allProductsError, allProductsErrObj]);

  // ✅ suppliers
  // const {
  //   data: allSupplierRes,
  //   isLoading: isLoadingSupplier,
  //   isError: isErrorSupplier,
  //   error: errorSupplier,
  // } = useGetAllSupplierWithoutQueryQuery();
  // const suppliers = allSupplierRes?.data || [];

  // useEffect(() => {
  //   if (isErrorSupplier)
  //     console.error("Error fetching suppliers", errorSupplier);
  // }, [isErrorSupplier, errorSupplier]);

  // ✅ suppliers
  const {
    data: allSupplierRes,
    isLoading: isLoadingSupplier,
    isError: isErrorSupplier,
    error: errorSupplier,
  } = useGetAllSupplierWithoutQueryQuery();
  const suppliers = allSupplierRes?.data || [];

  useEffect(() => {
    if (isErrorSupplier)
      console.error("Error fetching suppliers", errorSupplier);
  }, [isErrorSupplier, errorSupplier]);

  // ✅ Dropdown options

  const supplierOptions = useMemo(
    () =>
      (suppliers || []).map((w) => ({
        value: w.Id,
        label: w.name,
      })),
    [suppliers],
  );

  // ✅ warehouses
  const {
    data: allWarehousesRes,
    isLoading: isLoadingWarehouse,
    isError: isErrorWarehouse,
    error: errorWarehouse,
  } = useGetAllWirehouseWithoutQueryQuery();
  const warehouses = allWarehousesRes?.data || [];

  useEffect(() => {
    if (isErrorWarehouse)
      console.error("Error fetching warehouses", errorWarehouse);
  }, [isErrorWarehouse, errorWarehouse]);

  const warehouseOptions = useMemo(
    () =>
      (warehouses || []).map((w) => ({
        value: w.Id,
        label: w.name,
      })),
    [warehouses],
  );

  // ✅ Dropdown options
  const productOptions = useMemo(
    () =>
      (productsData || []).map((p) => ({
        value: p.name,
        label: p.name,
      })),
    [productsData],
  );

  // ✅ Query args (FIXED: itemsPerPage dependency included)
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
      if (args[k] === undefined || args[k] === null || args[k] === "")
        delete args[k];
    });

    return args;
  }, [
    currentPage,
    itemsPerPage,
    startDate,
    endDate,
    name,
    warehouse,
    supplier,
  ]);

  const { data, isLoading, isError, error, refetch } =
    useGetAllProductQuery(queryArgs);

  console.log("products", products);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching product data", error);
      return;
    }

    if (!isLoading && data?.data) {
      setProducts(data.data);
      setTotalPages(
        Math.max(1, Math.ceil((data?.meta?.count || 0) / itemsPerPage)),
      );
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

  // ✅ Modals
  const handleModalClose = () => setIsModalOpen(false);
  const handleModalClose1 = () => setIsModalOpen1(false);
  const handleAddProduct = () => setIsModalOpen1(true);

  const handleEditClick = (product) => {
    setCurrentProduct({
      ...product,
      purchase_price: product.purchase_price ?? "",
      sale_price: product.sale_price ?? "",
      warehouseId: product.warehouseId ?? product?.warehouse?.Id ?? "",
      supplier: product.supplier ?? "",
    });
    setIsModalOpen(true);
  };

  // ✅ Create
  const [insertProduct] = useInsertProductMutation();
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.name?.trim())
      return toast.error("Product name is required");
    if (!createProduct.warehouseId) return toast.error("Warehouse is required");
    if (!createProduct.supplierId) return toast.error("Supplier is required");

    try {
      const payload = {
        name: createProduct.name.trim(),
        supplierId: Number(createProduct.supplierId),
        warehouseId: Number(createProduct.warehouseId),
        purchase_price: Number(createProduct.purchase_price),
        sale_price: Number(createProduct.sale_price),
      };

      const res = await insertProduct(payload).unwrap();
      console.log("product insert", res?.success);
      if (res?.success === true) {
        toast.success("Successfully created product");
        setIsModalOpen1(false);
        setCreateProduct({
          name: "",
          purchase_price: "",
          sale_price: "",
          warehouseId: "",
          supplierId: "",
        });
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // ✅ Update
  const [updateProduct] = useUpdateProductMutation();
  const handleUpdateProduct = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid product!");

    if (!currentProduct.name?.trim())
      return toast.error("Product name is required");
    if (!currentProduct.warehouseId)
      return toast.error("Warehouse is required");
    if (!currentProduct.supplierId) return toast.error("Supplier is required");

    try {
      const updatedProduct = {
        name: currentProduct.name.trim(),
        supplierId: currentProduct.supplierId,
        warehouseId: Number(currentProduct.warehouseId),
        purchase_price: Number(currentProduct.purchase_price),
        sale_price: Number(currentProduct.sale_price),
      };

      const res = await updateProduct({
        id: currentProduct.Id,
        data: updatedProduct,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated product!");
        setIsModalOpen(false);
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // ✅ Delete
  const [deleteProduct] = useDeleteProductMutation();
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this product?");
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteProduct(id).unwrap();
      if (res?.success) {
        toast.success("Product deleted successfully!");
        refetch?.();
      } else toast.error(res?.message || "Delete failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setName("");
    setWarehouse("");
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition px-4 py-2 rounded-xl text-sm font-semibold"
          onClick={handleAddProduct}
          type="button"
        >
          Add <Plus size={18} className="ml-2" />
        </button>
      </div>

      {/* Filters */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-4 items-end w-full">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        {/* ✅ Per Page Dropdown (same position like your screenshot) */}
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Per Page</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
              setStartPage(1);
            }}
            className="px-3 py-[10px] rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Warehouse</label>
          <Select
            options={warehouseOptions}
            value={
              warehouseOptions.find(
                (o) => String(o.value) === String(warehouse),
              ) || null
            }
            onChange={(selected) => setWarehouse(selected?.value || "")}
            placeholder="Select Warehouse"
            isClearable
            className="text-black"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Supplier</label>
          <Select
            options={supplierOptions}
            value={
              supplierOptions.find(
                (o) => String(o.value) === String(supplier),
              ) || null
            }
            onChange={(selected) => setSupplier(selected?.value || "")}
            placeholder="Select Supplier"
            isClearable
            className="text-black"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Product</label>
          <Select
            options={productOptions}
            value={productOptions.find((o) => o.value === name) || null}
            onChange={(selected) => setName(selected?.value || "")}
            placeholder="Select Product"
            isClearable
            className="text-black"
          />
        </div>

        <button
          className="h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition rounded-xl px-4 text-sm font-semibold"
          onClick={clearFilters}
          type="button"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-6 rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Warehouse
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Purchase
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Sale
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {products.map((product) => (
              <motion.tr
                key={product.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="hover:bg-slate-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.warehouse.name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.supplier.name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(product.purchase_price || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(product.sale_price || 0).toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {(role === "superAdmin" || role === "admin") && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-white transition"
                        title="Edit"
                        type="button"
                      >
                        <Edit size={18} className="text-indigo-600" />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product.Id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-white transition"
                        title="Delete"
                        type="button"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}

            {!isLoading && products.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
        <button
          onClick={handlePreviousSet}
          disabled={startPage === 1}
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
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
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {isModalOpen && currentProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center   p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-lg border border-slate-200"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Edit Product
            </h2>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Product</label>
              <input
                type="text"
                value={currentProduct?.name || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, name: e.target.value })
                }
                className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Warehouse</label>
              <select
                value={currentProduct?.warehouseId || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    warehouseId: e.target.value,
                  })
                }
                className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                required
              >
                <option value="">Select Warehouse</option>
                {isLoadingWarehouse ? (
                  <option disabled>Loading...</option>
                ) : (
                  warehouses?.map((w) => (
                    <option key={w.Id} value={w.Id}>
                      {w.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Supplier</label>
              <select
                value={currentProduct?.supplierId || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    supplierId: e.target.value,
                  })
                }
                className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                required
              >
                <option value="">Select Supplier</option>
                {isLoadingSupplier ? (
                  <option disabled>Loading...</option>
                ) : (
                  suppliers?.map((s) => (
                    <option key={s.Id} value={s.Id}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">
                Purchase Price
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
                className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Sale Price</label>
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
                className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl"
                onClick={handleUpdateProduct}
                type="button"
              >
                Save
              </button>
              <button
                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
                onClick={handleModalClose}
                type="button"
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
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Add Product
            </h2>

            <form onSubmit={handleCreateProduct}>
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Name</label>
                <input
                  type="text"
                  value={createProduct.name}
                  onChange={(e) =>
                    setCreateProduct({ ...createProduct, name: e.target.value })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-700">
                  Warehouse
                </label>
                <select
                  value={createProduct.warehouseId || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      warehouseId: e.target.value,
                    })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Warehouse</option>
                  {isLoadingWarehouse ? (
                    <option disabled>Loading...</option>
                  ) : (
                    warehouses?.map((w) => (
                      <option key={w.Id} value={w.Id}>
                        {w.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-700">Supplier</label>
                <select
                  value={createProduct.supplierId || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      supplierId: e.target.value,
                    })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Supplier</option>
                  {isLoadingSupplier ? (
                    <option disabled>Loading...</option>
                  ) : (
                    suppliers?.map((s) => (
                      <option key={s.Id} value={s.Id}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* <div className="mt-4">
                <label className="block text-sm text-slate-700">Supplier</label>
                <select
                  value={createProduct.supplier || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      supplier: e.target.value,
                    })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Supplier</option>
                  {isLoadingSupplier ? (
                    <option disabled>Loading...</option>
                  ) : (
                    suppliers?.map((s) => (
                      <option key={s.Id} value={s.name}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </div> */}

              <div className="mt-4">
                <label className="block text-sm text-slate-700">
                  Purchase Price
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
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-700">
                  Sale Price
                </label>
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
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 outline-none
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

export default ProductsTable;
