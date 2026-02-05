// import { motion } from "framer-motion";
// import { Edit, Notebook, Plus, Trash2 } from "lucide-react";
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
// import {
//   useGetAllCategoryQuery,
//   useInsertCategoryMutation,
// } from "../../features/category/category";

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

// const STATIC_CATEGORIES = [
//   "Office Expense",
//   "Marketing",
//   "Salary",
//   "Transport",
//   "Utility Bill",
//   "Other",
// ];

// const CashInOutTable = () => {
//   const { id } = useParams(); // bookId

//   const [isModalOpen, setIsModalOpen] = useState(false); // edit
//   const [isModalOpen1, setIsModalOpen1] = useState(false); // add
//   const [isModalOpen2, setIsModalOpen2] = useState(false); // delete
//   const [currentProduct, setCurrentProduct] = useState(null);

//   const userId = localStorage.getItem("userId");

//   const [createProduct, setCreateProduct] = useState({
//     paymentMode: "",
//     paymentStatus: "",
//     bankName: "",
//     bankAccount: "",
//     note: "",
//     status: "",
//     categoryId: "",
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

//   // ✅ Category states
//   const [categories, setCategories] = useState([]);
//   const [isNewCategoryAdd, setIsNewCategoryAdd] = useState(false);
//   const [newCategoryNameAdd, setNewCategoryNameAdd] = useState("");
//   const role = localStorage.getItem("role");
//   const [isNewCategoryEdit, setIsNewCategoryEdit] = useState(false);
//   const [newCategoryNameEdit, setNewCategoryNameEdit] = useState("");

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

//   // ✅ Bank না হলে bank fields reset (Add)
//   useEffect(() => {
//     if (createProduct.paymentMode !== "Bank") {
//       if (createProduct.bankName || createProduct.bankAccount) {
//         setCreateProduct((p) => ({ ...p, bankName: "", bankAccount: "" }));
//       }
//     }
//   }, [createProduct.paymentMode]);

//   // ✅ Bank না হলে bank fields reset (Edit)
//   useEffect(() => {
//     if (!currentProduct) return;
//     if (currentProduct.paymentMode !== "Bank") {
//       if (currentProduct.bankName || currentProduct.bankAccount) {
//         setCurrentProduct((p) => ({ ...p, bankName: "", bankAccount: "" }));
//       }
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
//     { skip: shouldSkip },
//   );

//   useEffect(() => {
//     if (isError) console.error("Error:", error);
//     if (!isLoading && data) {
//       setProducts(data?.data ?? []);
//       setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
//     }
//   }, [data, isLoading, isError, error, itemsPerPage]);

//   // book info (name for report header)
//   const { data: bookRes } = useGetSingleBookDataByIdQuery(id, { skip: !id });
//   const bookName = bookRes?.data?.name || "";

//   // ✅ Category: fetch all
//   const {
//     data: categoryRes,
//     isLoading: categoryLoading,
//     isError: isCategoryError,
//     error: categoryError,
//   } = useGetAllCategoryQuery();

//   useEffect(() => {
//     if (isCategoryError) console.error("Category error:", categoryError);
//     if (!categoryLoading && categoryRes) {
//       setCategories(categoryRes?.data ?? []);
//     }
//   }, [categoryRes, categoryLoading, isCategoryError, categoryError]);

//   // ✅ Category options: static + api
//   const categoryOptions = useMemo(() => {
//     const staticOnes = STATIC_CATEGORIES.map((name) => ({
//       id: `static:${name}`,
//       name,
//       isStatic: true,
//     }));

//     const fromApi = (categories || []).map((c) => ({
//       id: String(c.Id ?? c.id ?? c._id),
//       name: c.name,
//       isStatic: false,
//     }));

//     // de-dup by name
//     const seen = new Set();
//     const merged = [...staticOnes, ...fromApi].filter((x) => {
//       const k = String(x.name || "")
//         .toLowerCase()
//         .trim();
//       if (!k) return false;
//       if (seen.has(k)) return false;
//       seen.add(k);
//       return true;
//     });

//     return merged;
//   }, [categories]);

//   console.log("categories", categories);

//   // ✅ Insert category mutation
//   const [insertCategory, { isLoading: isAddingCategory }] =
//     useInsertCategoryMutation();

//   const addCategoryByName = async (name) => {
//     const n = name.trim();
//     if (!n) {
//       toast.error("New category name is required!");
//       return null;
//     }

//     try {
//       const res = await insertCategory({ name: n }).unwrap();
//       if (res?.success) {
//         console.log("Category added!");
//         const created = res?.data;
//         const createdId = String(created?.Id ?? created?.id ?? created?._id);
//         return createdId;
//       }
//       toast.error(res?.message || "Category add failed!");
//       return null;
//     } catch (err) {
//       toast.error(err?.data?.message || "Category add failed!");
//       return null;
//     }
//   };

//   // modals
//   const handleAddProduct = () => setIsModalOpen1(true);
//   const handleModalClose1 = () => {
//     setIsModalOpen1(false);
//     setIsNewCategoryAdd(false);
//     setNewCategoryNameAdd("");
//   };

