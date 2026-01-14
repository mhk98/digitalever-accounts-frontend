// import { motion } from "framer-motion";
// import { Edit, Plus, Trash2 } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import {
//   useDeleteCashInOutMutation,
//   useGetAllCashInOutQuery,
//   useInsertCashInOutMutation,
//   useUpdateCashInOutMutation,
// } from "../../features/cashInOut/cashInOut";
// import { useParams } from "react-router-dom";

// import ReportMenu from "./ReportMenu";
// import ReportPreviewModal from "./ReportPreviewModal";

// import { generateCashInOutPdf } from "../../utils/report/generateCashInOutPdf";
// import { generateCashInOutXlsx } from "../../utils/report/generateCashInOutXlsx";
// import { useGetSingleBookDataByIdQuery } from "../../features/book/book";

// const BANKS = [
//   "Al Arafah",
//   "BRAC Bank",
//   "Bank Asia",
//   "City Bank",
//   "Dutch-Bangla Bank",
//   "Dhaka Bank",
//   "Eastern Bank",
//   "Islami Bank",
//   "Janata Bank",
//   "Mutual Trust Bank",
//   "One Bank",
//   "Prime Bank",
//   "Pubali Bank",
//   "Premier Bank",
//   "United Commercial Bank",
//   "Sonali Bank",
//   "Standard Chartered",
//   "Trust Bank",
// ];

// const CashInOutTable = () => {
//   const { id } = useParams(); // bookId

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalOpen1, setIsModalOpen1] = useState(false);
//   const [currentProduct, setCurrentProduct] = useState(null);

//   const [createProduct, setCreateProduct] = useState({
//     paymentMode: "",
//     paymentStatus: "",
//     remarks: "",
//     amount: "",
//     file: null,
//   });

//   const [products, setProducts] = useState([]);

//   // filters
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [filterPaymentMode, setFilterPaymentMode] = useState("");
//   const [filterPaymentStatus, setFilterPaymentStatus] = useState("");

//   const [currentPage, setCurrentPage] = useState(1);
//   const [startPage, setStartPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [pagesPerSet, setPagesPerSet] = useState(10);
//   const itemsPerPage = 10;

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
//   }, [startDate, endDate, filterPaymentMode, filterPaymentStatus]);

//   useEffect(() => {
//     if (startDate && endDate && startDate > endDate) setEndDate(startDate);
//   }, [startDate, endDate]);

//   // ✅ Bank না হলে bankName reset (Add)
//   useEffect(() => {
//     if (createProduct.paymentMode !== "Bank" && createProduct.bankName) {
//       setCreateProduct((p) => ({ ...p, bankName: "" }));
//     }
//   }, [createProduct.paymentMode]);

//   // ✅ Bank না হলে bankName reset (Edit)
//   useEffect(() => {
//     if (!currentProduct) return;
//     if (currentProduct.paymentMode !== "Bank" && currentProduct.bankName) {
//       setCurrentProduct((p) => ({ ...p, bankName: "" }));
//     }
//   }, [currentProduct?.paymentMode]);

//   const queryArgs = useMemo(() => {
//     const args = {
//       page: currentPage,
//       limit: itemsPerPage,
//       bookId: id,
//       startDate: startDate || undefined,
//       endDate: endDate || undefined,
//       paymentMode: filterPaymentMode || undefined,
//       paymentStatus: filterPaymentStatus || undefined,
//     };

//     Object.keys(args).forEach((k) => {
//       if (args[k] === undefined || args[k] === null || args[k] === "")
//         delete args[k];
//     });

//     return args;
//   }, [
//     currentPage,
//     itemsPerPage,
//     id,
//     startDate,
//     endDate,
//     filterPaymentMode,
//     filterPaymentStatus,
//   ]);

//   const shouldSkip = !id;

//   const { data, isLoading, isError, error, refetch } = useGetAllCashInOutQuery(
//     queryArgs,
//     { skip: shouldSkip }
//   );

//   useEffect(() => {
//     if (isError) console.error("Error:", error);
//     if (!isLoading && data) {
//       setProducts(data?.data ?? []);
//       setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
//     }
//   }, [data, isLoading, isError, error, itemsPerPage]);

//   // modals
//   const handleAddProduct = () => setIsModalOpen1(true);
//   const handleModalClose1 = () => setIsModalOpen1(false);

