// import { motion } from "framer-motion";
// import { Edit, Plus, RotateCcw, Trash2 } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import Select from "react-select";

// import {
//   useDeletePurchaseReturnProductMutation,
//   useGetAllPurchaseReturnProductQuery,
//   useInsertPurchaseReturnProductMutation,
//   useUpdatePurchaseReturnProductMutation,
// } from "../../features/purchaseReturnProduct/purchaseReturnProduct";
// import { useGetAllReceivedProductWithoutQueryQuery } from "../../features/receivedProduct/receivedProduct";

// const PurchaseReturnProductTable = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalOpen1, setIsModalOpen1] = useState(false);

//   const [currentProduct, setCurrentProduct] = useState(null);

//   // ✅ Add form (INSERT) -> productId (Id)
//   const [createProduct, setCreateProduct] = useState({
//     productId: "",
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
//   } = useGetAllReceivedProductWithoutQueryQuery();

//   const productsData = allProductsRes?.data || [];

//   console.log("productsData", productsData);

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
//     useGetAllPurchaseReturnProductQuery(queryArgs);

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
//   const [insertPurchaseReturnProduct] =
//     useInsertPurchaseReturnProductMutation();

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

//       const res = await insertPurchaseReturnProduct(payload).unwrap();
//       if (res.success) {
//         toast.success("Successfully created received product");
//         setIsModalOpen1(false);
//         setCreateProduct({ productId: "", quantity: "" });
//         refetch?.();
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Create failed!");
//     }
//   };

//   // ✅ Update
//   const [updatePurchaseReturnProduct] =
//     useUpdatePurchaseReturnProductMutation();

//   const handleUpdateProduct = async () => {
//     if (!currentProduct?.productId)
//       return toast.error("Please select a product");

//     if (!currentProduct?.quantity || Number(currentProduct.quantity) <= 0)
//       return toast.error("Please enter a valid quantity");

//     try {
//       const updatedProduct = {
//         productId: Number(currentProduct.productId), // ✅ UPDATE uses Id
//         quantity: Number(currentProduct.quantity),
//       };

//       const res = await updatePurchaseReturnProduct({
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
//   const [deletePurchaseReturnProduct] =
//     useDeletePurchaseReturnProductMutation();

//   const handleDeleteProduct = async (id) => {
//     const confirmDelete = window.confirm("Do you want to delete this product?");
//     if (!confirmDelete) return toast.info("Delete action was cancelled.");

//     try {
//       const res = await deletePurchaseReturnProduct(id).unwrap();
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
//       Math.min(prev + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1)),
//     );

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
//             <RotateCcw size={18} className="text-amber-400" />
//             <span className="text-sm">Total Purchase Return</span>
//           </div>

//           <span className="text-white font-semibold tabular-nums">
//             {isLoading ? "Loading..." : data?.meta?.totalQuantity}
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
//                 Date
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Product
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Supplier
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
//                   {resolveProductName(rp)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(rp.quantity || 0).toFixed(2)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {rp.supplier}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(rp.purchase_price || 0).toFixed(2)}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(rp.sale_price || 0).toFixed(2)}
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
//               Edit Received Product
//             </h2>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Product:</label>
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
//               Add Purchase Return Product
//             </h2>

//             <form onSubmit={handleCreateProduct}>
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Product:</label>
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
//     </motion.div>
//   );
// };

// export default PurchaseReturnProductTable;

