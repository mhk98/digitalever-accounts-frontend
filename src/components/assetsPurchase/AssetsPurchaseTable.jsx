// import { motion } from "framer-motion";
// import { Edit, Notebook, Plus, ShoppingBasket, Trash2 } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import Select from "react-select";
// import {
//   useDeleteAssetsPurchaseMutation,
//   useGetAllAssetsPurchaseQuery,
//   useGetAllAssetsPurchaseWithoutQueryQuery,
//   useInsertAssetsPurchaseMutation,
//   useUpdateAssetsPurchaseMutation,
// } from "../../features/assetsPurchase/assetsPurchase";

// const AssetsPurchaseTable = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalOpen1, setIsModalOpen1] = useState(false);
//   // const [isModalOpen2, setIsModalOpen2] = useState(false);

//   const role = localStorage.getItem("role");
//   const userId = localStorage.getItem("userId");

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

//   // ✅ store selected productId (not name)
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
//   } = useGetAllAssetsPurchaseWithoutQueryQuery();

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

//   // ✅ Query args now uses productId (not name)
//   const queryArgs = useMemo(
//     () => ({
//       page: currentPage,
//       limit: itemsPerPage,
//       startDate: startDate || undefined,
//       endDate: endDate || undefined,
//       name: name || undefined, // ✅ send Id
//     }),
//     [currentPage, itemsPerPage, startDate, endDate, name],
//   );

//   const { data, isLoading, isError, error, refetch } =
//     useGetAllAssetsPurchaseQuery(queryArgs);

//   useEffect(() => {
//     if (isError) {
//       console.error("Error fetching product data", error);
//     } else if (!isLoading && data) {
//       setProducts(data.data || []);
//       setTotalPages(Math.ceil((data?.meta?.count || 0) / itemsPerPage) || 1);
//     }
//   }, [data, isLoading, isError, error, currentPage, itemsPerPage]);

//   // Modals
//   const handleModalClose = () => setIsModalOpen(false);
//   const handleAddProduct = () => setIsModalOpen1(true);
//   const handleModalClose1 = () => setIsModalOpen1(false);
//   // const handleDeleteClose = () => setIsModalOpen2(false);

//   // const handleDeleteClick = (product) => {
//   //   setCurrentProduct({
//   //     ...product,
//   //     note: product.note ?? "",
//   //     status: product.status ?? "",
//   //   });
//   //   setIsModalOpen2(true);
//   // };

//   const [updateAssetsPurchase] = useUpdateAssetsPurchaseMutation();

//   const [isModalOpen2, setIsModalOpen2] = useState(false);

//   const handleModalClose2 = () => setIsModalOpen2(false);

//   const handleEditClick1 = (product) => {
//     setCurrentProduct({
//       ...product,
//       price: product.price ?? "",
//       note: product.note ?? "",
//       status: product.status ?? "",
//       quantity: product.quantity ?? "",
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
//         name: currentProduct.name.trim(),
//         quantity: Number(currentProduct.quantity),
//         price: Number(currentProduct.price),
//         note: currentProduct.note,
//         status: currentProduct.status,
//         userId: userId,
//       };

//       const res = await updateAssetsPurchase({
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

//   const handleEditClick = (product) => {
//     setCurrentProduct({
//       ...product,
//       price: product.price ?? "",
//       note: product.note ?? "",
//       status: product.status ?? "",
//       quantity: product.quantity ?? "",
//       userId: userId,
//     });
//     setIsModalOpen(true);
//   };

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
//         note: currentProduct.note,
//         status: currentProduct.status,
//         userId: userId,
//       };

//       const res = await updateAssetsPurchase({
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
//   // Insert
//   const [insertAssetsPurchase] = useInsertAssetsPurchaseMutation();
//   const handleCreateProduct = async (e) => {
//     e.preventDefault();

//     if (!createProduct.name?.trim()) return toast.error("Name is required!");
//     if (!createProduct.price) return toast.error("Price is required!");
//     if (!createProduct.quantity) return toast.error(" Quantity is required!");

//     try {
//       const payload = {
//         name: createProduct.name.trim(),
//         quantity: Number(createProduct.quantity),
//         price: Number(createProduct.price),
//       };

//       const res = await insertAssetsPurchase(payload).unwrap();
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