//   const handleEditClick = (rp) => {
//     setCurrentProduct({
//       ...rp,
//       amount: rp.amount ?? "",
//       bankName: rp.bankName ?? "",
//       file: null, // edit modal এ নতুন ফাইল না নিলে null
//     });
//     setIsModalOpen(true);
//   };

//   // insert
//   const [insertCashIn] = useInsertCashInOutMutation();
//   const handleCreateProduct = async (e) => {
//     e.preventDefault();

//     if (!createProduct.amount) return toast.error("Amount is required!");
//     if (!createProduct.paymentMode)
//       return toast.error("Payment Mode is required!");
//     if (!createProduct.paymentStatus)
//       return toast.error("Payment Status is required!");
//     if (createProduct.paymentMode === "Bank" && !createProduct.bankName)
//       return toast.error("Bank Name is required!");

//     try {
//       const formData = new FormData();
//       formData.append("paymentMode", createProduct.paymentMode);
//       formData.append("paymentStatus", createProduct.paymentStatus);
//       formData.append(
//         "bankName",
//         createProduct.paymentMode === "Bank" ? createProduct.bankName : ""
//       );
//       formData.append("remarks", createProduct.remarks?.trim() || "");
//       formData.append("amount", String(Number(createProduct.amount)));
//       formData.append("bookId", id);

//       if (createProduct.file) formData.append("file", createProduct.file);

//       const res = await insertCashIn(formData).unwrap();

//       if (res?.success) {
//         toast.success("Successfully created!");
//         setIsModalOpen1(false);
//         setCreateProduct({
//           paymentMode: "",
//           paymentStatus: "",
//           bankName: "",
//           remarks: "",
//           amount: "",
//           file: null,
//         });
//         refetch?.();
//       } else toast.error(res?.message || "Create failed!");
//     } catch (err) {
//       toast.error(err?.data?.message || "Create failed!");
//     }
//   };

//   // update
//   const [updateCashInOut] = useUpdateCashInOutMutation();
//   const handleUpdateProduct = async () => {
//     const rowId = currentProduct?.Id ?? currentProduct?.id;
//     if (!rowId) return toast.error("Invalid item!");
//     if (!currentProduct.amount) return toast.error("Amount is required!");
//     if (!currentProduct.paymentMode)
//       return toast.error("Payment Mode is required!");
//     if (!currentProduct.paymentStatus)
//       return toast.error("Payment Status is required!");
//     if (currentProduct.paymentMode === "Bank" && !currentProduct.bankName)
//       return toast.error("Bank Name is required!");

//     try {
//       const formData = new FormData();
//       formData.append("paymentMode", currentProduct.paymentMode);
//       formData.append("paymentStatus", currentProduct.paymentStatus);
//       formData.append(
//         "bankName",
//         currentProduct.paymentMode === "Bank" ? currentProduct.bankName : ""
//       );
//       formData.append("remarks", currentProduct.remarks?.trim() || "");
//       formData.append("amount", String(Number(currentProduct.amount)));
//       if (currentProduct.file) formData.append("file", currentProduct.file);

//       const res = await updateCashInOut({ id: rowId, data: formData }).unwrap();
//       if (res?.success) {
//         toast.success("Updated!");
//         setIsModalOpen(false);
//         refetch?.();
//       } else toast.error(res?.message || "Update failed!");
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   // delete (✅ FIX: currentProduct লাগবে না)
//   const [deleteCashInOut] = useDeleteCashInOutMutation();
//   const handleDeleteProduct = async (rowId) => {
//     if (!window.confirm("Do you want to delete this item?")) return;

//     try {
//       const res = await deleteCashInOut(rowId).unwrap();
//       if (res?.success) {
//         toast.success("Deleted!");
//         refetch?.();
//       } else toast.error(res?.message || "Delete failed!");
//     } catch (err) {
//       toast.error(err?.data?.message || "Delete failed!");
//     }
//   };

//   const clearFilters = () => {
//     setStartDate("");
//     setEndDate("");
//     setFilterPaymentMode("");
//     setFilterPaymentStatus("");
//   };

//   // pagination
//   const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     if (pageNumber < startPage) setStartPage(pageNumber);
//     else if (pageNumber > endPage) setStartPage(pageNumber - pagesPerSet + 1);
//   };

//   const handlePreviousSet = () =>
//     setStartPage((p) => Math.max(p - pagesPerSet, 1));
//   const handleNextSet = () =>
//     setStartPage((p) =>
//       Math.min(p + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1))
//     );