//   const handleEditClick = (rp) => {
//     setCurrentProduct({
//       ...rp,
//       paymentMode: rp.paymentMode ?? "",
//       paymentStatus: rp.paymentStatus ?? "",
//       amount: rp.amount ?? "",
//       bankName: rp.bankName ?? "",
//       bankAccount: rp.bankAccount ?? "",
//       note: rp.note ?? "",
//       status: rp.status ?? "",
//       userId: userId,
//       categoryId: String(
//         rp.categoryId ?? rp.category?.Id ?? rp.category?.id ?? "",
//       ),
//       file: null,
//     });
//     setIsNewCategoryEdit(false);
//     setNewCategoryNameEdit("");
//     setIsModalOpen(true);
//   };
//   const handleEditClick1 = (rp) => {
//     setCurrentProduct({
//       ...rp,
//       paymentMode: rp.paymentMode ?? "",
//       paymentStatus: rp.paymentStatus ?? "",
//       amount: rp.amount ?? "",
//       bankName: rp.bankName ?? "",
//       bankAccount: rp.bankAccount ?? "",
//       note: rp.note ?? "",
//       status: rp.status ?? "",
//       userId: userId,
//       categoryId: String(
//         rp.categoryId ?? rp.category?.Id ?? rp.category?.id ?? "",
//       ),
//       file: null,
//     });
//     setIsNewCategoryEdit(false);
//     setNewCategoryNameEdit("");
//     setIsModalOpen2(true);
//   };

//   // update
//   const [updateCashInOut] = useUpdateCashInOutMutation();

//   const handleUpdateProduct = async () => {
//     const rowId = currentProduct?.Id ?? currentProduct?.id;
//     if (!rowId) return toast.error("Invalid item!");

//     try {
//       let finalCategoryId = currentProduct.categoryId;

//       if (finalCategoryId?.startsWith("static:")) {
//         const name = finalCategoryId.replace("static:", "");
//         const createdId = await addCategoryByName(name);
//         if (!createdId) return;
//         finalCategoryId = createdId;
//       }

//       if (isNewCategoryEdit) {
//         const createdId = await addCategoryByName(newCategoryNameEdit);
//         if (!createdId) return;
//         finalCategoryId = createdId;
//       }

//       const formData = new FormData();
//       formData.append("paymentMode", currentProduct.paymentMode);
//       formData.append("paymentStatus", currentProduct.paymentStatus);
//       formData.append("note", currentProduct.note);
//       formData.append("status", currentProduct.status);
//       formData.append("userId", userId);
//       formData.append(
//         "bankName",
//         currentProduct.paymentMode === "Bank" ? currentProduct.bankName : "",
//       );
//       formData.append(
//         "bankAccount",
//         currentProduct.paymentMode === "Bank"
//           ? String(currentProduct.bankAccount)
//           : "",
//       );
//       formData.append("categoryId", String(finalCategoryId || ""));
//       formData.append("remarks", currentProduct.remarks?.trim() || "");
//       formData.append("amount", String(Number(currentProduct.amount)));
//       if (currentProduct.file) formData.append("file", currentProduct.file);

