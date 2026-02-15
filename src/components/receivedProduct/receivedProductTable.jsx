// import { motion } from "framer-motion";
// import { Edit, Notebook, Plus, ShoppingBasket, Trash2 } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import Select from "react-select";

// import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";
// import {
//   useDeleteReceivedProductMutation,
//   useGetAllReceivedProductQuery,
//   useInsertReceivedProductMutation,
//   useUpdateReceivedProductMutation,
// } from "../../features/receivedProduct/receivedProduct";

// const ReceivedProductTable = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalOpen1, setIsModalOpen1] = useState(false);
//   const [currentProduct, setCurrentProduct] = useState(null);
//   const userId = localStorage.getItem("userId");

//   // ✅ Add form (INSERT) -> productId (Id)
//   const [createProduct, setCreateProduct] = useState({
//     productId: "",
//     quantity: "",
//   });

//   console.log("currentProduct", currentProduct);
//   console.log("createProduct", createProduct);

//   const [products, setProducts] = useState([]);

//   // ✅ Filters: start/end + product NAME
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [productName, setProductName] = useState(""); // ✅ filter by name

//   // ✅ All products
//   const {
//     data: allProductsRes,
//     isLoading: isLoadingAllProducts,
//     isError: isErrorAllProducts,
//     error: errorAllProducts,
//   } = useGetAllProductWithoutQueryQuery();

//   const productsData = allProductsRes?.data || [];

//   useEffect(() => {
//     if (isErrorAllProducts) {
//       console.error("Error fetching products", errorAllProducts);
//     }
//   }, [isErrorAllProducts, errorAllProducts]);

//   // ✅ Dropdown options (value = Id, label = name)
//   const productDropdownOptions = useMemo(() => {
//     return (productsData || []).map((p) => ({
//       value: String(p.Id ?? p.id ?? p._id),
//       label: p.name,
//     }));
//   }, [productsData]);

//   // ✅ Create a map: productId -> productName
//   const productNameMap = useMemo(() => {
//     const m = new Map();
//     (productsData || []).forEach((p) => {
//       const key = String(p.Id ?? p.id ?? p._id);
//       m.set(key, p.name);
//     });
//     return m;
//   }, [productsData]);

//   // ✅ Robust resolver for table product name
//   const resolveProductName = (rp) => {
//     // Try multiple possible keys that backend might return
//     const pid =
//       rp.productId ??
//       rp.product_id ??
//       rp.ProductId ??
//       rp.product?.Id ??
//       rp.product?.id ??
//       rp.product?._id;

//     // If API already includes name
//     if (rp.productName) return rp.productName;
//     if (rp.product?.name) return rp.product?.name;

//     if (pid === null || pid === undefined || pid === "") return "N/A";

//     // Normal lookup by id
//     const byId = productNameMap.get(String(pid));
//     if (byId) return byId;

//     // If wrong data saved: productId contains name text
//     const pidText = String(pid);
//     const looksLikeName = (productsData || []).some((p) => p.name === pidText);
//     if (looksLikeName) return pidText;

//     return "N/A";
//   };