//   // book info (name for report header)
//   const { data: bookRes } = useGetSingleBookDataByIdQuery(id, {
//     skip: !id,
//   });
//   const bookName = bookRes?.data?.name || "";

//   console.log("bookName", bookName);

//   // report states
//   const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
//   const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
//   const [reportType, setReportType] = useState(""); // "pdf" | "sheet"
//   const [reportBlob, setReportBlob] = useState(null);
//   const [reportBlobUrl, setReportBlobUrl] = useState("");
//   const [reportLoading, setReportLoading] = useState(false);
//   const [sheetPreview, setSheetPreview] = useState({ header: [], rows: [] });

//   const closeReportPreview = () => {
//     setIsReportPreviewOpen(false);
//     setReportType("");
//     setReportBlob(null);
//     setSheetPreview({ header: [], rows: [] });
//     setReportLoading(false);

//     if (reportBlobUrl) {
//       URL.revokeObjectURL(reportBlobUrl);
//       setReportBlobUrl("");
//     }
//   };

//   const handleReportPdf = async () => {
//     try {
//       if (!products.length) return toast.error("No data found!");

//       setReportType("pdf");
//       setReportLoading(true);
//       setIsReportPreviewOpen(true);
//       setIsReportMenuOpen(false);

//       const blob = await generateCashInOutPdf({
//         products,
//         bookId: id,
//         bookName,
//       });

//       const url = URL.createObjectURL(blob);
//       setReportBlob(blob);
//       setReportBlobUrl(url);
//     } catch (e) {
//       toast.error("PDF report generate failed!");
//       closeReportPreview();
//     } finally {
//       setReportLoading(false);
//     }
//   };

//   // const handleReportSheet = async () => {
//   //   try {
//   //     if (!products.length) return toast.error("No data found!");

//   //     setReportType("sheet");
//   //     setReportLoading(true);
//   //     setIsReportPreviewOpen(true);
//   //     setIsReportMenuOpen(false);

//   //     const { blob, preview } = generateCashInOutXlsx({ products, bookId: id });
//   //     const url = URL.createObjectURL(blob);

//   //     setReportBlob(blob);
//   //     setReportBlobUrl(url);
//   //     setSheetPreview(preview);
//   //   } catch (e) {
//   //     toast.error("Sheet report generate failed!");
//   //     closeReportPreview();
//   //   } finally {
//   //     setReportLoading(false);
//   //   }
//   // };

//   const handleReportSheet = async () => {
//     try {
//       if (!products.length) return toast.error("No data found!");

//       setReportType("sheet");
//       setReportLoading(true);
//       setIsReportPreviewOpen(true);
//       setIsReportMenuOpen(false);

//       const { blob, preview } = generateCashInOutXlsx({
//         products,
//         bookId: id,
//         bookName, // ✅ এখানে পাঠাচ্ছি
//       });

//       const url = URL.createObjectURL(blob);

//       setReportBlob(blob);
//       setReportBlobUrl(url);
//       setSheetPreview(preview);
//     } catch (e) {
//       toast.error("Sheet report generate failed!");
//       closeReportPreview();
//     } finally {
//       setReportLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.2 }}
//     >
//       <div className="my-6 flex items-center justify-between">
//         <button
//           className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center"
//           onClick={handleAddProduct}
//         >
//           Add <Plus size={18} className="ms-2" />
//         </button>

//         <ReportMenu
//           isOpen={isReportMenuOpen}
//           setIsOpen={setIsReportMenuOpen}
//           onGoogleSheet={handleReportSheet}
//           onPdf={handleReportPdf}
//           disabled={isLoading || !id}
//         />
//       </div>

//       {/* Filters */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-6 w-full justify-center mx-auto">
//         <div className="flex items-center justify-center">
//           <label className="mr-2 text-sm text-white">Start:</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="border border-gray-300 rounded p-1 text-black bg-white"
//           />
//         </div>

//         <div className="flex items-center justify-center">
//           <label className="mr-2 text-sm text-white">End:</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="border border-gray-300 rounded p-1 text-black bg-white"
//           />
//         </div>

//         <div className="flex items-center justify-center">
//           <label className="mr-2 text-sm text-white">Payment Mode:</label>
//           <select
//             value={filterPaymentMode}
//             onChange={(e) => setFilterPaymentMode(e.target.value)}
//             className="border border-gray-300 rounded p-1 text-black bg-white w-full"
//           >
//             <option value="">All</option>
//             <option value="Cash">Cash</option>
//             <option value="Bkash">Bkash</option>
//             <option value="Petty Cash">Petty Cash</option>
//             <option value="Nagad">Nagad</option>
//             <option value="Rocket">Rocket</option>
//             <option value="Bank">Bank</option>
//             <option value="Card">Card</option>
//           </select>
//         </div>