//   // const handleUpdateDelete = async () => {
//   //   if (!currentProduct?.Id) return toast.error("Invalid item!");
//   //   if (currentProduct?.note === "" || currentProduct?.note === null)
//   //     return toast.error("Note is required!");

//   //   try {
//   //     const payload = {
//   //       note: currentProduct.note,
//   //     };

//   //     const res = await updateAssetsPurchase({
//   //       id: currentProduct.Id,
//   //       data: payload,
//   //     }).unwrap();

//   //     if (res?.success) {
//   //       toast.success("Successfully updated product!");
//   //       setIsModalOpen(false);
//   //       refetch?.();
//   //     } else {
//   //       toast.error(res?.message || "Update failed!");
//   //     }
//   //   } catch (err) {
//   //     toast.error(err?.data?.message || "Update failed!");
//   //   }
//   // };

//   // Delete
//   const [deleteAssetsPurchase] = useDeleteAssetsPurchaseMutation();
//   const handleDeleteProduct = async (id) => {
//     const confirmDelete = window.confirm("Do you want to delete this product?");
//     if (!confirmDelete) return toast.info("Delete action was cancelled.");

//     try {
//       const res = await deleteAssetsPurchase(id).unwrap();
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
//       Math.min(prev + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1)),
//     );

//   // ✅ Select options use Id as value, show name as label
//   const productOptions = (productsData || []).map((p) => ({
//     value: p.name,
//     label: p.name,
//   }));

//   const selectStyles = useMemo(
//     () => ({
//       control: (base, state) => ({
//         ...base,
//         minHeight: 44,
//         borderRadius: 12,
//         borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0", // indigo-200 / slate-200
//         boxShadow: state.isFocused
//           ? "0 0 0 4px rgba(99, 102, 241, 0.15)"
//           : "none",
//         "&:hover": { borderColor: state.isFocused ? "#c7d2fe" : "#cbd5e1" },
//       }),
//       valueContainer: (base) => ({ ...base, padding: "0 12px" }),
//       placeholder: (base) => ({ ...base, color: "#64748b" }), // slate-500
//       singleValue: (base) => ({ ...base, color: "#0f172a" }), // slate-900
//       menu: (base) => ({
//         ...base,
//         borderRadius: 12,
//         overflow: "hidden",
//         zIndex: 60,
//       }),
//       option: (base, state) => ({
//         ...base,
//         backgroundColor: state.isSelected
//           ? "rgba(99, 102, 241, 0.12)"
//           : state.isFocused
//             ? "#f8fafc"
//             : "#fff",
//         color: "#0f172a",
//       }),
//     }),
//     [],
//   );

//   return (
//     <motion.div
//       className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.2 }}
//     >
//       <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <button
//           type="button"
//           onClick={handleAddProduct}
//           className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
//         >
//           Add <Plus size={18} className="ml-2" />
//         </button>

//         <div className="flex items-center justify-between sm:justify-end gap-3 rounded-md border bg-white hover:bg-slate-50 text-slate-700 px-4 py-2">
//           <div className="flex items-center gap-2">
//             <ShoppingBasket size={18} className="text-amber-400" />
//             <span className="text-sm">Total Purchase</span>
//           </div>

//           <span className="font-semibold tabular-nums text-slate-700">
//             {isLoading ? "Loading..." : data?.meta?.countQuantity}
//           </span>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6 w-full justify-center mx-auto">
//         <div className="flex flex-col">
//           <label className="text-sm text-slate-600 mb-1">From</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-sm text-slate-600 mb-1">To</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
//           />
//         </div>

//         <div className="flex items-center justify-center md:mt-0">
//           <Select
//             options={productOptions}
//             value={productOptions.find((o) => o.value === name) || null}
//             onChange={(selected) => setName(selected?.value || "")}
//             placeholder="Select Assets"
//             isClearable
//             styles={selectStyles}
//             className="text-black w-full"
//           />
//         </div>
//         {/* ✅ Filter by productId */}
//         {/* <div className="flex items-center justify-center mt-6">
//           <Select
//             options={productOptions}
//             value={productOptions.find((o) => o.value === name) || null}
//             onChange={(selected) =>
//               setName(selected?.value ? String(selected.value) : "")
//             }
//             placeholder="Select Assets"
//             isClearable
//             className="text-black w-full"
//           />
//         </div> */}

//         {/* <button
//           className="flex items-center mt-6 bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto"
//           onClick={clearFilters}
//         >
//           Clear Filters
//         </button> */}