//   //Pagination calculation start
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [startPage, setStartPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [pagesPerSet, setPagesPerSet] = useState(10);

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

//   useEffect(() => {
//     setCurrentPage(1);
//     setStartPage(1);
//   }, [startDate, endDate, productName, itemsPerPage]);

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
//       Math.min(prev + pagesPerSet, totalPages - pagesPerSet + 1),
//     );

//   //Pagination calculation end

//   // ✅ startDate > endDate হলে endDate ঠিক করে দেবে
//   useEffect(() => {
//     if (startDate && endDate && startDate > endDate) {
//       setEndDate(startDate);
//     }
//   }, [startDate, endDate]);

//   // ✅ Query args: date + NAME
//   // NOTE: backend key যদি "name" না হয়, এখানে name -> productName/search করে দাও
//   const queryArgs = {
//     page: currentPage,
//     limit: itemsPerPage,
//     startDate: startDate || undefined,
//     endDate: endDate || undefined,
//     name: productName || undefined, // ✅ filter by product name
//   };

//   const { data, isLoading, isError, error, refetch } =
//     useGetAllReceivedProductQuery(queryArgs);

//   useEffect(() => {
//     if (isError) {
//       console.error("Error fetching received product data", error);
//       return;
//     }
//     if (!isLoading && data) {
//       setProducts(data.data || []);
//       setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
//     }
//   }, [data, isLoading, isError, error, itemsPerPage]);

//   // ✅ Modals
//   const handleAddProduct = () => setIsModalOpen1(true);
//   const handleModalClose1 = () => setIsModalOpen1(false);

//   const role = localStorage.getItem("role");
//   const [updateReceivedProduct] = useUpdateReceivedProductMutation();
//   const [isModalOpen2, setIsModalOpen2] = useState(false);

//   const handleModalClose2 = () => setIsModalOpen2(false);

//   const handleEditClick1 = (rp) => {
//     setCurrentProduct({
//       ...rp,
//       productId: rp.productId ? String(rp.productId) : "",
//       quantity: rp.quantity ?? "",
//       supplier: rp.supplier ?? "",
//       userId: userId,
//     });
//     setIsModalOpen2(true);
//   };

//   const handleUpdateProduct1 = async () => {
//     if (!currentProduct?.Id) return toast.error("Invalid item!");
//     if (currentProduct?.note === "" || currentProduct?.note === null)
//       return toast.error("Note is required!");

//     try {
//       const payload = {
//         productId: Number(currentProduct.productId), // ✅ UPDATE uses Id
//         quantity: Number(currentProduct.quantity),
//         note: currentProduct.note,
//         status: currentProduct.status,
//         userId: userId,
//       };

//       const res = await updateReceivedProduct({
//         id: currentProduct.Id,
//         data: payload,
//       }).unwrap();

//       if (res?.success) {
//         toast.success("Successfully updated product!");
//         setIsModalOpen2(false);
//         refetch?.();
//       } else {
//         toast.error(res?.message || "Update failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   const handleEditClick = (rp) => {
//     setCurrentProduct({
//       ...rp,
//       productId: rp.productId ? String(rp.productId) : "",
//       quantity: rp.quantity ?? "",
//       supplier: rp.supplier ?? "",
//       userId: userId,
//     });
//     setIsModalOpen(true);
//   };
//   const handleUpdateProduct = async () => {
//     try {
//       const updatedProduct = {
//         productId: Number(currentProduct.productId), // ✅ UPDATE uses Id
//         quantity: Number(currentProduct.quantity),
//         note: currentProduct.note,
//         status: currentProduct.status,
//         userId: userId,
//       };

//       const res = await updateReceivedProduct({
//         id: currentProduct.Id,
//         data: updatedProduct,
//       }).unwrap();

//       if (res.success) {
//         toast.success("Successfully updated!");
//         setIsModalOpen(false);
//         refetch?.();
//       } else {
//         toast.error("Update failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   const handleModalClose = () => setIsModalOpen(false);

//   // ✅ Insert
//   const [insertReceivedProduct] = useInsertReceivedProductMutation();

//   const handleCreateProduct = async (e) => {
//     e.preventDefault();

//     if (!createProduct.productId) return toast.error("Please select a product");
//     if (!createProduct.quantity || Number(createProduct.quantity) <= 0)
//       return toast.error("Please enter a valid quantity");

//     try {
//       const payload = {
//         productId: Number(createProduct.productId), // ✅ INSERT uses Id
//         quantity: Number(createProduct.quantity),
//       };

//       const res = await insertReceivedProduct(payload).unwrap();
//       if (res.success) {
//         toast.success("Successfully created received product");
//         setIsModalOpen1(false);
//         setCreateProduct({ productId: "", quantity: "", supplier: "" });

//         refetch?.();
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Create failed!");
//     }
//   };

//   // ✅ Delete
//   const [deleteReceivedProduct] = useDeleteReceivedProductMutation();

//   const handleDeleteProduct = async (id) => {
//     const confirmDelete = window.confirm("Do you want to delete this product?");
//     if (!confirmDelete) return toast.info("Delete action was cancelled.");

//     try {
//       const res = await deleteReceivedProduct(id).unwrap();
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

//   // ✅ Filters clear
//   const clearFilters = () => {
//     setStartDate("");
//     setEndDate("");
//     setProductName("");
//   };

//   return (
//     <motion.div
//       className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.2 }}
//     >
//       {/* Add Button */}
//       <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <button
//           type="button"
//           onClick={handleAddProduct}
//           className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
//         >
//           Add <Plus size={18} className="ml-2" />
//         </button>

//         <div className="flex items-center justify-between sm:justify-end gap-3 rounded-md border border-gray-700 bg-gray-800/60 px-4 py-2">
//           <div className="flex items-center gap-2 text-gray-300">
//             <ShoppingBasket size={18} className="text-amber-400" />
//             <span className="text-sm">Total Purchase</span>
//           </div>

//           <span className="text-white font-semibold tabular-nums">
//             {isLoading ? "Loading..." : data?.meta?.totalQuantity}
//           </span>
//         </div>
//       </div>

//       {/* ✅ Filters (NAME based) */}
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
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
//           />
//         </div>

//         {/* ✅ Per Page Dropdown (same position like your screenshot) */}
//         <div className="flex flex-col">
//           <label className="text-sm text-slate-600 mb-1">Per Page</label>
//           <select
//             value={itemsPerPage}
//             onChange={(e) => {
//               setItemsPerPage(Number(e.target.value));
//               setCurrentPage(1);
//               setStartPage(1);
//             }}
//             className="px-3 py-[10px] rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
//           >
//             <option value={10}>10</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//             <option value={100}>100</option>
//           </select>
//         </div>

//         <div className="flex items-center justify-center mt-6">
//           <Select
//             options={productDropdownOptions} // value=Id, label=name
//             value={
//               productDropdownOptions.find((o) => o.label === productName) ||
//               null
//             }
//             onChange={(selected) => setProductName(selected?.label || "")} // ✅ store NAME
//             placeholder={isLoadingAllProducts ? "Loading..." : "Select Product"}
//             isClearable
//             className="text-black w-full"
//             isDisabled={isLoadingAllProducts}
//           />
//         </div>

//         <button
//           className="flex items-center mt-6 bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto"
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
//                 Date
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Supplier
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Product
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Quantity
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Purchase Price
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Sale Price
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-gray-700">
//             {products.map((rp) => (
//               <motion.tr
//                 key={rp.Id}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
//                   {rp.createdAt
//                     ? new Date(rp.createdAt).toLocaleDateString()
//                     : "-"}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
//                   {rp.supplier}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
//                   {resolveProductName(rp)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(rp.quantity || 0).toFixed(2)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(rp.purchase_price || 0).toFixed(2)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(rp.sale_price || 0).toFixed(2)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {rp.status}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   {rp.note && (
//                     <button
//                       className="text-white-600 hover:text-white-900"
//                       title={rp.note}
//                     >
//                       <Notebook size={18} />
//                     </button>
//                   )}
//                   <button
//                     onClick={() => handleEditClick(rp)}
//                     className="text-indigo-600 hover:text-indigo-900"
//                   >
//                     <Edit size={18} />
//                   </button>
//                   {/* <button
//                     onClick={() => handleDeleteProduct(rp.Id)}
//                     className="text-red-600 hover:text-red-900 ms-4"
//                   >
//                     <Trash2 size={18} />
//                   </button> */}

//                   {role === "superAdmin" ||
//                   role === "admin" ||
//                   rp.status === "Approved" ? (
//                     <button
//                       onClick={() => handleDeleteProduct(rp.Id)}
//                       className="text-red-600 hover:text-red-900 ms-4"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   ) : (
//                     <button
//                       onClick={() => handleEditClick1(rp)}
//                       className="text-red-600 hover:text-red-900 ms-4"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   )}
//                 </td>
//               </motion.tr>
//             ))}

//             {!isLoading && products.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={5}
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
//       <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
//         <button
//           onClick={handlePreviousSet}
//           disabled={startPage === 1}
//           className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
//         >
//           Prev
//         </button>

//         {[...Array(endPage - startPage + 1)].map((_, index) => {
//           const pageNum = startPage + index;
//           const active = pageNum === currentPage;
//           return (
//             <button
//               key={pageNum}
//               onClick={() => handlePageChange(pageNum)}
//               className={`px-4 py-2 rounded-xl border transition ${
//                 active
//                   ? "bg-indigo-600 text-white border-indigo-600"
//                   : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
//               }`}
//             >
//               {pageNum}
//             </button>
//           );
//         })}

//         <button
//           onClick={handleNextSet}
//           disabled={endPage === totalPages}
//           className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
//         >
//           Next
//         </button>
//       </div>

//       {/* ✅ Edit Modal (UPDATE uses Id) */}
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
//               <label className="block text-sm text-white">Name:</label>
//               <Select
//                 options={productDropdownOptions}
//                 value={
//                   productDropdownOptions.find(
//                     (o) => o.value === String(currentProduct?.productId),
//                   ) || null
//                 }
//                 onChange={(selected) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     productId: selected?.value || "", // ✅ Id
//                   })
//                 }
//                 placeholder="Select Product"
//                 isClearable
//                 className="text-black w-full"
//                 isDisabled={isLoadingAllProducts}
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
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//               />
//             </div>

//             {role === "superAdmin" || role === "admin" ? (
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Status</label>
//                 <select
//                   value={currentProduct.status || ""}
//                   onChange={(e) =>
//                     setCurrentProduct({
//                       ...currentProduct,
//                       status: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                   required
//                 >
//                   <option value="">Select Status</option>
//                   <option value="Approved">Approved</option>
//                   <option value="Pending">Pending</option>
//                 </select>
//               </div>
//             ) : (
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Note:</label>
//                 <textarea
//                   type="text"
//                   value={currentProduct?.note || ""}
//                   onChange={(e) =>
//                     setCurrentProduct({
//                       ...currentProduct,
//                       note: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 />
//               </div>
//             )}

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

//       {/* ✅ Add Modal (INSERT uses Id) */}
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
//                 <Select
//                   options={productDropdownOptions}
//                   value={
//                     productDropdownOptions.find(
//                       (o) => o.value === String(createProduct.productId),
//                     ) || null
//                   }
//                   onChange={(selected) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       productId: selected?.value || "", // ✅ Id
//                     })
//                   }
//                   placeholder="Select Product"
//                   isClearable
//                   className="text-black w-full"
//                   isDisabled={isLoadingAllProducts}
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Quantity</label>
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
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
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

//       {/* Delete Modal */}
//       {isModalOpen2 && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">
//               Delete Meta Expense
//             </h2>

//             {role === "superAdmin" ? (
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Status</label>
//                 <select
//                   value={currentProduct.status || ""}
//                   onChange={(e) =>
//                     setCurrentProduct({
//                       ...currentProduct,
//                       status: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                   required
//                 >
//                   <option value="">Select Status</option>
//                   <option value="Approved">Approved</option>
//                   <option value="Pending">Pending</option>
//                 </select>
//               </div>
//             ) : (
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Note:</label>
//                 <textarea
//                   type="text"
//                   value={currentProduct?.note || ""}
//                   onChange={(e) =>
//                     setCurrentProduct({
//                       ...currentProduct,
//                       note: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 />
//               </div>
//             )}

//             <div className="mt-6 flex justify-end">
//               <button
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
//                 onClick={handleUpdateProduct1}
//               >
//                 Save
//               </button>
//               <button
//                 className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
//                 onClick={handleModalClose2}
//               >
//                 Cancel
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default ReceivedProductTable;

import { motion } from "framer-motion";
import { Edit, Notebook, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";
import {
  useDeleteReceivedProductMutation,
  useGetAllReceivedProductQuery,
  useInsertReceivedProductMutation,
  useUpdateReceivedProductMutation,
} from "../../features/receivedProduct/receivedProduct";
import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";
import { useGetAllWirehouseWithoutQueryQuery } from "../../features/wirehouse/wirehouse";

const ReceivedProductTable = () => {
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [isModalOpen, setIsModalOpen] = useState(false); // Edit modal
  const [isModalOpen1, setIsModalOpen1] = useState(false); // Add modal
  const [isModalOpen2, setIsModalOpen2] = useState(false); // Note / status modal
  const [currentProduct, setCurrentProduct] = useState(null);

  const [warehouse, setWarehouse] = useState("");
  const [supplier, setSupplier] = useState("");

  // ✅ Add form (INSERT) -> productId (Id)
  const [createProduct, setCreateProduct] = useState({
    warehouseId: "",
    supplierId: "",
    productId: "",
    quantity: "",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [rows, setRows] = useState([]);

  // ✅ Filters: start/end + product NAME
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productName, setProductName] = useState("");

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
  }, [startDate, endDate, productName, itemsPerPage]);

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

  // ✅ startDate > endDate fix
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ All products (for dropdown + name mapping)
  const {
    data: allProductsRes,
    isLoading: isLoadingAllProducts,
    isError: isErrorAllProducts,
    error: errorAllProducts,
  } = useGetAllProductWithoutQueryQuery();

  const productsData = allProductsRes?.data || [];

  useEffect(() => {
    if (isErrorAllProducts)
      console.error("Error fetching products", errorAllProducts);
  }, [isErrorAllProducts, errorAllProducts]);

  // ✅ Dropdown options (value = Id, label = name)
  const productDropdownOptions = useMemo(() => {
    return (productsData || []).map((p) => ({
      value: String(p.Id ?? p.id ?? p._id),
      label: p.name,
    }));
  }, [productsData]);

  // ✅ productId -> productName map
  const productNameMap = useMemo(() => {
    const m = new Map();
    (productsData || []).forEach((p) => {
      const key = String(p.Id ?? p.id ?? p._id);
      m.set(key, p.name);
    });
    return m;
  }, [productsData]);

  // ✅ resolve name for table
  const resolveProductName = (rp) => {
    const pid =
      rp.productId ??
      rp.product_id ??
      rp.ProductId ??
      rp.product?.Id ??
      rp.product?.id ??
      rp.product?._id;

    if (rp.productName) return rp.productName;
    if (rp.product?.name) return rp.product?.name;

    if (pid === null || pid === undefined || pid === "") return "N/A";

    const byId = productNameMap.get(String(pid));
    if (byId) return byId;

    const pidText = String(pid);
    const looksLikeName = (productsData || []).some((p) => p.name === pidText);
    if (looksLikeName) return pidText;

    return "N/A";
  };

  // ✅ Query args
  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      name: productName || undefined, // ✅ backend filter by name
    };
    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "")
        delete args[k];
    });
    return args;
  }, [currentPage, itemsPerPage, startDate, endDate, productName]);

  const { data, isLoading, isError, error, refetch } =
    useGetAllReceivedProductQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching received product data", error);
      return;
    }
    if (!isLoading && data) {
      setRows(data.data || []);
      setTotalPages(
        Math.max(1, Math.ceil((data?.meta?.total || 0) / itemsPerPage)),
      );
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

  // ✅ Modals
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose = () => setIsModalOpen(false);
  const handleModalClose1 = () => setIsModalOpen1(false);
  const handleModalClose2 = () => setIsModalOpen2(false);

  const [updateReceivedProduct] = useUpdateReceivedProductMutation();

  const handleEditClick = (rp) => {
    setCurrentProduct({
      ...rp,
      productId: rp.productId ? String(rp.productId) : "",
      quantity: rp.quantity ?? "",
      supplier: rp.supplier ?? "",
      date: rp.date ?? "",
      userId,
    });
    setIsModalOpen(true);
  };

  const handleEditClick1 = (rp) => {
    setCurrentProduct({
      ...rp,
      productId: rp.productId ? String(rp.productId) : "",
      quantity: rp.quantity ?? "",
      supplier: rp.supplier ?? "",
      userId,
    });
    setIsModalOpen2(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const updatedProduct = {
        productId: Number(currentProduct.productId),
        quantity: Number(currentProduct.quantity),
        note: currentProduct.note,
        status: currentProduct.status,
        date: currentProduct.date,
        userId,
      };

      const res = await updateReceivedProduct({
        id: currentProduct.Id,
        data: updatedProduct,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated!");
        setIsModalOpen(false);
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleUpdateProduct1 = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid item!");
    if (currentProduct?.note === "" || currentProduct?.note === null)
      return toast.error("Note is required!");

    try {
      const payload = {
        productId: Number(currentProduct.productId),
        quantity: Number(currentProduct.quantity),
        note: currentProduct.note,
        status: currentProduct.status,
        userId,
      };

      const res = await updateReceivedProduct({
        id: currentProduct.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated product!");
        setIsModalOpen2(false);
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // ✅ Insert
  const [insertReceivedProduct] = useInsertReceivedProductMutation();

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.productId) return toast.error("Please select a product");
    if (!createProduct.quantity || Number(createProduct.quantity) <= 0)
      return toast.error("Please enter a valid quantity");

    try {
      const payload = {
        productId: Number(createProduct.productId),
        quantity: Number(createProduct.quantity),
        date: createProduct.date,
        note: createProduct.note,
      };

      const res = await insertReceivedProduct(payload).unwrap();
      if (res?.success) {
        toast.success("Successfully created received product");
        setIsModalOpen1(false);
        setCreateProduct({ productId: "", quantity: "" });
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // ✅ Delete
  const [deleteReceivedProduct] = useDeleteReceivedProductMutation();

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this product?");
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteReceivedProduct(id).unwrap();
      if (res?.success) {
        toast.success("Product deleted successfully!");
        refetch?.();
      } else toast.error(res?.message || "Delete failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  // ✅ Filters clear
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setProductName("");
  };

  // ✅ react-select light styles (so it looks good in light UI)
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 14,
      borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0", // indigo-200 / slate-200
      boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
      "&:hover": { borderColor: "#cbd5e1" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    placeholder: (base) => ({ ...base, color: "#64748b" }),
    menu: (base) => ({ ...base, borderRadius: 14, overflow: "hidden" }),
  };

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

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top Bar */}
      <div className="my-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Add <Plus size={18} className="ml-2" />
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <ShoppingBasket size={18} className="text-amber-500" />
            <span className="text-sm">Total Purchase</span>
          </div>

          <span className="text-slate-900 font-semibold tabular-nums">
            {isLoading ? "Loading..." : (data?.meta?.totalQuantity ?? 0)}
          </span>
        </div>
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

        {/* Product Filter (stores NAME) */}
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Product</label>
          <Select
            options={productDropdownOptions}
            value={
              productDropdownOptions.find((o) => o.label === productName) ||
              null
            }
            onChange={(selected) => setProductName(selected?.label || "")}
            placeholder={isLoadingAllProducts ? "Loading..." : "Select Product"}
            isClearable
            className="text-black"
            isDisabled={isLoadingAllProducts}
            styles={selectStyles}
          />
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

        <button
          type="button"
          className="h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition rounded-xl px-4 text-sm font-semibold"
          onClick={clearFilters}
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
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Purchase Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Sale Price
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((rp) => (
              <motion.tr
                key={rp.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="hover:bg-slate-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {rp.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {rp.supplier || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                  {resolveProductName(rp)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(rp.quantity || 0).toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(rp.price * rp.quantity || 0).toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(rp.sale_price * rp.quantity || 0).toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                      rp.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : rp.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : null
                    }`}
                  >
                    {rp.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {rp.note && (
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-white transition"
                        title={rp.note}
                      >
                        <Notebook size={18} className="text-slate-700" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleEditClick(rp)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-white transition"
                      title="Edit"
                    >
                      <Edit size={18} className="text-indigo-600" />
                    </button>

                    {role === "superAdmin" ||
                    role === "admin" ||
                    rp.status === "Approved" ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(rp.Id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-white transition"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEditClick1(rp)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-white transition"
                        title="Request Delete"
                      >
                        <Trash2 size={18} className="text-amber-600" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
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
              <Select
                options={productDropdownOptions}
                value={
                  productDropdownOptions.find(
                    (o) => o.value === String(currentProduct?.productId),
                  ) || null
                }
                onChange={(selected) =>
                  setCurrentProduct({
                    ...currentProduct,
                    productId: selected?.value || "",
                  })
                }
                placeholder="Select Product"
                isClearable
                styles={selectStyles}
                className="text-black"
                isDisabled={isLoadingAllProducts}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Date</label>
              <input
                type="date"
                value={currentProduct?.date || ""}
                onChange={(e) =>
                  setCurrentProduct((p) => ({ ...p, date: e.target.value }))
                }
                className="border bg-white border-slate-200 rounded-xl p-2 w-full mt-1 text-slate-900 outline-none
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
                value={currentProduct?.supplier || ""}
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
              <label className="block text-sm text-slate-700">Quantity</label>
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
                className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              />
            </div>

            {role === "superAdmin" || role === "admin" ? (
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Status</label>
                <select
                  value={currentProduct?.status || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      status: e.target.value,
                    })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            ) : (
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Note</label>
                <textarea
                  value={currentProduct?.note || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      note: e.target.value,
                    })
                  }
                  className="min-h-[90px] border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </div>
            )}

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
                <label className="block text-sm text-slate-700">Product</label>
                <Select
                  options={productDropdownOptions}
                  value={
                    productDropdownOptions.find(
                      (o) => o.value === String(createProduct.productId),
                    ) || null
                  }
                  onChange={(selected) =>
                    setCreateProduct({
                      ...createProduct,
                      productId: selected?.value || "",
                    })
                  }
                  placeholder="Select Product"
                  isClearable
                  className="text-black"
                  styles={selectStyles}
                  isDisabled={isLoadingAllProducts}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Date</label>
                <input
                  type="date"
                  value={createProduct?.date || ""}
                  onChange={(e) =>
                    setCreateProduct((p) => ({ ...p, date: e.target.value }))
                  }
                  className="border bg-white border-slate-200 rounded-xl p-2 w-full mt-1 text-slate-900 outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-700">
                  Warehouse
                </label>
                <select
                  value={createProduct?.warehouseId || ""}
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
                  value={createProduct?.supplierId || ""}
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

              <div className="mt-4">
                <label className="block text-sm text-slate-700">Quantity</label>
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
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Note</label>
                <textarea
                  value={createProduct?.note || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      note: e.target.value,
                    })
                  }
                  className="min-h-[90px] border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
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

      {/* Note / Status Modal (your isModalOpen2) */}
      {isModalOpen2 && currentProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center   p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-lg border border-slate-200"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Request Delete
            </h2>

            {role === "superAdmin" ? (
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Status</label>
                <select
                  value={currentProduct?.status || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      status: e.target.value,
                    })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            ) : (
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Note</label>
                <textarea
                  value={currentProduct?.note || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      note: e.target.value,
                    })
                  }
                  className="min-h-[90px] border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl"
                onClick={handleUpdateProduct1}
                type="button"
              >
                Save
              </button>
              <button
                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
                onClick={handleModalClose2}
                type="button"
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

export default ReceivedProductTable;