//       const res = await updateCashInOut({ id: rowId, data: formData }).unwrap();
//       if (res?.success) {
//         toast.success("Updated!");
//         setIsModalOpen(false);
//         setCurrentProduct(null);
//         setIsNewCategoryEdit(false);
//         setNewCategoryNameEdit("");
//         refetch?.();
//       } else toast.error(res?.message || "Update failed!");
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   const handleUpdateProduct1 = async () => {
//     const rowId = currentProduct?.Id ?? currentProduct?.id;
//     if (!rowId) return toast.error("Invalid item!");

//     try {
//       let finalCategoryId = currentProduct.categoryId;

//       if (finalCategoryId?.startsWith("static:")) {
//         const name = finalCategoryId.replace("static:", "");
//         const createdId = await addCategoryByName(name);
//         if (!createdId) return;
//         finalCategoryId = createdId;
//       }

//       if (isNewCategoryEdit) {
//         const createdId = await addCategoryByName(newCategoryNameEdit);
//         if (!createdId) return;
//         finalCategoryId = createdId;
//       }

//       const formData = new FormData();
//       formData.append("paymentMode", currentProduct.paymentMode);
//       formData.append("paymentStatus", currentProduct.paymentStatus);
//       formData.append("note", currentProduct.note);
//       formData.append("status", currentProduct.status);
//       formData.append("userId", userId);
//       formData.append(
//         "bankName",
//         currentProduct.paymentMode === "Bank" ? currentProduct.bankName : "",
//       );
//       formData.append(
//         "bankAccount",
//         currentProduct.paymentMode === "Bank"
//           ? String(currentProduct.bankAccount)
//           : "",
//       );
//       formData.append("categoryId", String(finalCategoryId || ""));
//       formData.append("remarks", currentProduct.remarks?.trim() || "");
//       formData.append("amount", String(Number(currentProduct.amount)));
//       if (currentProduct.file) formData.append("file", currentProduct.file);

//       const res = await updateCashInOut({ id: rowId, data: formData }).unwrap();
//       if (res?.success) {
//         toast.success("Updated!");
//         setIsModalOpen(false);
//         setCurrentProduct(null);
//         setIsNewCategoryEdit(false);
//         setNewCategoryNameEdit("");
//         refetch?.();
//       } else toast.error(res?.message || "Update failed!");
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
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

//     if (createProduct.paymentMode === "Bank") {
//       if (!createProduct.bankName) return toast.error("Bank Name is required!");
//       if (!createProduct.bankAccount)
//         return toast.error("Bank Account is required!");
//     }

//     if (!createProduct.categoryId && !isNewCategoryAdd) {
//       return toast.error("Category is required!");
//     }

//     try {
//       let finalCategoryId = createProduct.categoryId;

//       // ✅ If user selected a static category => create it via API first
//       if (finalCategoryId?.startsWith("static:")) {
//         const name = finalCategoryId.replace("static:", "");
//         const createdId = await addCategoryByName(name);
//         if (!createdId) return;
//         finalCategoryId = createdId;
//       }

//       // ✅ If user selected New Category => create it first
//       if (isNewCategoryAdd) {
//         const createdId = await addCategoryByName(newCategoryNameAdd);
//         if (!createdId) return;
//         finalCategoryId = createdId;
//       }

//       const formData = new FormData();
//       formData.append("paymentMode", createProduct.paymentMode);
//       formData.append("paymentStatus", createProduct.paymentStatus);
//       formData.append(
//         "bankName",
//         createProduct.paymentMode === "Bank" ? createProduct.bankName : "",
//       );
//       formData.append(
//         "bankAccount",
//         createProduct.paymentMode === "Bank"
//           ? String(createProduct.bankAccount)
//           : "",
//       );
//       formData.append("category", String(finalCategoryId || ""));
//       formData.append("remarks", createProduct.remarks?.trim() || "");
//       formData.append("amount", String(Number(createProduct.amount)));
//       formData.append("bookId", id);

//       if (createProduct.file) formData.append("file", createProduct.file);

//       const res = await insertCashIn(formData).unwrap();

//       if (res?.success) {
//         toast.success("Successfully created!");
//         setIsModalOpen1(false);
//         setIsNewCategoryAdd(false);
//         setNewCategoryNameAdd("");
//         setCreateProduct({
//           paymentMode: "",
//           paymentStatus: "",
//           bankName: "",
//           bankAccount: "",
//           categoryId: "",
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

//   // delete
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
//       Math.min(p + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1)),
//     );

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
//         bookName,
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
//       <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         {/* Left: Add button */}
//         <button
//           className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition w-full sm:w-auto"
//           onClick={handleAddProduct}
//           type="button"
//         >
//           Add <Plus size={18} className="ml-2" />
//         </button>

//         {/* Middle: Totals */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
//           <div className="rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3">
//             <p className="text-xs text-gray-400">Total CashIn</p>
//             <p className="mt-1 text-lg font-semibold text-white tabular-nums">
//               {isLoading ? "Loading..." : data?.meta?.totalCashIn}
//             </p>
//           </div>

//           <div className="rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3">
//             <p className="text-xs text-gray-400">Total CashOut</p>
//             <p className="mt-1 text-lg font-semibold text-white tabular-nums">
//               {isLoading ? "Loading..." : data?.meta?.totalCashOut}
//             </p>
//           </div>

//           <div className="rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3">
//             <p className="text-xs text-gray-400">Net</p>
//             <p className="mt-1 text-lg font-semibold text-white tabular-nums">
//               {isLoading ? "Loading..." : data?.meta?.netBalance}
//             </p>
//           </div>
//         </div>

//         {/* Right: Report menu */}
//         <div className="flex justify-end">
//           <ReportMenu
//             isOpen={isReportMenuOpen}
//             setIsOpen={setIsReportMenuOpen}
//             onGoogleSheet={handleReportSheet}
//             onPdf={handleReportPdf}
//             disabled={isLoading || !id}
//           />
//         </div>
//       </div>

//       {/* Filters */}
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

//         <div className="flex flex-col">
//           <label className="text-sm text-gray-400 mb-1">Payment Mode:</label>
//           <select
//             value={filterPaymentMode}
//             onChange={(e) => setFilterPaymentMode(e.target.value)}
//             className="border py-2 border-gray-300 rounded p-1 text-black bg-white w-full"
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

//         <div className="flex flex-col">
//           <label className="text-sm text-gray-400 mb-1">Payment Status:</label>
//           <select
//             value={filterPaymentStatus}
//             onChange={(e) => setFilterPaymentStatus(e.target.value)}
//             className="border py-2 border-gray-300 rounded p-1 text-black bg-white w-full"
//           >
//             <option value="">All</option>
//             <option value="CashIn">CashIn</option>
//             <option value="CashOut">CashOut</option>
//           </select>
//         </div>

//         <button
//           className="flex items-center mt-6 bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto md:col-span-5"
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
//                 Bank
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
//                 Status
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
//                 ? ` http://localhost:5000/${safePath}`
//                 : "";
//               const ext = safePath.split(".").pop()?.toLowerCase();
//               const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(
//                 ext,
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
//                     {rp.paymentMode === "Bank" ? rp.bankName || "-" : "-"}
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

//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {rp.status}
//                   </td>

//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     {rp.note && (
//                       <button
//                         className="text-white-600 hover:text-white-900"
//                         title={rp.note}
//                       >
//                         <Notebook size={18} />
//                       </button>
//                     )}
//                     <button
//                       onClick={() => handleEditClick(rp)}
//                       className="text-indigo-600 hover:text-indigo-900"
//                     >
//                       <Edit size={18} />
//                     </button>

//                     {role === "superAdmin" ||
//                     role === "admin" ||
//                     rp.status === "Approved" ? (
//                       <button
//                         onClick={() => handleDeleteProduct(rp.Id)}
//                         className="text-red-600 hover:text-red-900 ms-4"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     ) : (
//                       <button
//                         onClick={() => handleEditClick1(rp)}
//                         className="text-red-600 hover:text-red-900 ms-4"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     )}
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

//       {/* ✅ Edit Modal */}
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
//                 value={currentProduct.paymentMode || ""}
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
//               <>
//                 <div className="mt-4">
//                   <label className="block text-sm text-white">Bank Name</label>
//                   <select
//                     value={currentProduct.bankName || ""}
//                     onChange={(e) =>
//                       setCurrentProduct({
//                         ...currentProduct,
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

//                 <div className="mt-4">
//                   <label className="block text-sm text-white">
//                     Bank Account
//                   </label>
//                   <input
//                     type="text"
//                     value={currentProduct.bankAccount || ""}
//                     onChange={(e) =>
//                       setCurrentProduct({
//                         ...currentProduct,
//                         bankAccount: e.target.value,
//                       })
//                     }
//                     className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                     required
//                   />
//                 </div>
//               </>
//             )}

//             {/* ✅ Category (Edit) */}
//             <div className="mt-4">
//               <label className="block text-sm text-white">Category</label>
//               <select
//                 value={
//                   isNewCategoryEdit
//                     ? "__new__"
//                     : currentProduct.categoryId || ""
//                 }
//                 onChange={(e) => {
//                   const v = e.target.value;

//                   if (v === "__new__") {
//                     setIsNewCategoryEdit(true);
//                     setCurrentProduct((p) => ({ ...p, categoryId: "" }));
//                     return;
//                   }

//                   setIsNewCategoryEdit(false);
//                   setNewCategoryNameEdit("");
//                   setCurrentProduct((p) => ({ ...p, categoryId: v }));
//                 }}
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                 required
//               >
//                 <option value="">Select Category</option>

//                 {categoryOptions.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}

//                 <option value="__new__">+ New Category</option>
//               </select>

//               {isNewCategoryEdit && (
//                 <div className="mt-3 flex gap-2">
//                   <input
//                     type="text"
//                     value={newCategoryNameEdit}
//                     onChange={(e) => setNewCategoryNameEdit(e.target.value)}
//                     placeholder="Write new category name"
//                     className="border border-gray-300 rounded p-2 w-full text-white bg-transparent"
//                   />
//                   <button
//                     type="button"
//                     onClick={async () => {
//                       const createdId =
//                         await addCategoryByName(newCategoryNameEdit);
//                       if (!createdId) return;
//                       setCurrentProduct((p) => ({
//                         ...p,
//                         categoryId: createdId,
//                       }));
//                       setIsNewCategoryEdit(false);
//                       setNewCategoryNameEdit("");
//                     }}
//                     disabled={isAddingCategory}
//                     className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded disabled:bg-gray-500"
//                   >
//                     {isAddingCategory ? "Adding..." : "Add"}
//                   </button>
//                 </div>
//               )}
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Payment Status</label>
//               <select
//                 value={currentProduct.paymentStatus || ""}
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
//                 value={currentProduct.remarks || ""}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     remarks: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Amount</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct?.amount ?? ""}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     amount: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 required
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
//             <div className="mt-4">
//               <label className="block text-sm text-white">
//                 Upload Document
//               </label>
//               <input
//                 type="file"
//                 accept=".jpg,.jpeg,.png,.pdf"
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     file: e.target.files?.[0] || null,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//               />
//               {currentProduct.file && (
//                 <p className="mt-2 text-xs text-gray-300">
//                   Selected: {currentProduct.file.name}
//                 </p>
//               )}
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
//                 onClick={() => {
//                   setIsModalOpen(false);
//                   setCurrentProduct(null);
//                   setIsNewCategoryEdit(false);
//                   setNewCategoryNameEdit("");
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//       {/* ✅ Edit Modal */}
//       {isModalOpen2 && currentProduct && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">Edit</h2>

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
//                 onClick={() => {
//                   setIsModalOpen2(false);
//                   setCurrentProduct(null);
//                   setIsNewCategoryEdit(false);
//                   setNewCategoryNameEdit("");
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* ✅ Add Modal */}
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
//                 <>
//                   <div className="mt-4">
//                     <label className="block text-sm text-white">
//                       Bank Name
//                     </label>
//                     <select
//                       value={createProduct.bankName}
//                       onChange={(e) =>
//                         setCreateProduct({
//                           ...createProduct,
//                           bankName: e.target.value,
//                         })
//                       }
//                       className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                       required
//                     >
//                       <option value="">Select Bank</option>
//                       {BANKS.map((b) => (
//                         <option key={b} value={b}>
//                           {b}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="mt-4">
//                     <label className="block text-sm text-white">
//                       Bank Account
//                     </label>
//                     <input
//                       type="text"
//                       value={createProduct.bankAccount}
//                       onChange={(e) =>
//                         setCreateProduct({
//                           ...createProduct,
//                           bankAccount: e.target.value,
//                         })
//                       }
//                       className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                       required
//                     />
//                   </div>
//                 </>
//               )}