//         <button
//           className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 transition px-4 py-[10px] rounded-xl border border-slate-200"
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
//               <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
//                 Name
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
//                 Quantity
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
//                 Price
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
//                 Total Price
//               </th>

//               <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
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
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
//                   {product.name}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
//                   {product.quantity}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
//                   {Number(product.price || 0).toFixed(2)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
//                   {Number(product.total || 0).toFixed(2)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
//                   {product.status}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   {product.note && (
//                     <button
//                       className="text-white-600 hover:text-white-900"
//                       title={product.note}
//                     >
//                       <Notebook size={18} />
//                     </button>
//                   )}
//                   <button
//                     onClick={() => handleEditClick(product)}
//                     className="text-indigo-600 hover:text-indigo-900 ms-4"
//                   >
//                     <Edit size={18} />
//                   </button>

//                   {role === "superAdmin" || product.status === "Approved" ? (
//                     <button
//                       onClick={() => handleDeleteProduct(product.Id)}
//                       className="text-red-600 hover:text-red-900 ms-4"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   ) : (
//                     <button
//                       onClick={() => handleEditClick1(product)}
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
//               Edit Purchase Asset
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

//       {isModalOpen2 && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">
//               Edit Purchase Asset
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

//       {/* Add Modal */}
//       {isModalOpen1 && (
//         <div className="fixed inset-0 top-12 z-10 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">
//               Add Purchase Asset
//             </h2>

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

// export default AssetsPurchaseTable;

