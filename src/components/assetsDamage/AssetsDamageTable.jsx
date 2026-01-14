// import { motion } from "framer-motion";
// import { Edit, Plus, Trash2, Weight } from "lucide-react";
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

// const AssetsDamageTable = () => {
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

//   // ✅ Query args now uses productId (not name)
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
//     if (!createProduct.quantity) return toast.error(" Quantity is required!");

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

//   // ✅ Select options use Id as value, show name as label
//   const productOptions = (productsData || []).map((p) => ({
//     value: p.name,
//     label: p.name,
//   }));

//   const {
//     data: saleRes,
//     isLoading: saleLoading,
//     isError: saleError,
//     error: saleErrObj,
//   } = useGetAllAssetsSaleWithoutQueryQuery();

//   const sales = saleRes?.data || [];

//   // ✅ totals
//   const totalSaleAmount = useMemo(() => {
//     return sales.reduce((sum, item) => sum + Number(item?.total || 0), 0);
//   }, [sales]);

//   if (saleError) console.error("Purchase error:", saleErrObj);

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
//             <Weight size={18} className="text-amber-400" />
//             <span className="text-sm">Total Sales</span>
//           </div>

//           <span className="text-white font-semibold tabular-nums">
//             {saleLoading ? "Loading..." : totalSaleAmount.toFixed(2)}
//           </span>
//         </div>
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

//         {/* ✅ Filter by productId */}
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
//                 Total Price
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
//                   {product.quantity}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(product.price || 0).toFixed(2)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(product.total || 0).toFixed(2)}
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

// export default AssetsDamageTable;

// import { motion } from "framer-motion";
// import { Edit, Plus, ShoppingBasket, Trash2 } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import Select from "react-select";
// import { useGetAllAssetsPurchaseWithoutQueryQuery } from "../../features/assetsPurchase/assetsPurchase";
// import {
//   useDeleteAssetsSaleMutation,
//   useGetAllAssetsSaleQuery,
//   useInsertAssetsSaleMutation,
//   useUpdateAssetsSaleMutation,
// } from "../../features/assetsSale/assetsSale";

// const AssetsDamageTable = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalOpen1, setIsModalOpen1] = useState(false);

//   const [currentProduct, setCurrentProduct] = useState(null);

//   // ✅ Add form (INSERT) -> productId (Id)
//   const [createProduct, setCreateProduct] = useState({
//     Id: "",
//     name: "",
//     price: "",
//     quantity: "",
//   });

//   const [products, setProducts] = useState([]);

//   // ✅ Filters: start/end + product NAME
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [productName, setProductName] = useState(""); // ✅ filter by name

//   const [currentPage, setCurrentPage] = useState(1);
//   const [startPage, setStartPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [pagesPerSet, setPagesPerSet] = useState(10);
//   const [itemsPerPage] = useState(10);

//   // ✅ All products
//   const {
//     data: allProductsRes,
//     isLoading: isLoadingAllProducts,
//     isError: isErrorAllProducts,
//     error: errorAllProducts,
//   } = useGetAllAssetsPurchaseWithoutQueryQuery();

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
//     const pid = rp.Id;

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

//   // ✅ Responsive pagesPerSet
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

//   // ✅ Filters change হলে page reset
//   useEffect(() => {
//     setCurrentPage(1);
//     setStartPage(1);
//   }, [startDate, endDate, productName]);

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
//     useGetAllAssetsSaleQuery(queryArgs);

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

//   const handleEditClick = (rp) => {
//     setCurrentProduct({
//       ...rp,
//       productId: rp.productId ? String(rp.productId) : "",
//       quantity: rp.quantity ?? "",
//     });
//     setIsModalOpen(true);
//   };

//   const handleModalClose = () => setIsModalOpen(false);

//   // ✅ Insert
//   const [insertAssetsSale] = useInsertAssetsSaleMutation();

//   const handleCreateProduct = async (e) => {
//     e.preventDefault();

//     if (!createProduct.Id) return toast.error("Please select a product");
//     if (!createProduct.quantity || Number(createProduct.quantity) <= 0)
//       return toast.error("Please enter a valid quantity");

//     try {
//       const payload = {
//         Id: Number(createProduct.Id), // ✅ INSERT uses Id
//         name: Number(createProduct.name),
//         price: Number(createProduct.price),
//       };

//       const res = await insertAssetsSale(payload).unwrap();
//       if (res.success) {
//         toast.success("Successfully created received product");
//         setIsModalOpen1(false);
//         setCreateProduct({ productId: "", quantity: "", price: "", name: "" });
//         refetch?.();
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Create failed!");
//     }
//   };

//   // ✅ Update
//   const [updateAssetsSale] = useUpdateAssetsSaleMutation();

//   const handleUpdateProduct = async () => {
//     if (!currentProduct?.Id) return toast.error("Please select a product");

//     if (!currentProduct?.quantity || Number(currentProduct.quantity) <= 0)
//       return toast.error("Please enter a valid quantity");

//     try {
//       const updatedProduct = {
//         Id: Number(currentProduct.Id), // ✅ UPDATE uses Id
//         quantity: Number(currentProduct.quantity),
//         price: Number(currentProduct.price),
//         name: Number(currentProduct.name),
//       };

//       const res = await updateAssetsSale({
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

//   // ✅ Delete
//   const [deleteAssetsSale] = useDeleteAssetsSaleMutation();

//   const handleDeleteProduct = async (id) => {
//     const confirmDelete = window.confirm("Do you want to delete this product?");
//     if (!confirmDelete) return toast.info("Delete action was cancelled.");

//     try {
//       const res = await deleteAssetsSale(id).unwrap();
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

//   // ✅ Pagination
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