import { motion } from "framer-motion";
import { Edit, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

import {
  useDeletePurchaseReturnProductMutation,
  useGetAllPurchaseReturnProductQuery,
  useInsertPurchaseReturnProductMutation,
  useUpdatePurchaseReturnProductMutation,
} from "../../features/purchaseReturnProduct/purchaseReturnProduct";

import { useGetAllReceivedProductWithoutQueryQuery } from "../../features/receivedProduct/receivedProduct";

const PurchaseReturnProductTable = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditOpen1, setIsEditOpen1] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const role = localStorage.getItem("role");
  const [currentItem, setCurrentItem] = useState(null);

  // ✅ UI uses receivedId (ReceivedProduct.Id)
  const [createForm, setCreateForm] = useState({
    receivedId: "",
    quantity: "",
  });

  const [rows, setRows] = useState([]);

  // filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productName, setProductName] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);
  const itemsPerPage = 10;

  // ✅ all received products (for dropdown)
  const {
    data: receivedRes,
    isLoading: receivedLoading,
    isError: receivedError,
    error: receivedErrObj,
  } = useGetAllReceivedProductWithoutQueryQuery();

  const receivedData = receivedRes?.data || [];

  useEffect(() => {
    if (receivedError) console.error("Received fetch error:", receivedErrObj);
  }, [receivedError, receivedErrObj]);

  // ✅ dropdown options -> value = ReceivedProduct.Id
  const receivedDropdownOptions = useMemo(() => {
    return receivedData.map((r) => ({
      value: String(r.Id),
      label: r.name,
    }));
  }, [receivedData]);

  // ✅ responsive pagesPerSet
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setPagesPerSet(5);
      else if (window.innerWidth < 1024) setPagesPerSet(7);
      else setPagesPerSet(10);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate, productName]);

  // fix endDate if startDate > endDate
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ query
  const queryArgs = {
    page: currentPage,
    limit: itemsPerPage,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    name: productName || undefined,
  };

  const { data, isLoading, isError, error, refetch } =
    useGetAllPurchaseReturnProductQuery(queryArgs);

  useEffect(() => {
    if (isError) console.error("PurchaseReturn fetch error:", error);
    if (!isLoading && data) {
      setRows(data?.data ?? []);
      setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error]);

  // ✅ Table product name (simple)
  const resolveProductName = (rp) => {
    // If backend already sends name
    if (rp?.name) return rp.name;

    // rp.productId = Products.Id (FK)
    const productId = rp?.productId;
    if (!productId) return "N/A";

    // receivedData has productId = Products.Id
    const match = receivedData.find(
      (r) => Number(r.productId) === Number(productId),
    );
    return match?.name || "N/A";
  };

  // ✅ add/edit handlers
  const openAdd = () => setIsAddOpen(true);
  const closeAdd = () => setIsAddOpen(false);

  const openEdit = (rp) => {
    setCurrentItem({
      ...rp,
      receivedId: String(rp.receivedId ?? rp.productId ?? ""),
      quantity: rp.quantity ?? "",
      note: rp.note ?? "",
      status: rp.status ?? "",
    });
    setIsEditOpen(true);
  };
  const closeEdit = () => {
    setIsEditOpen(false);
    setCurrentItem(null);
  };

  const openEdit1 = (rp) => {
    setCurrentItem({
      ...rp,
      receivedId: String(rp.receivedId ?? rp.productId ?? ""),
      quantity: rp.quantity ?? "",
      note: rp.note ?? "",
      status: rp.status ?? "",
    });
    setIsEditOpen1(true);
  };
  const closeEdit1 = () => {
    setIsEditOpen1(false);
    setCurrentItem(null);
  };

  // mutations
  const [insertPurchaseReturn] = useInsertPurchaseReturnProductMutation();
  const [updatePurchaseReturn] = useUpdatePurchaseReturnProductMutation();
  const [deletePurchaseReturn] = useDeletePurchaseReturnProductMutation();

  // ✅ create (send receivedId)
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!createForm.receivedId) return toast.error("Please select a product");
    if (!createForm.quantity || Number(createForm.quantity) <= 0)
      return toast.error("Please enter valid quantity");

    try {
      const payload = {
        receivedId: Number(createForm.receivedId),
        quantity: Number(createForm.quantity),
      };

      const res = await insertPurchaseReturn(payload).unwrap();
      if (res?.success) {
        toast.success("Created!");
        setCreateForm({ receivedId: "", quantity: "" });
        closeAdd();
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // ✅ update (still send receivedId if backend supports, else remove receivedId)
  const handleUpdate = async () => {
    if (!currentItem?.Id) return toast.error("Invalid item");
    if (!currentItem?.receivedId) return toast.error("Please select a product");
    if (!currentItem.quantity || Number(currentItem.quantity) <= 0)
      return toast.error("Please enter valid quantity");

    try {
      const payload = {
        note: currentItem.note,
        status: currentItem.status,
        quantity: Number(currentItem.quantity),
        receivedId: Number(currentItem.receivedId),
      };

      const res = await updatePurchaseReturn({
        id: currentItem.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Updated!");
        closeEdit();
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleUpdate1 = async () => {
    if (!currentItem?.Id) return toast.error("Invalid item");
    if (!currentItem?.receivedId) return toast.error("Please select a product");
    if (!currentItem.quantity || Number(currentItem.quantity) <= 0)
      return toast.error("Please enter valid quantity");

    try {
      const payload = {
        note: currentItem.note,
        status: currentItem.status,
        quantity: Number(currentItem.quantity),
        receivedId: Number(currentItem.receivedId),
      };

      const res = await updatePurchaseReturn({
        id: currentItem.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Updated!");
        closeEdit();
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this item?")) return;

    try {
      const res = await deletePurchaseReturn(id).unwrap();
      if (res?.success) {
        toast.success("Deleted!");
        refetch?.();
      } else toast.error(res?.message || "Delete failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  // filters clear
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setProductName("");
  };

  // pagination helpers
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

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          Add <Plus size={18} className="ml-2" />
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-3 rounded-md border border-gray-700 bg-gray-800/60 px-4 py-2">
          <div className="flex items-center gap-2 text-gray-300">
            <RotateCcw size={18} className="text-amber-400" />
            <span className="text-sm">Total Purchase Return</span>
          </div>
          <span className="text-white font-semibold tabular-nums">
            {isLoading ? "Loading..." : (data?.meta?.totalQuantity ?? 0)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-6 w-full">
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

        <div className="flex items-center justify-center w-full">
          <Select
            options={receivedDropdownOptions}
            value={
              receivedDropdownOptions.find((o) => o.label === productName) ||
              null
            }
            onChange={(selected) => setProductName(selected?.label || "")}
            placeholder={receivedLoading ? "Loading..." : "Select Product"}
            isClearable
            className="text-black w-full"
            isDisabled={receivedLoading}
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
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Purchase Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Sale Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Note
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
            {rows.map((rp) => (
              <motion.tr
                key={rp.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {rp.createdAt
                    ? new Date(rp.createdAt).toLocaleDateString()
                    : "-"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {resolveProductName(rp)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {rp.supplier || "-"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(rp.quantity || 0).toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(rp.purchase_price || 0).toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(rp.sale_price || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {rp.note}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {rp.status}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openEdit(rp)}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    <Edit size={18} />
                  </button>

                  {role === "superAdmin" ||
                  role === "admin" ||
                  rp.status === "Approved" ? (
                    <button
                      onClick={() => handleDelete(rp.Id)}
                      className="text-red-400 hover:text-red-300 ms-4"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => openEdit1(rp)}
                      className="text-red-600 hover:text-red-900 ms-4"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
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
      {isEditOpen && currentItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-white">Edit Product</h2>

            <div className="mt-4">
              <label className="block text-sm text-white">Name</label>
              <Select
                options={receivedDropdownOptions}
                value={
                  receivedDropdownOptions.find(
                    (o) => o.value === String(currentItem.receivedId),
                  ) || null
                }
                onChange={(selected) =>
                  setCurrentItem((p) => ({
                    ...p,
                    receivedId: selected?.value || "",
                  }))
                }
                placeholder={receivedLoading ? "Loading..." : "Select Product"}
                isClearable
                className="text-black w-full"
                isDisabled={receivedLoading}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">Quantity</label>
              <input
                type="number"
                step="0.01"
                value={currentItem.quantity ?? ""}
                onChange={(e) =>
                  setCurrentItem((p) => ({ ...p, quantity: e.target.value }))
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
              />
            </div>

            {role === "superAdmin" || role === "admin" ? (
              <div className="mt-4">
                <label className="block text-sm text-white">Status</label>
                <select
                  value={currentItem.status || ""}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
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
                  value={currentItem?.note || ""}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
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
                onClick={handleUpdate}
              >
                Save
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                onClick={closeEdit}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {isEditOpen1 && currentItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-white">Edit Product</h2>

            <div className="mt-4">
              <label className="block text-sm text-white">Note:</label>
              <textarea
                type="text"
                value={currentItem?.note || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    note: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
                onClick={handleUpdate1}
              >
                Save
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                onClick={closeEdit1}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-white">Add Product</h2>

            <form onSubmit={handleCreate}>
              <div className="mt-4">
                <label className="block text-sm text-white">Name</label>
                <Select
                  options={receivedDropdownOptions}
                  value={
                    receivedDropdownOptions.find(
                      (o) => o.value === String(createForm.receivedId),
                    ) || null
                  }
                  onChange={(selected) =>
                    setCreateForm((p) => ({
                      ...p,
                      receivedId: selected?.value || "",
                    }))
                  }
                  placeholder={
                    receivedLoading ? "Loading..." : "Select Product"
                  }
                  isClearable
                  className="text-black w-full"
                  isDisabled={receivedLoading}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-white">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={createForm.quantity}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
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
                  onClick={closeAdd}
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

export default PurchaseReturnProductTable;