//         {currentProduct.paymentMode === "Bank" && (
//           <div className="mt-4">
//             <label className="block text-sm text-white">Bank Name</label>
//             <select
//               value={currentProduct.bankName || ""}
//               onChange={(e) =>
//                 setCurrentProduct({
//                   ...currentProduct,
//                   bankName: e.target.value,
//                 })
//               }
//               className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//               required
//             >
//               <option value="">Select Bank</option>
//               {BANKS.map((b) => (
//                 <option key={b} value={b}>
//                   {b}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         <div className="flex items-center justify-center">
//           <label className="mr-2 text-sm text-white">Payment Status:</label>
//           <select
//             value={filterPaymentStatus}
//             onChange={(e) => setFilterPaymentStatus(e.target.value)}
//             className="border border-gray-300 rounded p-1 text-black bg-white w-full"
//           >
//             <option value="">All</option>
//             <option value="CashIn">CashIn</option>
//             <option value="CashOut">CashOut</option>
//           </select>
//         </div>

//         <button
//           className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto md:col-span-5"
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
//                 Document
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Payment Mode
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Payment Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Remarks
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Amount
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-gray-700">
//             {products.map((rp) => {
//               const rowId = rp.Id ?? rp.id;

//               const safePath = String(rp.file || "").replace(/\\/g, "/");
//               const fileUrl = safePath
//                 ? `http://localhost:5000/${safePath}`
//                 : "";
//               const ext = safePath.split(".").pop()?.toLowerCase();
//               const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(
//                 ext
//               );
//               const isPdf = ext === "pdf";