import { motion } from "framer-motion";
import { Edit, Notebook, Plus, ShoppingBasket, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import {
  useDeleteAssetsPurchaseMutation,
  useGetAllAssetsPurchaseQuery,
  useGetAllAssetsPurchaseWithoutQueryQuery,
  useInsertAssetsPurchaseMutation,
  useUpdateAssetsPurchaseMutation,
} from "../../features/assetsPurchase/assetsPurchase";

const AssetsPurchaseTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [currentProduct, setCurrentProduct] = useState(null);

  const [createProduct, setCreateProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [products, setProducts] = useState([]);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // store selected name
  const [name, setName] = useState("");

  // ✅ Per-page user selectable (EmployeeTable like)
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);

  // All products for select
  const [productsData, setProductsData] = useState([]);

  const {
    data: data2,
    isLoading: isLoading2,
    isError: isError2,
    error: error2,
  } = useGetAllAssetsPurchaseWithoutQueryQuery();

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
  }, [startDate, endDate, name, itemsPerPage]);

  // startDate > endDate হলে endDate ঠিক করে দেবে
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  // Query args
  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      name: name || undefined,
    };

    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "")
        delete args[k];
    });

    return args;
  }, [currentPage, itemsPerPage, startDate, endDate, name]);

  const { data, isLoading, isError, error, refetch } =
    useGetAllAssetsPurchaseQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching product data", error);
    } else if (!isLoading && data) {
      setProducts(data.data || []);
      setTotalPages(Math.ceil((data?.meta?.count || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error, currentPage, itemsPerPage]);

  // Modals
  const handleModalClose = () => setIsModalOpen(false);
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => setIsModalOpen1(false);

  const [updateAssetsPurchase] = useUpdateAssetsPurchaseMutation();
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const handleModalClose2 = () => setIsModalOpen2(false);

  const handleEditClick1 = (product) => {
    setCurrentProduct({
      ...product,
      price: product.price ?? "",
      note: product.note ?? "",
      status: product.status ?? "",
      quantity: product.quantity ?? "",
      userId: userId,
    });
    setIsModalOpen2(true);
  };

  const handleUpdateProduct1 = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid item!");
    if (currentProduct?.note === "" || currentProduct?.note === null)
      return toast.error("Note is required!");

    try {
      const payload = {
        name: currentProduct.name.trim(),
        quantity: Number(currentProduct.quantity),
        price: Number(currentProduct.price),
        note: currentProduct.note,
        status: currentProduct.status,
        userId: userId,
      };

      const res = await updateAssetsPurchase({
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

  const handleEditClick = (product) => {
    setCurrentProduct({
      ...product,
      price: product.price ?? "",
      note: product.note ?? "",
      status: product.status ?? "",
      quantity: product.quantity ?? "",
      date: product.date ?? "",
      userId: userId,
    });
    setIsModalOpen(true);
  };

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
        note: currentProduct.note,
        status: currentProduct.status,
        date: currentProduct.date,
        userId: userId,
      };

      const res = await updateAssetsPurchase({
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

  // Insert
  const [insertAssetsPurchase] = useInsertAssetsPurchaseMutation();
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.name?.trim()) return toast.error("Name is required!");
    if (!createProduct.price) return toast.error("Price is required!");
    if (!createProduct.quantity) return toast.error("Quantity is required!");

    try {
      const payload = {
        name: createProduct.name.trim(),
        quantity: Number(createProduct.quantity),
        price: Number(createProduct.price),
        date: createProduct.date,
      };

      const res = await insertAssetsPurchase(payload).unwrap();
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

  // Delete
  const [deleteAssetsPurchase] = useDeleteAssetsPurchaseMutation();
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this product?");
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteAssetsPurchase(id).unwrap();
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
    setName("");
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
      Math.min(prev + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1)),
    );

  // Select options (light)
  const productOptions = useMemo(
    () =>
      (productsData || []).map((p) => ({
        value: p.name,
        label: p.name,
      })),
    [productsData],
  );

  // ✅ React-select styles (light like EmployeeTable)
  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        minHeight: 44,
        borderRadius: 12,
        borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0",
        boxShadow: state.isFocused
          ? "0 0 0 4px rgba(99, 102, 241, 0.15)"
          : "none",
        "&:hover": { borderColor: state.isFocused ? "#c7d2fe" : "#cbd5e1" },
      }),
      valueContainer: (base) => ({ ...base, padding: "0 12px" }),
      placeholder: (base) => ({ ...base, color: "#64748b" }),
      singleValue: (base) => ({ ...base, color: "#0f172a" }),
      menu: (base) => ({
        ...base,
        borderRadius: 12,
        overflow: "hidden",
        zIndex: 60,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "rgba(99, 102, 241, 0.12)"
          : state.isFocused
            ? "#f8fafc"
            : "#fff",
        color: "#0f172a",
      }),
    }),
    [],
  );

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Top actions */}
      <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition px-4 py-2 rounded-xl shadow-sm"
        >
          Add <Plus size={18} />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2">
          <div className="flex items-center gap-2 text-slate-700">
            <ShoppingBasket size={18} className="text-amber-500" />
            <span className="text-sm">Total Purchase</span>
          </div>

          <span className="text-slate-900 font-semibold tabular-nums">
            {isLoading ? "Loading..." : data?.meta?.countQuantity}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6 w-full justify-center mx-auto">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        <div className="flex items-center justify-center md:mt-0">
          <Select
            options={productOptions}
            value={productOptions.find((o) => o.value === name) || null}
            onChange={(selected) =>
              setName(selected?.value ? String(selected.value) : "")
            }
            placeholder="Select Assets"
            isClearable
            styles={selectStyles}
            className="w-full"
          />
        </div>

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

        <button
          className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 transition px-4 py-[10px] rounded-xl border border-slate-200"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Name",
                "Quantity",
                "Price",
                "Total Price",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {(products || []).map((product) => (
              <motion.tr
                key={product.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="hover:bg-slate-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                  {product.name}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(product.quantity || 0).toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(product.price || 0).toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(product.total || 0).toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                      product.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    {product.note && (
                      <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 transition"
                        title={product.note}
                      >
                        <Notebook size={18} className="text-slate-700" />
                      </button>
                    )}

                    <button
                      onClick={() => handleEditClick(product)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-indigo-50 transition"
                      title="Edit"
                    >
                      <Edit size={18} className="text-indigo-600" />
                    </button>

                    {/* {role === "superAdmin" || role === "admin" ? (
                      <button
                        onClick={() => handleDeleteProduct(product.Id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-rose-50 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-rose-600" />
                      </button>
                    ) : role === "inventor" && product.status === "Approved" ? (
                      <button
                        onClick={() => handleDeleteProduct(product.Id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-rose-50 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-rose-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick1(product)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-rose-50 transition"
                        title="Delete Request / Note"
                      >
                        <Trash2 size={18} className="text-rose-600" />
                      </button>
                    )} */}

                    {role === "superAdmin" || role === "admin" ? (
                      <button
                        onClick={() => handleDeleteProduct(product.Id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-rose-50 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-rose-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick1(product)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-rose-50 transition"
                        title="Delete Request / Note"
                      >
                        <Trash2 size={18} className="text-rose-600" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}

            {!isLoading && products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-6 text-center text-sm text-slate-600"
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

      {/* -------------------- Edit Modal -------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)] w-full md:w-2/3 lg:w-1/2 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Edit Purchase Asset
              </h2>
              <button
                type="button"
                onClick={handleModalClose}
                className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                title="Close"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Field
                label="Date:"
                type="date"
                value={currentProduct.date}
                onChange={(v) =>
                  setCurrentProduct({ ...currentProduct, date: v })
                }
                required
              />
              <Field
                label="Name:"
                value={currentProduct?.name || ""}
                onChange={(v) =>
                  setCurrentProduct({ ...currentProduct, name: v })
                }
              />

              <Field
                label="Quantity:"
                type="number"
                step="0.01"
                value={currentProduct?.quantity || ""}
                onChange={(v) =>
                  setCurrentProduct({ ...currentProduct, quantity: v })
                }
              />

              <Field
                label="Price:"
                type="number"
                step="0.01"
                value={currentProduct?.price || ""}
                onChange={(v) =>
                  setCurrentProduct({ ...currentProduct, price: v })
                }
              />

              {role === "superAdmin" ? (
                <div className="md:col-span-3">
                  <label className="block text-sm text-slate-700">Status</label>
                  <select
                    value={currentProduct?.status || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        status: e.target.value,
                      })
                    }
                    className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              ) : (
                <div className="md:col-span-3">
                  <label className="block text-sm text-slate-700">Note:</label>
                  <textarea
                    value={currentProduct?.note || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        note: e.target.value,
                      })
                    }
                    className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm"
                onClick={handleUpdateProduct}
              >
                Save
              </button>
              <button
                type="button"
                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
                onClick={handleModalClose}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* -------------------- "Delete" Modal (note/status update) -------------------- */}
      {isModalOpen2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)] w-full md:w-2/3 lg:w-1/2 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Delete Request / Note
              </h2>
              <button
                type="button"
                onClick={handleModalClose2}
                className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                title="Close"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4">
              {role === "superAdmin" ? (
                <div>
                  <label className="block text-sm text-slate-700">Status</label>
                  <select
                    value={currentProduct?.status || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        status: e.target.value,
                      })
                    }
                    className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-slate-700">Note:</label>
                  <textarea
                    value={currentProduct?.note || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        note: e.target.value,
                      })
                    }
                    className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm"
                onClick={handleUpdateProduct1}
              >
                Save
              </button>
              <button
                type="button"
                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
                onClick={handleModalClose2}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* -------------------- Add Modal -------------------- */}
      {isModalOpen1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)] w-full md:w-2/3 lg:w-1/2 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Add Purchase Asset
              </h2>
              <button
                type="button"
                onClick={handleModalClose1}
                className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                title="Close"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <Field
                  label="Date:"
                  type="date"
                  value={createProduct.date}
                  onChange={(v) =>
                    setCreateProduct({ ...createProduct, date: v })
                  }
                  required
                />

                <Field
                  label="Name:"
                  value={createProduct.name}
                  onChange={(v) =>
                    setCreateProduct({ ...createProduct, name: v })
                  }
                  required
                />

                <Field
                  label="Quantity:"
                  type="number"
                  step="0.01"
                  value={createProduct.quantity}
                  onChange={(v) =>
                    setCreateProduct({ ...createProduct, quantity: v })
                  }
                  required
                />

                <Field
                  label="Price:"
                  type="number"
                  step="0.01"
                  value={createProduct.price}
                  onChange={(v) =>
                    setCreateProduct({ ...createProduct, price: v })
                  }
                  required
                />
                <Field
                  label="Note:"
                  type="text"
                  value={createProduct.note}
                  onChange={(v) =>
                    setCreateProduct({ ...createProduct, note: v })
                  }
                  className="min-h-[90px] border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </div>

              <div className="md:col-span-3 mt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm"
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

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  step,
  readOnly,
  required,
}) => (
  <div>
    <label className="block text-sm text-slate-700">{label}</label>
    <input
      type={type}
      step={step}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      required={required}
      className={`border border-slate-200 rounded-xl p-3 w-full mt-1 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200 ${
        readOnly ? "text-slate-900 opacity-80" : "text-slate-900"
      }`}
    />
  </div>
);

export default AssetsPurchaseTable;