//   const {
//     data: receivedProductRes,
//     isLoading: receivedProductLoading,
//     isError: receivedProductError,
//     error: receivedProductErrObj,
//   } = useGetAllAssetsPurchaseWithoutQueryQuery();

//   const receivedProduct = receivedProductRes?.data || [];

//   // ✅ totals
//   const totalReceivedProductAmount = useMemo(() => {
//     return receivedProduct.reduce(
//       (sum, item) => sum + Number(item?.quantity || 0),
//       0
//     );
//   }, [receivedProduct]);

//   if (receivedProductError)
//     console.error("Purchase error:", receivedProductErrObj);

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
//             {receivedProductLoading
//               ? "Loading..."
//               : totalReceivedProductAmount.toFixed(2)}
//           </span>
//         </div>
//       </div>

//       {/* ✅ Filters (NAME based) */}
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

//         <div className="flex items-center justify-center">
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
//                 Product
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Quantity
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Price
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Total Price
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
//                   {resolveProductName(rp)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(rp.quantity || 0).toFixed(2)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(rp.price || 0).toFixed(2)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(rp.total || 0).toFixed(2)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   <button
//                     onClick={() => handleEditClick(rp)}
//                     className="text-indigo-600 hover:text-indigo-900"
//                   >
//                     <Edit size={18} />
//                   </button>
//                   <button
//                     onClick={() => handleDeleteProduct(rp.Id)}
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

//       {/* ✅ Edit Modal (UPDATE uses Id) */}
//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">
//               Edit Sale Property
//             </h2>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Product:</label>
//               <Select
//                 options={productDropdownOptions}
//                 value={
//                   productDropdownOptions.find(
//                     (o) => o.value === String(currentProduct?.productId)
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
//                 value={currentProduct.quantity}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     quantity: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Price:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.price}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     price: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
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

//       {/* ✅ Add Modal (INSERT uses Id) */}
//       {isModalOpen1 && (
//         <div className="fixed inset-0 top-12 z-10 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">
//               Add Sale Assets
//             </h2>

//             <form onSubmit={handleCreateProduct}>
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Product:</label>
//                 <Select
//                   options={productDropdownOptions}
//                   value={
//                     productDropdownOptions.find(
//                       (o) => o.value === String(createProduct.Id)
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

// export default AssetsDamageTable;

import { motion } from "framer-motion";
import { Edit, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

import { useGetAllAssetsPurchaseWithoutQueryQuery } from "../../features/assetsPurchase/assetsPurchase";
import {
  useDeleteAssetsSaleMutation,
  useGetAllAssetsSaleQuery,
  useInsertAssetsSaleMutation,
  useUpdateAssetsSaleMutation,
} from "../../features/assetsSale/assetsSale";
import { useGetAllAssetsDamageWithoutQueryQuery } from "../../features/assetsDamage/assetsDamage";

const AssetsDamageTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  const [currentProduct, setCurrentProduct] = useState(null);

  // ✅ INSERT form
  const [createProduct, setCreateProduct] = useState({
    productId: "",
    name: "",
    quantity: "",
    price: "",
  });

  const [products, setProducts] = useState([]);

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
    useGetAllAssetsSaleQuery(queryArgs);

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

  const handleEditClick = (row) => {
    setCurrentProduct({
      ...row,
      productId: String(row.productId ?? ""),
      quantity: row.quantity ?? "",
      price: row.price ?? "",
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => setIsModalOpen(false);

  // ✅ Insert
  const [insertAssetsSale] = useInsertAssetsSaleMutation();

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

      const res = await insertAssetsSale(payload).unwrap();

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
  const [updateAssetsSale] = useUpdateAssetsSaleMutation();

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
      };

      const res = await updateAssetsSale({ id: rowId, data: payload }).unwrap();

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
  const [deleteAssetsSale] = useDeleteAssetsSaleMutation();

  const handleDeleteProduct = async (rowId) => {
    if (!window.confirm("Do you want to delete this sale row?")) return;

    try {
      const res = await deleteAssetsSale(rowId).unwrap();
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
      Math.min(p + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1))
    );

  // ✅ totals (purchase total quantity)

  const {
    data: assetsDamageProductRes,
    isLoading: assetsDamageLoading,
    isError: assetsDamageError,
    error: assetsDamageErrObj,
  } = useGetAllAssetsDamageWithoutQueryQuery();

  const assetsDamageProduct = assetsDamageProductRes?.data || [];

  // ✅ totals
  const totalAssetsDamageAmount = useMemo(() => {
    return assetsDamageProduct.reduce(
      (sum, item) => sum + Number(item?.total || 0),
      0
    );
  }, [assetsDamageProduct]);

  if (assetsDamageError) console.error("Purchase error:", assetsDamageErrObj);

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
            <span className="text-sm">Total Purchase</span>
          </div>

          <span className="text-white font-semibold tabular-nums">
            {assetsDamageLoading
              ? "Loading..."
              : totalAssetsDamageAmount.toFixed(2)}
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

        <div className="flex items-center justify-center">
          <Select
            className="text-black"
            options={productDropdownOptions}
            value={
              filterProductName
                ? productDropdownOptions.find(
                    (o) => o.label === filterProductName
                  )
                : null
            }
            onChange={(selected) => setFilterProductName(selected?.label || "")}
            isClearable
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
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {products.map((row) => {
              const rowId = row.Id ?? row.id;
              const total = Number(
                row.total ?? Number(row.quantity || 0) * Number(row.price || 0)
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

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(row)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(rowId)}
                      className="text-red-600 hover:text-red-900 ms-4"
                    >
                      <Trash2 size={18} />
                    </button>
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
                        (o) => o.value === String(currentProduct.productId)
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
                          (o) => o.value === String(createProduct.productId)
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
    </motion.div>
  );
};

export default AssetsDamageTable;