//               return (
//                 <motion.tr
//                   key={rowId}
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {!safePath ? (
//                       "-"
//                     ) : isImage ? (
//                       <a href={fileUrl} target="_blank" rel="noreferrer">
//                         <img
//                           src={fileUrl}
//                           alt="document"
//                           className="h-12 w-12 object-cover rounded border border-gray-600 hover:opacity-80"
//                           onError={(e) => {
//                             e.currentTarget.style.display = "none";
//                           }}
//                         />
//                       </a>
//                     ) : isPdf ? (
//                       <a
//                         href={fileUrl}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="px-3 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700"
//                       >
//                         View PDF
//                       </a>
//                     ) : (
//                       <a
//                         href={fileUrl}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="text-indigo-400 underline"
//                       >
//                         Open File
//                       </a>
//                     )}
//                   </td>

//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {rp.paymentMode || "-"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {rp.paymentStatus || "-"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {rp.remarks || "-"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {Number(rp.amount || 0).toFixed(2)}
//                   </td>

//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button
//                       onClick={() => handleEditClick(rp)}
//                       className="text-indigo-600 hover:text-indigo-900"
//                     >
//                       <Edit size={18} />
//                     </button>
//                     <button
//                       onClick={() => handleDeleteProduct(rowId)}
//                       className="text-red-600 hover:text-red-900 ms-4"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </td>
//                 </motion.tr>
//               );
//             })}

//             {!isLoading && products.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={7}
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
//       {isModalOpen && currentProduct && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">Edit</h2>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Payment Mode</label>
//               <select
//                 value={currentProduct.paymentMode}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     paymentMode: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                 required
//               >
//                 <option value="">Select Payment Mode</option>
//                 <option value="Cash">Cash</option>
//                 <option value="Bkash">Bkash</option>
//                 <option value="Petty Cash">Petty Cash</option>
//                 <option value="Nagad">Nagad</option>
//                 <option value="Rocket">Rocket</option>
//                 <option value="Bank">Bank</option>
//                 <option value="Card">Card</option>
//               </select>
//             </div>

//             {currentProduct.paymentMode === "Bank" && (
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Bank Name</label>
//                 <select
//                   value={currentProduct.bankName || ""}
//                   onChange={(e) =>
//                     setCurrentProduct({
//                       ...currentProduct,
//                       bankName: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                   required
//                 >
//                   <option value="">Select Bank</option>
//                   {BANKS.map((b) => (
//                     <option key={b} value={b}>
//                       {b}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             <div className="mt-4">
//               <label className="block text-sm text-white">Payment Status</label>
//               <select
//                 value={currentProduct.paymentStatus}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     paymentStatus: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                 required
//               >
//                 <option value="">Select Payment Status</option>
//                 <option value="CashIn">CashIn</option>
//                 <option value="CashOut">CashOut</option>
//               </select>
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Remarks</label>
//               <input
//                 type="text"
//                 value={currentProduct.remarks}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     remarks: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Amount:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct?.amount || ""}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     amount: e.target.value,
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
//                 onClick={() => setIsModalOpen(false)}
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
//               Add Cash In/Out
//             </h2>

//             <form onSubmit={handleCreateProduct}>
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Payment Mode</label>
//                 <select
//                   value={createProduct.paymentMode}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       paymentMode: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                   required
//                 >
//                   <option value="">Select Payment Mode</option>
//                   <option value="Cash">Cash</option>
//                   <option value="Bkash">Bkash</option>
//                   <option value="Petty Cash">Petty Cash</option>
//                   <option value="Nagad">Nagad</option>
//                   <option value="Rocket">Rocket</option>
//                   <option value="Bank">Bank</option>
//                   <option value="Card">Card</option>
//                 </select>
//               </div>

//               {createProduct.paymentMode === "Bank" && (
//                 <div className="mt-4">
//                   <label className="block text-sm text-white">Bank Name</label>
//                   <select
//                     value={createProduct.bankName}
//                     onChange={(e) =>
//                       setCreateProduct({
//                         ...createProduct,
//                         bankName: e.target.value,
//                       })
//                     }
//                     className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                     required
//                   >
//                     <option value="">Select Bank</option>
//                     {BANKS.map((b) => (
//                       <option key={b} value={b}>
//                         {b}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               <div className="mt-4">
//                 <label className="block text-sm text-white">
//                   Payment Status
//                 </label>
//                 <select
//                   value={createProduct.paymentStatus}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       paymentStatus: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                   required
//                 >
//                   <option value="">Select Payment Status</option>
//                   <option value="CashIn">CashIn</option>
//                   <option value="CashOut">CashOut</option>
//                 </select>
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Remarks</label>
//                 <input
//                   type="text"
//                   value={createProduct.remarks}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       remarks: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Amount</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.amount}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       amount: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">
//                   Upload Document
//                 </label>
//                 <input
//                   type="file"
//                   accept=".jpg,.jpeg,.png,.pdf"
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       file: e.target.files?.[0] || null,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                 />
//                 {createProduct.file && (
//                   <p className="mt-2 text-xs text-gray-300">
//                     Selected: {createProduct.file.name}
//                   </p>
//                 )}
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

//       <ReportPreviewModal
//         open={isReportPreviewOpen}
//         onClose={closeReportPreview}
//         type={reportType}
//         blob={reportBlob}
//         blobUrl={reportBlobUrl}
//         sheetPreview={sheetPreview}
//         loading={reportLoading}
//       />
//     </motion.div>
//   );
// };

// export default CashInOutTable;

import { motion } from "framer-motion";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  useDeleteCashInOutMutation,
  useGetAllCashInOutQuery,
  useInsertCashInOutMutation,
  useUpdateCashInOutMutation,
} from "../../features/cashInOut/cashInOut";
import { useParams } from "react-router-dom";

import ReportMenu from "./ReportMenu";
import ReportPreviewModal from "./ReportPreviewModal";

import { generateCashInOutPdf } from "../../utils/report/generateCashInOutPdf";
import { generateCashInOutXlsx } from "../../utils/report/generateCashInOutXlsx";
import { useGetSingleBookDataByIdQuery } from "../../features/book/book";

const BANKS = [
  "Al Arafah",
  "BRAC Bank",
  "Bank Asia",
  "City Bank",
  "Dutch-Bangla Bank",
  "Dhaka Bank",
  "Eastern Bank",
  "Islami Bank",
  "Janata Bank",
  "Mutual Trust Bank",
  "One Bank",
  "Prime Bank",
  "Pubali Bank",
  "Premier Bank",
  "United Commercial Bank",
  "Sonali Bank",
  "Standard Chartered",
  "Trust Bank",
];

const CashInOutTable = () => {
  const { id } = useParams(); // bookId

  const [isModalOpen, setIsModalOpen] = useState(false); // edit
  const [isModalOpen1, setIsModalOpen1] = useState(false); // add
  const [currentProduct, setCurrentProduct] = useState(null);

  const [createProduct, setCreateProduct] = useState({
    paymentMode: "",
    paymentStatus: "",
    bankName: "", // ✅ add
    remarks: "",
    amount: "",
    file: null,
  });

  const [products, setProducts] = useState([]);

  // filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterPaymentMode, setFilterPaymentMode] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);
  const itemsPerPage = 10;

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
  }, [startDate, endDate, filterPaymentMode, filterPaymentStatus]);

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ Bank না হলে bankName reset (Add)
  useEffect(() => {
    if (createProduct.paymentMode !== "Bank" && createProduct.bankName) {
      setCreateProduct((p) => ({ ...p, bankName: "" }));
    }
  }, [createProduct.paymentMode]);

  // ✅ Bank না হলে bankName reset (Edit)
  useEffect(() => {
    if (!currentProduct) return;
    if (currentProduct.paymentMode !== "Bank" && currentProduct.bankName) {
      setCurrentProduct((p) => ({ ...p, bankName: "" }));
    }
  }, [currentProduct?.paymentMode]);

  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      bookId: id,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      paymentMode: filterPaymentMode || undefined,
      paymentStatus: filterPaymentStatus || undefined,
    };

    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "")
        delete args[k];
    });

    return args;
  }, [
    currentPage,
    itemsPerPage,
    id,
    startDate,
    endDate,
    filterPaymentMode,
    filterPaymentStatus,
  ]);

  const shouldSkip = !id;

  const { data, isLoading, isError, error, refetch } = useGetAllCashInOutQuery(
    queryArgs,
    { skip: shouldSkip }
  );

  useEffect(() => {
    if (isError) console.error("Error:", error);
    if (!isLoading && data) {
      setProducts(data?.data ?? []);
      setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

  // modals
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => setIsModalOpen1(false);

  const handleEditClick = (rp) => {
    setCurrentProduct({
      ...rp,
      amount: rp.amount ?? "",
      bankName: rp.bankName ?? "", // ✅ add
      file: null,
    });
    setIsModalOpen(true);
  };

  // insert
  const [insertCashIn] = useInsertCashInOutMutation();
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.amount) return toast.error("Amount is required!");
    if (!createProduct.paymentMode)
      return toast.error("Payment Mode is required!");
    if (!createProduct.paymentStatus)
      return toast.error("Payment Status is required!");
    if (createProduct.paymentMode === "Bank" && !createProduct.bankName)
      return toast.error("Bank Name is required!");

    try {
      const formData = new FormData();
      formData.append("paymentMode", createProduct.paymentMode);
      formData.append("paymentStatus", createProduct.paymentStatus);
      formData.append(
        "bankName",
        createProduct.paymentMode === "Bank" ? createProduct.bankName : ""
      );
      formData.append("remarks", createProduct.remarks?.trim() || "");
      formData.append("amount", String(Number(createProduct.amount)));
      formData.append("bookId", id);

      if (createProduct.file) formData.append("file", createProduct.file);

      const res = await insertCashIn(formData).unwrap();

      if (res?.success) {
        toast.success("Successfully created!");
        setIsModalOpen1(false);
        setCreateProduct({
          paymentMode: "",
          paymentStatus: "",
          bankName: "",
          remarks: "",
          amount: "",
          file: null,
        });
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // update
  const [updateCashInOut] = useUpdateCashInOutMutation();
  const handleUpdateProduct = async () => {
    const rowId = currentProduct?.Id ?? currentProduct?.id;
    if (!rowId) return toast.error("Invalid item!");
    if (!currentProduct.amount) return toast.error("Amount is required!");
    if (!currentProduct.paymentMode)
      return toast.error("Payment Mode is required!");
    if (!currentProduct.paymentStatus)
      return toast.error("Payment Status is required!");
    if (currentProduct.paymentMode === "Bank" && !currentProduct.bankName)
      return toast.error("Bank Name is required!");

    try {
      const formData = new FormData();
      formData.append("paymentMode", currentProduct.paymentMode);
      formData.append("paymentStatus", currentProduct.paymentStatus);
      formData.append(
        "bankName",
        currentProduct.paymentMode === "Bank" ? currentProduct.bankName : ""
      );
      formData.append("remarks", currentProduct.remarks?.trim() || "");
      formData.append("amount", String(Number(currentProduct.amount)));
      if (currentProduct.file) formData.append("file", currentProduct.file);

      const res = await updateCashInOut({ id: rowId, data: formData }).unwrap();
      if (res?.success) {
        toast.success("Updated!");
        setIsModalOpen(false);
        setCurrentProduct(null);
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // delete
  const [deleteCashInOut] = useDeleteCashInOutMutation();
  const handleDeleteProduct = async (rowId) => {
    if (!window.confirm("Do you want to delete this item?")) return;

    try {
      const res = await deleteCashInOut(rowId).unwrap();
      if (res?.success) {
        toast.success("Deleted!");
        refetch?.();
      } else toast.error(res?.message || "Delete failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterPaymentMode("");
    setFilterPaymentStatus("");
  };

  // pagination
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

  // book info (name for report header)
  const { data: bookRes } = useGetSingleBookDataByIdQuery(id, {
    skip: !id,
  });
  const bookName = bookRes?.data?.name || "";

  // report states
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [reportType, setReportType] = useState(""); // "pdf" | "sheet"
  const [reportBlob, setReportBlob] = useState(null);
  const [reportBlobUrl, setReportBlobUrl] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [sheetPreview, setSheetPreview] = useState({ header: [], rows: [] });

  const closeReportPreview = () => {
    setIsReportPreviewOpen(false);
    setReportType("");
    setReportBlob(null);
    setSheetPreview({ header: [], rows: [] });
    setReportLoading(false);

    if (reportBlobUrl) {
      URL.revokeObjectURL(reportBlobUrl);
      setReportBlobUrl("");
    }
  };

  const handleReportPdf = async () => {
    try {
      if (!products.length) return toast.error("No data found!");

      setReportType("pdf");
      setReportLoading(true);
      setIsReportPreviewOpen(true);
      setIsReportMenuOpen(false);

      const blob = await generateCashInOutPdf({
        products,
        bookId: id,
        bookName,
      });

      const url = URL.createObjectURL(blob);
      setReportBlob(blob);
      setReportBlobUrl(url);
    } catch (e) {
      toast.error("PDF report generate failed!");
      closeReportPreview();
    } finally {
      setReportLoading(false);
    }
  };

  const handleReportSheet = async () => {
    try {
      if (!products.length) return toast.error("No data found!");

      setReportType("sheet");
      setReportLoading(true);
      setIsReportPreviewOpen(true);
      setIsReportMenuOpen(false);

      const { blob, preview } = generateCashInOutXlsx({
        products,
        bookId: id,
        bookName,
      });

      const url = URL.createObjectURL(blob);

      setReportBlob(blob);
      setReportBlobUrl(url);
      setSheetPreview(preview);
    } catch (e) {
      toast.error("Sheet report generate failed!");
      closeReportPreview();
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="my-6 flex items-center justify-between">
        <button
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center"
          onClick={handleAddProduct}
        >
          Add <Plus size={18} className="ms-2" />
        </button>

        <ReportMenu
          isOpen={isReportMenuOpen}
          setIsOpen={setIsReportMenuOpen}
          onGoogleSheet={handleReportSheet}
          onPdf={handleReportPdf}
          disabled={isLoading || !id}
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-6 w-full justify-center mx-auto">
        <div className="flex items-center justify-center">
          <label className="mr-2 text-sm text-white">Start:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded p-1 text-black bg-white"
          />
        </div>

        <div className="flex items-center justify-center">
          <label className="mr-2 text-sm text-white">End:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded p-1 text-black bg-white"
          />
        </div>

        <div className="flex items-center justify-center">
          <label className="mr-2 text-sm text-white">Payment Mode:</label>
          <select
            value={filterPaymentMode}
            onChange={(e) => setFilterPaymentMode(e.target.value)}
            className="border border-gray-300 rounded p-1 text-black bg-white w-full"
          >
            <option value="">All</option>
            <option value="Cash">Cash</option>
            <option value="Bkash">Bkash</option>
            <option value="Petty Cash">Petty Cash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Bank">Bank</option>
            <option value="Card">Card</option>
          </select>
        </div>

        <div className="flex items-center justify-center">
          <label className="mr-2 text-sm text-white">Payment Status:</label>
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="border border-gray-300 rounded p-1 text-black bg-white w-full"
          >
            <option value="">All</option>
            <option value="CashIn">CashIn</option>
            <option value="CashOut">CashOut</option>
          </select>
        </div>

        <button
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto md:col-span-5"
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
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Payment Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Bank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Payment Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {products.map((rp) => {
              const rowId = rp.Id ?? rp.id;

              const safePath = String(rp.file || "").replace(/\\/g, "/");
              const fileUrl = safePath
                ? `http://localhost:5000/${safePath}`
                : "";
              const ext = safePath.split(".").pop()?.toLowerCase();
              const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(
                ext
              );
              const isPdf = ext === "pdf";

              return (
                <motion.tr
                  key={rowId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {!safePath ? (
                      "-"
                    ) : isImage ? (
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        <img
                          src={fileUrl}
                          alt="document"
                          className="h-12 w-12 object-cover rounded border border-gray-600 hover:opacity-80"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </a>
                    ) : isPdf ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700"
                      >
                        View PDF
                      </a>
                    ) : (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 underline"
                      >
                        Open File
                      </a>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {rp.paymentMode || "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {rp.paymentMode === "Bank" ? rp.bankName || "-" : "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {rp.paymentStatus || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {rp.remarks || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {Number(rp.amount || 0).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(rp)}
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
      {isModalOpen && currentProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">Edit</h2>

            <div className="mt-4">
              <label className="block text-sm text-white">Payment Mode</label>
              <select
                value={currentProduct.paymentMode || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    paymentMode: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                required
              >
                <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Bkash">Bkash</option>
                <option value="Petty Cash">Petty Cash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Bank">Bank</option>
                <option value="Card">Card</option>
              </select>
            </div>

            {currentProduct.paymentMode === "Bank" && (
              <div className="mt-4">
                <label className="block text-sm text-white">Bank Name</label>
                <select
                  value={currentProduct.bankName || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      bankName: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                  required
                >
                  <option value="">Select Bank</option>
                  {BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentProduct.paymentMode === "Bank" && (
              <div className="mt-4">
                <label className="block text-sm text-white">Bank Account</label>
                <input
                  type="number"
                  value={currentProduct.bankAccount || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      bankAccount: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                  required
                />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm text-white">Payment Status</label>
              <select
                value={currentProduct.paymentStatus || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    paymentStatus: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                required
              >
                <option value="">Select Payment Status</option>
                <option value="CashIn">CashIn</option>
                <option value="CashOut">CashOut</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">Remarks</label>
              <input
                type="text"
                value={currentProduct.remarks || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    remarks: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">Amount:</label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.amount ?? ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    amount: e.target.value,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">
                Upload Document
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
              />
              {currentProduct.file && (
                <p className="mt-2 text-xs text-gray-300">
                  Selected: {currentProduct.file.name}
                </p>
              )}
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
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentProduct(null);
                }}
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
              Add Cash In/Out
            </h2>

            <form onSubmit={handleCreateProduct}>
              <div className="mt-4">
                <label className="block text-sm text-white">Payment Mode</label>
                <select
                  value={createProduct.paymentMode}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      paymentMode: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Bkash">Bkash</option>
                  <option value="Petty Cash">Petty Cash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank">Bank</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {createProduct.paymentMode === "Bank" && (
                <div className="mt-4">
                  <label className="block text-sm text-white">Bank Name</label>
                  <select
                    value={createProduct.bankName}
                    onChange={(e) =>
                      setCreateProduct({
                        ...createProduct,
                        bankName: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                    required
                  >
                    <option value="">Select Bank</option>
                    {BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {createProduct.paymentMode === "Bank" && (
                <div className="mt-4">
                  <label className="block text-sm text-white">
                    Bank Account
                  </label>
                  <input
                    type="number"
                    value={createProduct.bankAccount}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...createProduct,
                        bankAccount: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                    required
                  />
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm text-white">
                  Payment Status
                </label>
                <select
                  value={createProduct.paymentStatus}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      paymentStatus: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                  required
                >
                  <option value="">Select Payment Status</option>
                  <option value="CashIn">CashIn</option>
                  <option value="CashOut">CashOut</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-white">Remarks</label>
                <input
                  type="text"
                  value={createProduct.remarks}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      remarks: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-white">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct.amount}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      amount: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-white">
                  Upload Document
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                />
                {createProduct.file && (
                  <p className="mt-2 text-xs text-gray-300">
                    Selected: {createProduct.file.name}
                  </p>
                )}
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

      <ReportPreviewModal
        open={isReportPreviewOpen}
        onClose={closeReportPreview}
        type={reportType}
        blob={reportBlob}
        blobUrl={reportBlobUrl}
        sheetPreview={sheetPreview}
        loading={reportLoading}
      />
    </motion.div>
  );
};

export default CashInOutTable;