//               {/* ✅ Category (Add) */}
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Category</label>
//                 <select
//                   value={
//                     isNewCategoryAdd
//                       ? "__new__"
//                       : createProduct.categoryId || ""
//                   }
//                   onChange={(e) => {
//                     const v = e.target.value;

//                     if (v === "__new__") {
//                       setIsNewCategoryAdd(true);
//                       setCreateProduct((p) => ({ ...p, categoryId: "" }));
//                       return;
//                     }

//                     setIsNewCategoryAdd(false);
//                     setNewCategoryNameAdd("");
//                     setCreateProduct((p) => ({ ...p, categoryId: v }));
//                   }}
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                   required
//                 >
//                   <option value="">Select Category</option>

//                   {categoryOptions.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name}
//                     </option>
//                   ))}

//                   <option value="__new__">+ New Category</option>
//                 </select>

//                 {isNewCategoryAdd && (
//                   <div className="mt-3 flex gap-2">
//                     <input
//                       type="text"
//                       value={newCategoryNameAdd}
//                       onChange={(e) => setNewCategoryNameAdd(e.target.value)}
//                       placeholder="Write new category name"
//                       className="border border-gray-300 rounded p-2 w-full text-white bg-transparent"
//                     />
//                     <button
//                       type="button"
//                       onClick={async () => {
//                         const createdId =
//                           await addCategoryByName(newCategoryNameAdd);
//                         if (!createdId) return;
//                         setCreateProduct((p) => ({
//                           ...p,
//                           categoryId: createdId,
//                         }));
//                         setIsNewCategoryAdd(false);
//                         setNewCategoryNameAdd("");
//                       }}
//                       disabled={isAddingCategory}
//                       className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded disabled:bg-gray-500"
//                     >
//                       {isAddingCategory ? "Adding..." : "Add"}
//                     </button>
//                   </div>
//                 )}
//               </div>

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
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
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
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
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
import { Edit, Notebook, Plus, Trash2 } from "lucide-react";
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
import {
  useGetAllCategoryQuery,
  useInsertCategoryMutation,
} from "../../features/category/category";

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

const STATIC_CATEGORIES = [
  "Office Expense",
  "Marketing",
  "Salary",
  "Transport",
  "Utility Bill",
  "Other",
];

const CashInOutTable = () => {
  const { id } = useParams(); // bookId

  const [isModalOpen, setIsModalOpen] = useState(false); // edit
  const [isModalOpen1, setIsModalOpen1] = useState(false); // add
  const [isModalOpen2, setIsModalOpen2] = useState(false); // delete/note
  const [currentProduct, setCurrentProduct] = useState(null);

  const userId = localStorage.getItem("userId");

  const [createProduct, setCreateProduct] = useState({
    paymentMode: "",
    paymentStatus: "",
    bankName: "",
    bankAccount: "",
    note: "",
    status: "",
    categoryId: "",
    remarks: "",
    amount: "",
    file: null,
    date: new Date().toISOString().slice(0, 10),
  });

  const [products, setProducts] = useState([]);

  // filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterPaymentMode, setFilterPaymentMode] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");

  // ✅ Category states
  const [categories, setCategories] = useState([]);
  const [isNewCategoryAdd, setIsNewCategoryAdd] = useState(false);
  const [newCategoryNameAdd, setNewCategoryNameAdd] = useState("");
  const role = localStorage.getItem("role");
  const [isNewCategoryEdit, setIsNewCategoryEdit] = useState(false);
  const [newCategoryNameEdit, setNewCategoryNameEdit] = useState("");

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
  }, [startDate, endDate, itemsPerPage]);

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

  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate, filterPaymentMode, filterPaymentStatus]);

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ Bank না হলে bank fields reset (Add)
  useEffect(() => {
    if (createProduct.paymentMode !== "Bank") {
      if (createProduct.bankName || createProduct.bankAccount) {
        setCreateProduct((p) => ({ ...p, bankName: "", bankAccount: "" }));
      }
    }
  }, [createProduct.paymentMode]);

  // ✅ Bank না হলে bank fields reset (Edit)
  useEffect(() => {
    if (!currentProduct) return;
    if (currentProduct.paymentMode !== "Bank") {
      if (currentProduct.bankName || currentProduct.bankAccount) {
        setCurrentProduct((p) => ({ ...p, bankName: "", bankAccount: "" }));
      }
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
    { skip: shouldSkip },
  );

  useEffect(() => {
    if (isError) console.error("Error:", error);
    if (!isLoading && data) {
      setProducts(data?.data ?? []);
      setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

  // book info (name for report header)
  const { data: bookRes } = useGetSingleBookDataByIdQuery(id, { skip: !id });
  const bookName = bookRes?.data?.name || "";

  // ✅ Category: fetch all
  const {
    data: categoryRes,
    isLoading: categoryLoading,
    isError: isCategoryError,
    error: categoryError,
  } = useGetAllCategoryQuery();

  useEffect(() => {
    if (isCategoryError) console.error("Category error:", categoryError);
    if (!categoryLoading && categoryRes) {
      setCategories(categoryRes?.data ?? []);
    }
  }, [categoryRes, categoryLoading, isCategoryError, categoryError]);

  // ✅ Category options: static + api
  const categoryOptions = useMemo(() => {
    const staticOnes = STATIC_CATEGORIES.map((name) => ({
      id: `static:${name}`,
      name,
      isStatic: true,
    }));

    const fromApi = (categories || []).map((c) => ({
      id: String(c.Id ?? c.id ?? c._id),
      name: c.name,
      isStatic: false,
    }));

    // de-dup by name
    const seen = new Set();
    const merged = [...staticOnes, ...fromApi].filter((x) => {
      const k = String(x.name || "")
        .toLowerCase()
        .trim();
      if (!k) return false;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return merged;
  }, [categories]);

  // ✅ Insert category mutation
  const [insertCategory, { isLoading: isAddingCategory }] =
    useInsertCategoryMutation();

  const addCategoryByName = async (name) => {
    const n = name.trim();
    if (!n) {
      toast.error("New category name is required!");
      return null;
    }

    try {
      const res = await insertCategory({ name: n }).unwrap();
      if (res?.success) {
        const created = res?.data;
        const createdId = String(created?.Id ?? created?.id ?? created?._id);
        return createdId;
      }
      toast.error(res?.message || "Category add failed!");
      return null;
    } catch (err) {
      toast.error(err?.data?.message || "Category add failed!");
      return null;
    }
  };

  // modals
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => {
    setIsModalOpen1(false);
    setIsNewCategoryAdd(false);
    setNewCategoryNameAdd("");
  };

  const handleEditClick = (rp) => {
    setCurrentProduct({
      ...rp,
      paymentMode: rp.paymentMode ?? "",
      paymentStatus: rp.paymentStatus ?? "",
      amount: rp.amount ?? "",
      bankName: rp.bankName ?? "",
      bankAccount: rp.bankAccount ?? "",
      note: rp.note ?? "",
      status: rp.status ?? "",
      date: rp.date ?? "",
      userId: userId,
      categoryId: String(
        rp.categoryId ?? rp.category?.Id ?? rp.category?.id ?? "",
      ),
      file: null,
    });
    setIsNewCategoryEdit(false);
    setNewCategoryNameEdit("");
    setIsModalOpen(true);
  };

  const handleEditClick1 = (rp) => {
    setCurrentProduct({
      ...rp,
      paymentMode: rp.paymentMode ?? "",
      paymentStatus: rp.paymentStatus ?? "",
      amount: rp.amount ?? "",
      bankName: rp.bankName ?? "",
      bankAccount: rp.bankAccount ?? "",
      note: rp.note ?? "",
      status: rp.status ?? "",
      userId: userId,
      categoryId: String(
        rp.categoryId ?? rp.category?.Id ?? rp.category?.id ?? "",
      ),
      file: null,
    });
    setIsNewCategoryEdit(false);
    setNewCategoryNameEdit("");
    setIsModalOpen2(true);
  };

  // update
  const [updateCashInOut] = useUpdateCashInOutMutation();

  const handleUpdateProduct = async () => {
    const rowId = currentProduct?.Id ?? currentProduct?.id;
    if (!rowId) return toast.error("Invalid item!");

    try {
      let finalCategoryId = currentProduct.categoryId;

      if (finalCategoryId?.startsWith("static:")) {
        const name = finalCategoryId.replace("static:", "");
        const createdId = await addCategoryByName(name);
        if (!createdId) return;
        finalCategoryId = createdId;
      }

      if (isNewCategoryEdit) {
        const createdId = await addCategoryByName(newCategoryNameEdit);
        if (!createdId) return;
        finalCategoryId = createdId;
      }

      const formData = new FormData();
      formData.append("paymentMode", currentProduct.paymentMode);
      formData.append("paymentStatus", currentProduct.paymentStatus);
      formData.append("note", currentProduct.note);
      formData.append("status", currentProduct.status);
      formData.append("date", currentProduct.date);
      formData.append("userId", userId);
      formData.append(
        "bankName",
        currentProduct.paymentMode === "Bank" ? currentProduct.bankName : "",
      );
      formData.append(
        "bankAccount",
        currentProduct.paymentMode === "Bank"
          ? String(currentProduct.bankAccount)
          : "",
      );
      formData.append("categoryId", String(finalCategoryId || ""));
      formData.append("remarks", currentProduct.remarks?.trim() || "");
      formData.append("amount", String(Number(currentProduct.amount)));
      if (currentProduct.file) formData.append("file", currentProduct.file);

      const res = await updateCashInOut({ id: rowId, data: formData }).unwrap();
      if (res?.success) {
        toast.success("Updated!");
        setIsModalOpen(false);
        setCurrentProduct(null);
        setIsNewCategoryEdit(false);
        setNewCategoryNameEdit("");
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleUpdateProduct1 = async () => {
    const rowId = currentProduct?.Id ?? currentProduct?.id;
    if (!rowId) return toast.error("Invalid item!");

    try {
      const formData = new FormData();
      formData.append("note", currentProduct.note);
      formData.append("status", currentProduct.status);
      formData.append("userId", userId);

      const res = await updateCashInOut({ id: rowId, data: formData }).unwrap();
      if (res?.success) {
        toast.success("Updated!");
        setIsModalOpen2(false);
        setCurrentProduct(null);
        setIsNewCategoryEdit(false);
        setNewCategoryNameEdit("");
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
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

    if (createProduct.paymentMode === "Bank") {
      if (!createProduct.bankName) return toast.error("Bank Name is required!");
      if (!createProduct.bankAccount)
        return toast.error("Bank Account is required!");
    }

    if (!createProduct.categoryId && !isNewCategoryAdd) {
      return toast.error("Category is required!");
    }

    try {
      let finalCategoryId = createProduct.categoryId;

      if (finalCategoryId?.startsWith("static:")) {
        const name = finalCategoryId.replace("static:", "");
        const createdId = await addCategoryByName(name);
        if (!createdId) return;
        finalCategoryId = createdId;
      }

      if (isNewCategoryAdd) {
        const createdId = await addCategoryByName(newCategoryNameAdd);
        if (!createdId) return;
        finalCategoryId = createdId;
      }

      const formData = new FormData();
      formData.append("paymentMode", createProduct.paymentMode);
      formData.append("paymentStatus", createProduct.paymentStatus);
      formData.append("date", createProduct.date);
      formData.append(
        "bankName",
        createProduct.paymentMode === "Bank" ? createProduct.bankName : "",
      );
      formData.append(
        "bankAccount",
        createProduct.paymentMode === "Bank"
          ? String(createProduct.bankAccount)
          : "",
      );
      formData.append("category", String(finalCategoryId || ""));
      formData.append("remarks", createProduct.remarks?.trim() || "");
      formData.append("amount", String(Number(createProduct.amount)));
      formData.append("bookId", id);
      if (createProduct.file) formData.append("file", createProduct.file);

      const res = await insertCashIn(formData).unwrap();

      if (res?.success) {
        toast.success("Successfully created!");
        setIsModalOpen1(false);
        setIsNewCategoryAdd(false);
        setNewCategoryNameAdd("");
        setCreateProduct({
          paymentMode: "",
          paymentStatus: "",
          bankName: "",
          bankAccount: "",
          categoryId: "",
          remarks: "",
          amount: "",
          date: "",
          file: null,
        });
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
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
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Add button */}
        <button
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition w-full sm:w-auto"
          onClick={handleAddProduct}
          type="button"
        >
          Add <Plus size={18} className="ml-2" />
        </button>

        {/* Middle: Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-600">Total CashIn</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 tabular-nums">
              {isLoading ? "Loading..." : data?.meta?.totalCashIn}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-600">Total CashOut</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 tabular-nums">
              {isLoading ? "Loading..." : data?.meta?.totalCashOut}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-600">Net</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 tabular-nums">
              {isLoading ? "Loading..." : data?.meta?.netBalance}
            </p>
          </div>
        </div>

        {/* Right: Report menu */}
        <div className="flex justify-end">
          <ReportMenu
            isOpen={isReportMenuOpen}
            setIsOpen={setIsReportMenuOpen}
            onGoogleSheet={handleReportSheet}
            onPdf={handleReportPdf}
            disabled={isLoading || !id}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-6 w-full">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Payment Mode</label>
          <select
            value={filterPaymentMode}
            onChange={(e) => setFilterPaymentMode(e.target.value)}
            className="h-11 border border-slate-200 rounded-xl px-3 text-slate-900 bg-white outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
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

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Payment Status</label>
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="h-11 border border-slate-200 rounded-xl px-3 text-slate-900 bg-white outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          >
            <option value="">All</option>
            <option value="CashIn">CashIn</option>
            <option value="CashOut">CashOut</option>
          </select>
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
        <div className="hidden md:block">
          <button
            className="h-11 md:col-span-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition rounded-xl px-4 text-sm font-semibold"
            onClick={clearFilters}
            type="button"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Payment Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Bank
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Payment Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Amount
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
            {products.map((rp) => {
              const rowId = rp.Id ?? rp.id;

              const safePath = String(rp.file || "").replace(/\\/g, "/");
              const fileUrl = safePath
                ? `http://localhost:5000/${safePath}`
                : "";
              const ext = safePath.split(".").pop()?.toLowerCase();
              const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(
                ext,
              );
              const isPdf = ext === "pdf";

              return (
                <motion.tr
                  key={rowId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {!safePath ? (
                      "-"
                    ) : isImage ? (
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        <img
                          src={fileUrl}
                          alt="document"
                          className="h-12 w-12 object-cover rounded-xl border border-slate-200 hover:opacity-80"
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
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs hover:bg-indigo-700"
                      >
                        View PDF
                      </a>
                    ) : (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 underline"
                      >
                        Open File
                      </a>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.paymentMode || "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.paymentMode === "Bank" ? rp.bankName || "-" : "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.paymentStatus || "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.remarks || "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 tabular-nums">
                    {Number(rp.amount || 0).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.status || "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      {rp.note && (
                        <button
                          className="text-slate-600 hover:text-slate-900"
                          title={rp.note}
                          type="button"
                        >
                          <Notebook size={18} />
                        </button>
                      )}

                      <button
                        onClick={() => handleEditClick(rp)}
                        className="text-indigo-600 hover:text-indigo-700"
                        type="button"
                      >
                        <Edit size={18} />
                      </button>

                      {role === "superAdmin" ||
                      role === "admin" ||
                      rp.status === "Approved" ? (
                        <button
                          onClick={() => handleDeleteProduct(rowId)}
                          className="text-red-600 hover:text-red-700"
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditClick1(rp)}
                          className="text-red-600 hover:text-red-700"
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}

            {!isLoading && products.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-sm text-slate-600"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination + Page Jump Dropdown */}
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

      {/* ✅ Edit Modal (Light) */}
      {isModalOpen && currentProduct && (
        <div className="fixed inset-0 flex items-center justify-center   p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl w-full md:w-1/3 lg:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">Edit</h2>
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
              <label className="block text-sm text-slate-600 mb-1">
                Payment Mode
              </label>
              <select
                value={currentProduct.paymentMode || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    paymentMode: e.target.value,
                  })
                }
                className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
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
              <>
                <div className="mt-4">
                  <label className="block text-sm text-slate-600 mb-1">
                    Bank Name
                  </label>
                  <select
                    value={currentProduct.bankName || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        bankName: e.target.value,
                      })
                    }
                    className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
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

                <div className="mt-4">
                  <label className="block text-sm text-slate-600 mb-1">
                    Bank Account
                  </label>
                  <input
                    type="text"
                    value={currentProduct.bankAccount || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        bankAccount: e.target.value,
                      })
                    }
                    className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                    required
                  />
                </div>
              </>
            )}

            {/* ✅ Category (Edit) */}
            <div className="mt-4">
              <label className="block text-sm text-slate-600 mb-1">
                Category
              </label>
              <select
                value={
                  isNewCategoryEdit
                    ? "__new__"
                    : currentProduct.categoryId || ""
                }
                onChange={(e) => {
                  const v = e.target.value;

                  if (v === "__new__") {
                    setIsNewCategoryEdit(true);
                    setCurrentProduct((p) => ({ ...p, categoryId: "" }));
                    return;
                  }

                  setIsNewCategoryEdit(false);
                  setNewCategoryNameEdit("");
                  setCurrentProduct((p) => ({ ...p, categoryId: v }));
                }}
                className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                required
              >
                <option value="">Select Category</option>

                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}

                <option value="__new__">+ New Category</option>
              </select>

              {isNewCategoryEdit && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newCategoryNameEdit}
                    onChange={(e) => setNewCategoryNameEdit(e.target.value)}
                    placeholder="Write new category name"
                    className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const createdId =
                        await addCategoryByName(newCategoryNameEdit);
                      if (!createdId) return;
                      setCurrentProduct((p) => ({
                        ...p,
                        categoryId: createdId,
                      }));
                      setIsNewCategoryEdit(false);
                      setNewCategoryNameEdit("");
                    }}
                    disabled={isAddingCategory}
                    className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:bg-slate-400"
                  >
                    {isAddingCategory ? "Adding..." : "Add"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-600 mb-1">
                Payment Status
              </label>
              <select
                value={currentProduct.paymentStatus || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    paymentStatus: e.target.value,
                  })
                }
                className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                required
              >
                <option value="">Select Payment Status</option>
                <option value="CashIn">CashIn</option>
                <option value="CashOut">CashOut</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-600 mb-1">
                Remarks
              </label>
              <input
                type="text"
                value={currentProduct.remarks || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    remarks: e.target.value,
                  })
                }
                className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-600 mb-1">
                Amount
              </label>
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
                className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                required
              />
            </div>

            {role === "superAdmin" ? (
              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
                  Status
                </label>
                <select
                  value={currentProduct.status || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      status: e.target.value,
                    })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
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
                <label className="block text-sm text-slate-600 mb-1">
                  Note
                </label>
                <textarea
                  value={currentProduct?.note || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      note: e.target.value,
                    })
                  }
                  className="min-h-[90px] border border-slate-200 rounded-xl p-3 w-full text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm text-slate-600 mb-1">
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
                className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white"
              />
              {currentProduct.file && (
                <p className="mt-2 text-xs text-slate-600">
                  Selected: {currentProduct.file.name}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                onClick={handleUpdateProduct}
                type="button"
              >
                Save
              </button>
              <button
                className="h-11 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold"
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentProduct(null);
                  setIsNewCategoryEdit(false);
                  setNewCategoryNameEdit("");
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ✅ Note/Status Modal (Light) */}
      {isModalOpen2 && currentProduct && (
        <div className="fixed inset-0 flex items-center justify-center   p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl w-full md:w-1/3 lg:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">Edit</h2>

            {role === "superAdmin" ? (
              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
                  Status
                </label>
                <select
                  value={currentProduct.status || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      status: e.target.value,
                    })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
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
                <label className="block text-sm text-slate-600 mb-1">
                  Note
                </label>
                <textarea
                  value={currentProduct?.note || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      note: e.target.value,
                    })
                  }
                  className="min-h-[110px] border border-slate-200 rounded-xl p-3 w-full text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                onClick={handleUpdateProduct1}
                type="button"
              >
                Save
              </button>
              <button
                className="h-11 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold"
                onClick={() => {
                  setIsModalOpen2(false);
                  setCurrentProduct(null);
                  setIsNewCategoryEdit(false);
                  setNewCategoryNameEdit("");
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ✅ Add Modal (Light) */}
      {isModalOpen1 && (
        <div className="fixed inset-0 z-10 flex items-center justify-center   p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl w-full md:w-1/3 lg:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Add Cash In/Out
            </h2>

            <form onSubmit={handleCreateProduct}>
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
                <label className="block text-sm text-slate-600 mb-1">
                  Payment Mode
                </label>
                <select
                  value={createProduct.paymentMode}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      paymentMode: e.target.value,
                    })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
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
                <>
                  <div className="mt-4">
                    <label className="block text-sm text-slate-600 mb-1">
                      Bank Name
                    </label>
                    <select
                      value={createProduct.bankName}
                      onChange={(e) =>
                        setCreateProduct({
                          ...createProduct,
                          bankName: e.target.value,
                        })
                      }
                      className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                                 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
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

                  <div className="mt-4">
                    <label className="block text-sm text-slate-600 mb-1">
                      Bank Account
                    </label>
                    <input
                      type="text"
                      value={createProduct.bankAccount}
                      onChange={(e) =>
                        setCreateProduct({
                          ...createProduct,
                          bankAccount: e.target.value,
                        })
                      }
                      className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                                 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                      required
                    />
                  </div>
                </>
              )}

              {/* ✅ Category (Add) */}
              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={
                    isNewCategoryAdd
                      ? "__new__"
                      : createProduct.categoryId || ""
                  }
                  onChange={(e) => {
                    const v = e.target.value;

                    if (v === "__new__") {
                      setIsNewCategoryAdd(true);
                      setCreateProduct((p) => ({ ...p, categoryId: "" }));
                      return;
                    }

                    setIsNewCategoryAdd(false);
                    setNewCategoryNameAdd("");
                    setCreateProduct((p) => ({ ...p, categoryId: v }));
                  }}
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Category</option>

                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}

                  <option value="__new__">+ New Category</option>
                </select>

                {isNewCategoryAdd && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newCategoryNameAdd}
                      onChange={(e) => setNewCategoryNameAdd(e.target.value)}
                      placeholder="Write new category name"
                      className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                                 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const createdId =
                          await addCategoryByName(newCategoryNameAdd);
                        if (!createdId) return;
                        setCreateProduct((p) => ({
                          ...p,
                          categoryId: createdId,
                        }));
                        setIsNewCategoryAdd(false);
                        setNewCategoryNameAdd("");
                      }}
                      disabled={isAddingCategory}
                      className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:bg-slate-400"
                    >
                      {isAddingCategory ? "Adding..." : "Add"}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
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
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Payment Status</option>
                  <option value="CashIn">CashIn</option>
                  <option value="CashOut">CashOut</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
                  Remarks
                </label>
                <input
                  type="text"
                  value={createProduct.remarks}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      remarks: e.target.value,
                    })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
                  Amount
                </label>
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
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
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
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white"
                />
                {createProduct.file && (
                  <p className="mt-2 text-xs text-slate-600">
                    Selected: {createProduct.file.name}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="submit"
                  className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="h-11 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold"
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
