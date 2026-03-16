// import { motion } from "framer-motion";
// import { ChevronLeft, ChevronRight, Edit, Notebook, Plus, ShoppingBasket, Trash2, X } from "lucide-react";
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
// import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";
// import { useGetAllWirehouseWithoutQueryQuery } from "../../features/wirehouse/wirehouse";
// import Modal from "../common/Modal";

// const ReceivedProductTable = () => {
//   const role = localStorage.getItem("role");
//   const userId = localStorage.getItem("userId");

//   const [isModalOpen, setIsModalOpen] = useState(false); // Edit modal
//   const [isModalOpen1, setIsModalOpen1] = useState(false); // Add modal
//   const [isModalOpen2, setIsModalOpen2] = useState(false); // Note / status modal
//   const [currentProduct, setCurrentProduct] = useState(null);

//   const [warehouse, setWarehouse] = useState("");
//   const [supplier, setSupplier] = useState("");

//   // ✅ NEW: Warranty (Drawer)
//   const [hasWarranty, setHasWarranty] = useState(false);
//   const [warrantyValue, setWarrantyValue] = useState("");
//   const [warrantyUnit, setWarrantyUnit] = useState("Day");

//   // ✅ Add form (INSERT) -> productId (Id)
//   const [createProduct, setCreateProduct] = useState({
//     warehouseId: "",
//     supplierId: "",
//     productId: "",
//     quantity: "",
//     purchase_price: "",
//     sale_price: "",
//     note: "",
//     date: new Date().toISOString().slice(0, 10),
//     hasWarranty: false,
//     warrantyValue: "",
//     warrantyUnit: "Day",
//   });

//   const [rows, setRows] = useState([]);

//   // ✅ Filters: start/end + product NAME
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [productName, setProductName] = useState("");

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

//   // ✅ startDate > endDate fix
//   useEffect(() => {
//     if (startDate && endDate && startDate > endDate) setEndDate(startDate);
//   }, [startDate, endDate]);

//   // ✅ All products (for dropdown + name mapping)
//   const {
//     data: allProductsRes,
//     isLoading: isLoadingAllProducts,
//     isError: isErrorAllProducts,
//     error: errorAllProducts,
//   } = useGetAllProductWithoutQueryQuery();

//   const productsData = allProductsRes?.data || [];

//   useEffect(() => {
//     if (isErrorAllProducts)
//       console.error("Error fetching products", errorAllProducts);
//   }, [isErrorAllProducts, errorAllProducts]);

//   // ✅ Dropdown options (value = Id, label = name)
//   const productDropdownOptions = useMemo(() => {
//     return (productsData || []).map((p) => ({
//       value: String(p.Id ?? p.id ?? p._id),
//       label: p.name,
//     }));
//   }, [productsData]);

//   // ✅ productId -> productName map
//   const productNameMap = useMemo(() => {
//     const m = new Map();
//     (productsData || []).forEach((p) => {
//       const key = String(p.Id ?? p.id ?? p._id);
//       m.set(key, p.name);
//     });
//     return m;
//   }, [productsData]);

//   // ✅ resolve name for table
//   const resolveProductName = (rp) => {
//     const pid =
//       rp.productId ??
//       rp.product_id ??
//       rp.ProductId ??
//       rp.product?.Id ??
//       rp.product?.id ??
//       rp.product?._id;

//     if (rp.productName) return rp.productName;
//     if (rp.product?.name) return rp.product?.name;

//     if (pid === null || pid === undefined || pid === "") return "N/A";

//     const byId = productNameMap.get(String(pid));
//     if (byId) return byId;

//     const pidText = String(pid);
//     const looksLikeName = (productsData || []).some((p) => p.name === pidText);
//     if (looksLikeName) return pidText;

//     return "N/A";
//   };

//   // ✅ Query args
//   const queryArgs = useMemo(() => {
//     const args = {
//       page: currentPage,
//       limit: itemsPerPage,
//       startDate: startDate || undefined,
//       endDate: endDate || undefined,
//       name: productName || undefined, // ✅ backend filter by name
//     };
//     Object.keys(args).forEach((k) => {
//       if (args[k] === undefined || args[k] === null || args[k] === "")
//         delete args[k];
//     });
//     return args;
//   }, [currentPage, itemsPerPage, startDate, endDate, productName]);

//   const { data, isLoading, isError, error, refetch } =
//     useGetAllReceivedProductQuery(queryArgs);

//   useEffect(() => {
//     if (isError) {
//       console.error("Error fetching received product data", error);
//       return;
//     }
//     if (!isLoading && data) {
//       setRows(data.data || []);
//       setTotalPages(
//         Math.max(1, Math.ceil((data?.meta?.count || 0) / itemsPerPage)),
//       );
//     }
//   }, [data, isLoading, isError, error, itemsPerPage]);

//   // ✅ Modals
//   const handleAddProduct = () => setIsModalOpen1(true);
//   const handleModalClose = () => setIsModalOpen(false);
//   const handleModalClose1 = () => setIsModalOpen1(false);
//   const handleModalClose2 = () => setIsModalOpen2(false);

//   const [updateReceivedProduct] = useUpdateReceivedProductMutation();

//   const handleEditClick = (rp) => {
//     setCurrentProduct({
//       ...rp,
//       productId: rp.productId ? String(rp.productId) : "",
//       supplierId: rp.supplierId ?? "",
//       warehouseId: rp.warehouseId ?? "",
//       quantity: rp.quantity ?? "",
//       purchase_price: rp.purchase_price ?? "",
//       sale_price: rp.sale_price ?? "",
//       duePayment: rp.duePayment ?? "",
//       supplier: rp.supplier ?? "",
//       date: rp.date ?? "",
//       note: rp.note ?? "",
//       warrantyValue: rp.warrantyValue ?? "",
//       warrantyUnit: rp.warrantyUnit ?? "Day",
//       hasWarranty: !!rp.warrantyValue,
//       userId,
//     });
//     setIsModalOpen(true);
//   };

//   const handleEditClick1 = (rp) => {
//     setCurrentProduct({
//       ...rp,
//       productId: rp.productId ? String(rp.productId) : "",
//       supplierId: rp.supplierId ?? "",
//       warehouseId: rp.warehouseId ?? "",
//       quantity: rp.quantity ?? "",
//       purchase_price: rp.purchase_price ?? "",
//       sale_price: rp.sale_price ?? "",
//       supplier: rp.supplier ?? "",
//       note: rp.note ?? "",
//       file: rp.file ?? null,

//       // ✅ Warranty preload
//       hasWarranty: !!rp.warrantyValue,
//       warrantyValue: rp.warrantyValue ?? "",
//       warrantyUnit: rp.warrantyUnit ?? "Day",

//       userId,
//     });

//     setIsModalOpen2(true);
//   };

//   const handleUpdateProduct = async () => {
//     try {
//       const fd = new FormData();
//       fd.append("productId", Number(currentProduct.productId) || "");
//       fd.append("supplierId", Number(currentProduct.supplierId) || "");
//       fd.append("warehouseId", Number(currentProduct.warehouseId) || "");
//       fd.append("quantity", Number(currentProduct.quantity) || 0);
//       fd.append("purchase_price", Number(currentProduct.purchase_price) || 0);
//       fd.append("sale_price", Number(currentProduct.sale_price) || 0);
//       fd.append("duePayment", Number(currentProduct.duePayment) || 0);
//       fd.append("date", currentProduct.date || 0);
//       fd.append("note", currentProduct.note || 0);
//       fd.append("status", currentProduct.status || 0);
//       fd.append("userId", Number(currentProduct.userId) || 0);
//       fd.append("actorRole", role);
//       fd.append("file", currentProduct.file);
//       fd.append("warrantyValue", currentProduct.warrantyValue)
//       fd.append("warrantyUnit", currentProduct.warrantyUnit)

//       const res = await updateReceivedProduct({
//         id: currentProduct.Id,
//         data: fd,
//       }).unwrap();

//       if (res?.success) {
//         toast.success("Successfully updated!");
//         setIsModalOpen(false);
//         refetch?.();
//       } else toast.error(res?.message || "Update failed!");
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   const handleUpdateProduct1 = async () => {
//     if (!currentProduct?.Id) return toast.error("Invalid item!");
//     if (currentProduct?.note === "" || currentProduct?.note === null)
//       return toast.error("Note is required!");

//     try {
//       const fd = new FormData();
//       fd.append("productId", Number(currentProduct.productId) || "");
//       fd.append("supplierId", Number(currentProduct.supplierId) || "");
//       fd.append("warehouseId", Number(currentProduct.warehouseId) || "");
//       fd.append("quantity", Number(currentProduct.quantity) || 0);
//       fd.append("purchase_price", Number(currentProduct.purchase_price) || 0);
//       fd.append("sale_price", Number(currentProduct.sale_price) || 0);
//       fd.append("duePayment", Number(currentProduct.duePayment) || 0);
//       fd.append("date", currentProduct.date || 0);
//       fd.append("note", currentProduct.note || 0);
//       fd.append("status", currentProduct.status || 0);
//       fd.append("userId", Number(currentProduct.userId) || 0);
//       fd.append("actorRole", role);
//       fd.append("file", currentProduct.file);
//       fd.append("warrantyValue", currentProduct.warrantyValue)
//       fd.append("warrantyUnit", currentProduct.warrantyUnit)

//       const res = await updateReceivedProduct({
//         id: currentProduct.Id,
//         data: fd,
//       }).unwrap();

//       if (res?.success) {
//         toast.success("Successfully updated product!");
//         setIsModalOpen2(false);
//         refetch?.();
//       } else toast.error(res?.message || "Update failed!");
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   // ✅ Insert
//   const [insertReceivedProduct] = useInsertReceivedProductMutation();

//   const handleCreateProduct = async (e) => {
//     e.preventDefault();

//     if (!createProduct.productId) return toast.error("Please select a product");
//     if (!createProduct.quantity || Number(createProduct.quantity) <= 0)
//       return toast.error("Please enter a valid quantity");

//     const fd = new FormData();
//     fd.append("productId", Number(createProduct.productId) || "");
//     fd.append("supplierId", Number(createProduct.supplierId) || "");
//     fd.append("warehouseId", Number(createProduct.warehouseId) || "");
//     fd.append("quantity", Number(createProduct.quantity) || 0);
//     fd.append("purchase_price", Number(createProduct.purchase_price) || 0);
//     fd.append("sale_price", Number(createProduct.sale_price) || 0);
//     fd.append("duePayment", Number(createProduct.duePayment) || 0);
//     fd.append("date", createProduct.date || 0);
//     fd.append("note", createProduct.note || 0);
//     fd.append("file", createProduct.file);
//     fd.append("warrantyValue", payload.warrantyValue)
//     fd.append("warrantyUnit", payload.warrantyUnit)

//     try {
//       const res = await insertReceivedProduct(fd).unwrap();
//       if (res?.success) {
//         toast.success("Successfully created received product");
//         setIsModalOpen1(false);
//         setCreateProduct({
//           warehouseId: "",
//           supplierId: "",
//           productId: "",
//           quantity: "",
//           note: "",
//           date: "",
//         });
//         refetch?.();
//       } else toast.error(res?.message || "Create failed!");
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
//       if (res?.success) {
//         toast.success("Product deleted successfully!");
//         refetch?.();
//       } else toast.error(res?.message || "Delete failed!");
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

//   // ✅ react-select light styles (so it looks good in light UI)
//   const selectStyles = {
//     control: (base, state) => ({
//       ...base,
//       minHeight: 44,
//       borderRadius: 14,
//       borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0", // indigo-200 / slate-200
//       boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
//       "&:hover": { borderColor: "#cbd5e1" },
//     }),
//     valueContainer: (base) => ({ ...base, padding: "0 12px" }),
//     placeholder: (base) => ({ ...base, color: "#64748b" }),
//     menu: (base) => ({ ...base, borderRadius: 14, overflow: "hidden" }),
//   };

//   // ✅ suppliers
//   const {
//     data: allSupplierRes,
//     isLoading: isLoadingSupplier,
//     isError: isErrorSupplier,
//     error: errorSupplier,
//   } = useGetAllSupplierWithoutQueryQuery();
//   const suppliers = allSupplierRes?.data || [];

//   useEffect(() => {
//     if (isErrorSupplier)
//       console.error("Error fetching suppliers", errorSupplier);
//   }, [isErrorSupplier, errorSupplier]);

//   // ✅ Dropdown options

//   const supplierOptions = useMemo(
//     () =>
//       (suppliers || []).map((w) => ({
//         value: w.Id,
//         label: w.name,
//       })),
//     [suppliers],
//   );

//   // ✅ warehouses
//   const {
//     data: allWarehousesRes,
//     isLoading: isLoadingWarehouse,
//     isError: isErrorWarehouse,
//     error: errorWarehouse,
//   } = useGetAllWirehouseWithoutQueryQuery();
//   const warehouses = allWarehousesRes?.data || [];

//   useEffect(() => {
//     if (isErrorWarehouse)
//       console.error("Error fetching warehouses", errorWarehouse);
//   }, [isErrorWarehouse, errorWarehouse]);

//   const warehouseOptions = useMemo(
//     () =>
//       (warehouses || []).map((w) => ({
//         value: w.Id,
//         label: w.name,
//       })),
//     [warehouses],
//   );

//   const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
//   const [noteContent, setNoteContent] = useState("");

//   const handleNoteClick = (note) => {
//     setNoteContent(note);
//     setIsNoteModalOpen(true); // Open the modal
//   };

//   const handleNoteModalClose = () => {
//     setIsNoteModalOpen(false); // Close the modal
//   };

//   return (
//     <motion.div
//       className="bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(15,23,42,0.04)] rounded-2xl p-4 sm:p-6 border border-slate-200 mb-8"
//       initial={{ opacity: 0, y: 16 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.25 }}
//     >
//       {/* Top Bar */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
//         <div>
//           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Purchase History</h2>
//           <p className="text-slate-500 text-sm mt-1 font-medium">Track and analyze all incoming product acquisitions</p>
//         </div>

//         <div className="flex flex-col sm:flex-row items-center gap-4">
//           <div className="inline-flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-5 py-2.5 rounded-2xl shadow-sm shadow-indigo-50">
//             <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
//               <ShoppingBasket size={18} />
//             </div>
//             <div>
//               <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Total Units</div>
//               <div className="text-base font-black text-indigo-900 tabular-nums leading-none">
//                 {isLoading ? "..." : (data?.meta?.totalQuantity ?? 0).toLocaleString()}
//               </div>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={handleAddProduct}
//             className="group relative inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-all px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 active:scale-95 overflow-hidden w-full sm:w-auto"
//           >
//             <Plus size={18} /> Add New Purchase
//           </button>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-10 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 items-end">
//         <div className="flex flex-col">
//           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">From</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium text-sm"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">To</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium text-sm"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Per Page</label>
//           <select
//             value={itemsPerPage}
//             onChange={(e) => setItemsPerPage(Number(e.target.value))}
//             className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold text-sm appearance-none cursor-pointer"
//           >
//             {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
//           </select>
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Product</label>
//           <Select
//             options={productDropdownOptions}
//             value={productDropdownOptions.find((o) => o.label === productName) || null}
//             onChange={(selected) => setProductName(selected?.label || "")}
//             placeholder="Search..."
//             isClearable
//             isDisabled={isLoadingAllProducts}
//             styles={selectStyles}
//           />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Warehouse</label>
//           <Select
//             options={warehouseOptions}
//             value={warehouseOptions.find((o) => String(o.value) === String(warehouse)) || null}
//             onChange={(selected) => setWarehouse(selected?.value || "")}
//             placeholder="Search..."
//             isClearable
//             styles={selectStyles}
//           />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Supplier</label>
//           <Select
//             options={supplierOptions}
//             value={supplierOptions.find((o) => String(o.value) === String(supplier)) || null}
//             onChange={(selected) => setSupplier(selected?.value || "")}
//             placeholder="Search..."
//             isClearable
//             styles={selectStyles}
//           />
//         </div>

//         <button
//           type="button"
//           className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 transition rounded-xl px-4 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 border border-slate-200"
//           onClick={clearFilters}
//         >
//           <X size={16} /> Reset
//         </button>
//       </div>

//       <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-slate-100">
//             <thead className="bg-slate-50/50">
//               <tr>
//                 <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Date</th>
//                 <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Warehouse</th>
//                 <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Supplier</th>
//                 <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Product Details</th>
//                 <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Financials</th>
//                 <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Status</th>
//                 <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 bg-white">
//               {rows.map((rp) => (
//                 <motion.tr
//                   key={rp.Id}
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ duration: 0.2 }}
//                   className="hover:bg-slate-50 group"
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-slate-900">{rp.date}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {/* <div className="flex flex-col gap-1"> */}
//                     <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-tighter">
//                       {rp?.supplier?.name || "No Supplier"}
//                     </span>
//                     {/* <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tighter">
//                         {rp?.warehouse?.name || "No Warehouse"}
//                       </span>
//                     </div> */}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">

//                     <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tighter">
//                       {rp?.warehouse?.name || "No Warehouse"}
//                     </span>

//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex flex-col">
//                       <div className="text-sm font-bold text-slate-900">{resolveProductName(rp)}</div>
//                       <div className="text-xs text-slate-500">Qty: {Number(rp.quantity || 0).toFixed(0)}</div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex flex-col gap-1">
//                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
//                         Total Buy: <span className="text-slate-900 border-b border-dotted border-slate-300">৳{Number(rp.purchase_price * rp.quantity).toLocaleString()}</span>
//                       </div>
//                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
//                         Total Sell: <span className="text-emerald-600">৳{Number(rp.sale_price * rp.quantity).toLocaleString()}</span>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${rp.status === "Approved"
//                         ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100"
//                         : rp.status === "Active"
//                           ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm shadow-blue-100"
//                           : "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100"
//                         }`}
//                     >
//                       {rp.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <button
//                         className="relative h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition shadow-sm"
//                         title="View Note"
//                         type="button"
//                         onClick={() => handleNoteClick(rp.note)}
//                       >
//                         <Notebook size={16} />
//                         {rp.note && (
//                           <span className="absolute -top-1 -right-1 flex h-3 w-3">
//                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//                             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
//                           </span>
//                         )}
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() => handleEditClick(rp)}
//                         className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition shadow-sm"
//                         title="Edit"
//                       >
//                         <Edit size={16} />
//                       </button>

//                       {role === "superAdmin" || role === "admin" ? (
//                         <button
//                           type="button"
//                           onClick={() => handleDeleteProduct(rp.Id)}
//                           className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition shadow-sm"
//                           title="Delete"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       ) : (
//                         <button
//                           type="button"
//                           onClick={() => handleEditClick1(rp)}
//                           className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition shadow-sm"
//                           title="Request Delete"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </motion.tr>
//               ))}

//               {!isLoading && rows.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={6}
//                     className="px-6 py-20 text-center text-sm text-slate-400 italic"
//                   >
//                     No purchase records found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-6 px-2">
//         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
//           Showing Page <span className="text-indigo-600">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
//         </p>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handlePreviousSet}
//             disabled={startPage === 1}
//             className="h-11 px-5 border border-slate-200 rounded-2xl bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 transition active:scale-95 flex items-center gap-2 shadow-sm"
//           >
//             <ChevronLeft size={16} /> Prev
//           </button>
//           <div className="flex items-center gap-1.5">
//             {[...Array(endPage - startPage + 1)].map((_, index) => {
//               const pageNum = startPage + index;
//               const active = pageNum === currentPage;
//               return (
//                 <button
//                   key={pageNum}
//                   onClick={() => handlePageChange(pageNum)}
//                   className={`h-11 w-11 rounded-2xl font-black text-sm transition-all active:scale-90 ${active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "bg-white text-slate-600 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600"
//                     }`}
//                 >
//                   {pageNum}
//                 </button>
//               );
//             })}
//           </div>
//           <button
//             onClick={handleNextSet}
//             disabled={endPage === totalPages}
//             className="h-11 px-5 border border-slate-200 rounded-2xl bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 transition active:scale-95 flex items-center gap-2 shadow-sm"
//           >
//             Next <ChevronRight size={16} />
//           </button>
//         </div>
//       </div>

//       {/* Note Preview Modal */}
//       <Modal
//         isOpen={isNoteModalOpen}
//         onClose={handleNoteModalClose}
//         title="Note Preview"
//       >
//         <div className="space-y-4">
//           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[120px]">
//             <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
//               {noteContent || "No note available."}
//             </p>
//           </div>
//           <div className="flex justify-end pt-2">
//             <button
//               onClick={handleNoteModalClose}
//               className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition shadow-sm active:scale-95"
//             >
//               Done
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Edit Purchase Modal */}
//       <Modal
//         isOpen={isModalOpen && !!currentProduct}
//         onClose={handleModalClose}
//         title="Edit Purchase"
//       >
//         <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
//           <div>
//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//               Select Product
//             </label>
//             <Select
//               options={productDropdownOptions}
//               value={productDropdownOptions.find(o => o.value === String(currentProduct?.productId)) || null}
//               onChange={(selected) => setCurrentProduct({ ...currentProduct, productId: selected?.value || "" })}
//               placeholder="Search product..."
//               isClearable
//               styles={selectStyles}
//               className="text-sm font-medium"
//               isDisabled={isLoadingAllProducts}
//             />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Purchase Date
//               </label>
//               <input
//                 type="date"
//                 value={currentProduct?.date || ""}
//                 onChange={(e) => setCurrentProduct(p => ({ ...p, date: e.target.value }))}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               />
//             </div>

//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Warehouse
//               </label>
//               <select
//                 value={currentProduct?.warehouseId || ""}
//                 onChange={(e) => setCurrentProduct({ ...currentProduct, warehouseId: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               >
//                 <option value="">Select Warehouse</option>
//                 {warehouses?.map(w => <option key={w.Id} value={w.Id}>{w.name}</option>)}
//               </select>
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//               Supplier
//             </label>
//             <select
//               value={currentProduct?.supplierId || ""}
//               onChange={(e) => setCurrentProduct({ ...currentProduct, supplierId: e.target.value })}
//               className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//             >
//               <option value="">Select Supplier</option>
//               {suppliers?.map(s => <option key={s.Id} value={s.Id}>{s.name}</option>)}
//             </select>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Quantity
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct?.quantity || ""}
//                 onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Due Payment
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct?.duePayment || ""}
//                 onChange={(e) => setCurrentProduct({ ...currentProduct, duePayment: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Purchase Price
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct?.purchase_price || ""}
//                 onChange={(e) => setCurrentProduct({ ...currentProduct, purchase_price: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Sale Price
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct?.sale_price || ""}
//                 onChange={(e) => setCurrentProduct({ ...currentProduct, sale_price: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               />
//             </div>
//           </div>

//           <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
//             <div className="flex items-center justify-between px-4 py-3">
//               <div>
//                 <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
//                   Warranty Coverage
//                 </span>
//                 <p className="text-[10px] font-bold text-slate-400">Enable if product has warranty</p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setHasWarranty((p) => !p);
//                   if (hasWarranty) {
//                     setWarrantyValue("");
//                     setWarrantyUnit("Day");
//                   }
//                 }}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${hasWarranty ? "bg-indigo-600" : "bg-slate-300"
//                   }`}
//               >
//                 <span className="sr-only">Toggle Warranty</span>
//                 <span
//                   className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${hasWarranty ? "translate-x-6" : "translate-x-1"
//                     }`}
//                 />
//               </button>
//             </div>

//             {hasWarranty && (
//               <div className="bg-white rounded-xl border border-slate-100 m-1 p-4 space-y-3 shadow-sm">
//                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</label>

//                 <div className="flex gap-2">
//                   <input
//                     type="number"
//                     min="1"
//                     value={warrantyValue}
//                     onChange={(e) => setWarrantyValue(e.target.value)}
//                     placeholder="30"
//                     className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none
//                          focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//                   />

//                   <select
//                     value={warrantyUnit}
//                     onChange={(e) => setWarrantyUnit(e.target.value)}
//                     className="h-11 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none
//                          focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition appearance-none cursor-pointer"
//                   >
//                     <option value="Day">Days</option>
//                     <option value="Month">Months</option>
//                     <option value="Year">Years</option>
//                   </select>
//                 </div>
//               </div>
//             )}
//           </div>

//           {(role === "superAdmin" || role === "admin") ? (
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Status
//               </label>
//               <select
//                 value={currentProduct?.status || ""}
//                 onChange={(e) => setCurrentProduct({ ...currentProduct, status: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               >
//                 <option value="Pending">Pending</option>
//                 <option value="Active">Active</option>
//                 <option value="Approved">Approved</option>
//               </select>
//             </div>
//           ) : (
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Note
//               </label>
//               <textarea
//                 value={currentProduct?.note || ""}
//                 onChange={(e) => setCurrentProduct({ ...currentProduct, note: e.target.value })}
//                 className="w-full min-h-[90px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition resize-none"
//                 placeholder="Extra details..."
//               />
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
//           <button
//             onClick={handleModalClose}
//             className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleUpdateProduct}
//             className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 active:scale-95"
//           >
//             Update Changes
//           </button>
//         </div>
//       </Modal>

//       {/* Add Purchase Modal */}
//       <Modal
//         isOpen={isModalOpen1}
//         onClose={handleModalClose1}
//         title="Add New Purchase"
//       >
//         <form onSubmit={handleCreateProduct} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
//           <div>
//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//               Select Product
//             </label>
//             <Select
//               options={productDropdownOptions}
//               value={productDropdownOptions.find(o => o.value === String(createProduct.productId)) || null}
//               onChange={(selected) => setCreateProduct({ ...createProduct, productId: selected?.value || "" })}
//               placeholder="Search product..."
//               isClearable
//               styles={selectStyles}
//               className="text-sm font-medium"
//               isDisabled={isLoadingAllProducts}
//             />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Purchase Date
//               </label>
//               <input
//                 type="date"
//                 value={createProduct?.date || ""}
//                 onChange={(e) => setCreateProduct(p => ({ ...p, date: e.target.value }))}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Warehouse
//               </label>
//               <select
//                 value={createProduct?.warehouseId || ""}
//                 onChange={(e) => setCreateProduct({ ...createProduct, warehouseId: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//                 required
//               >
//                 <option value="">Select Warehouse</option>
//                 {warehouses?.map(w => <option key={w.Id} value={w.Id}>{w.name}</option>)}
//               </select>
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//               Supplier
//             </label>
//             <select
//               value={createProduct?.supplierId || ""}
//               onChange={(e) => setCreateProduct({ ...createProduct, supplierId: e.target.value })}
//               className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               required
//             >
//               <option value="">Select Supplier</option>
//               {suppliers?.map(s => <option key={s.Id} value={s.Id}>{s.name}</option>)}
//             </select>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Purchase Price
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={createProduct?.purchase_price || ""}
//                 onChange={(e) => setCreateProduct({ ...createProduct, purchase_price: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Sale Price
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={createProduct?.sale_price || ""}
//                 onChange={(e) => setCreateProduct({ ...createProduct, sale_price: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Quantity
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={createProduct.quantity}
//                 onChange={(e) => setCreateProduct({ ...createProduct, quantity: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Paid
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={createProduct.paidAmount || ""}
//                 onChange={(e) => setCreateProduct({ ...createProduct, paidAmount: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 Due
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={createProduct.dueAmount || ""}
//                 onChange={(e) => setCreateProduct({ ...createProduct, dueAmount: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               />
//             </div>
//           </div>

//           <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
//             <div className="flex items-center justify-between px-4 py-3">
//               <div>
//                 <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
//                   Warranty Coverage
//                 </span>
//                 <p className="text-[10px] font-bold text-slate-400">Enable if product has warranty</p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setHasWarranty((p) => !p);
//                   if (hasWarranty) {
//                     setWarrantyValue("");
//                     setWarrantyUnit("Day");
//                   }
//                 }}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${hasWarranty ? "bg-indigo-600" : "bg-slate-300"
//                   }`}
//               >
//                 <span className="sr-only">Toggle Warranty</span>
//                 <span
//                   className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${hasWarranty ? "translate-x-6" : "translate-x-1"
//                     }`}
//                 />
//               </button>
//             </div>

//             {hasWarranty && (
//               <div className="bg-white rounded-xl border border-slate-100 m-1 p-4 space-y-3 shadow-sm">
//                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</label>

//                 <div className="flex gap-2">
//                   <input
//                     type="number"
//                     min="1"
//                     value={warrantyValue}
//                     onChange={(e) => setWarrantyValue(e.target.value)}
//                     placeholder="30"
//                     className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none
//                          focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//                   />

//                   <select
//                     value={warrantyUnit}
//                     onChange={(e) => setWarrantyUnit(e.target.value)}
//                     className="h-11 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none
//                          focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition appearance-none cursor-pointer"
//                   >
//                     <option value="Day">Days</option>
//                     <option value="Month">Months</option>
//                     <option value="Year">Years</option>
//                   </select>
//                 </div>
//               </div>
//             )}
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//               Note
//             </label>
//             <textarea
//               value={createProduct?.note || ""}
//               onChange={(e) => setCreateProduct({ ...createProduct, note: e.target.value })}
//               className="w-full min-h-[80px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition resize-none"
//               placeholder={t.add_extra_info || "Add any extra info..."}
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//               {t.document || "Document"}
//             </label>
//             <div className="relative group/file">
//               <input
//                 type="file"
//                 accept=".jpg,.jpeg,.png,.pdf"
//                 onChange={(e) => setCreateProduct({ ...createProduct, file: e.target.files?.[0] || null })}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
//               />
//               <div className="w-full h-12 border-2 border-dashed border-slate-200 rounded-xl flex items-center px-4 gap-3 bg-slate-50 group-hover/file:border-indigo-400 group-hover/file:bg-indigo-50 transition">
//                 <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover/file:text-indigo-600 transition">
//                   <Plus size={16} />
//                 </div>
//                 <span className="text-sm font-medium text-slate-500 group-hover/file:text-indigo-600">
//                   {createProduct.file ? createProduct.file.name : t.select_drop_file || "Select or drop file..."}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
//             <button
//               type="button"
//               onClick={handleModalClose1}
//               className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
//             >
//               {t.cancel || "Cancel"}
//             </button>
//             <button
//               type="submit"
//               className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 active:scale-95"
//             >
//               {t.confirm_purchase || "Confirm Purchase"}
//             </button>
//           </div>
//         </form>
//       </Modal>

//       {/* Request Delete Modal */}
//       <Modal
//         isOpen={isModalOpen2 && !!currentProduct}
//         onClose={handleModalClose2}
//         title={t.action_confirmation || "Action Confirmation"}
//       >
//         <div className="space-y-4">
//           {role === "superAdmin" ? (
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 {t.update_status || "Update Status"}
//               </label>
//               <select
//                 value={currentProduct?.status || ""}
//                 onChange={(e) => setCurrentProduct({ ...currentProduct, status: e.target.value })}
//                 className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
//               >
//                 <option value="Pending">Pending</option>
//                 <option value="Active">Active</option>
//                 <option value="Approved">Approved</option>
//               </select>
//             </div>
//           ) : (
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
//                 {t.reason_for_removal || "Reason for Removal"}
//               </label>
//               <textarea
//                 value={currentProduct?.note || ""}
//                 onChange={(e) => setCurrentProduct({ ...currentProduct, note: e.target.value })}
//                 className="w-full min-h-[120px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition resize-none"
//                 placeholder={t.explain_why_remove_record || "Please explain why you want to remove this record..."}
//               />
//             </div>
//           )}

//           <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
//             <button
//               onClick={handleModalClose2}
//               className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
//             >
//               {t.cancel || "Cancel"}
//             </button>
//             <button
//               onClick={handleUpdateProduct1}
//               className="px-8 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition shadow-md shadow-amber-100 active:scale-95"
//             >
//               {t.submit_request || "Submit Request"}
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </motion.div >
//   );
// };

// export default ReceivedProductTable;

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Notebook,
  Plus,
  ShoppingBasket,
  Trash2,
  X,
} from "lucide-react";
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
import Modal from "../common/Modal";
import { useGetAllBookWithoutQueryQuery } from "../../features/book/book";
import { useLayout } from "../../context/LayoutContext";
import { translations } from "../../utils/translations";

const initialCreateProduct = {
  warehouseId: "",
  bookId: "",
  supplierId: "",
  productId: "",
  quantity: "",
  purchase_price: "",
  sale_price: "",
  note: "",
  date: new Date().toISOString().slice(0, 10),
  file: null,

  // ✅ Warranty
  hasWarranty: false,
  warrantyValue: "",
  warrantyUnit: "Day",
};

const ReceivedProductTable = () => {
  const { language } = useLayout();
  const t = translations[language] || translations.EN;
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [isModalOpen, setIsModalOpen] = useState(false); // Edit modal
  const [isModalOpen1, setIsModalOpen1] = useState(false); // Add modal
  const [isModalOpen2, setIsModalOpen2] = useState(false); // Note / status modal
  const [currentProduct, setCurrentProduct] = useState(null);

  const [warehouse, setWarehouse] = useState("");
  const [supplier, setSupplier] = useState("");

  const [createProduct, setCreateProduct] = useState(initialCreateProduct);

  const [rows, setRows] = useState([]);

  // ✅ Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productName, setProductName] = useState("");

  // Pagination
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

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ All products
  const {
    data: allProductsRes,
    isLoading: isLoadingAllProducts,
    isError: isErrorAllProducts,
    error: errorAllProducts,
  } = useGetAllProductWithoutQueryQuery();

  const productsData = allProductsRes?.data || [];

  useEffect(() => {
    if (isErrorAllProducts) {
      console.error("Error fetching products", errorAllProducts);
    }
  }, [isErrorAllProducts, errorAllProducts]);

  const productDropdownOptions = useMemo(() => {
    return (productsData || []).map((p) => ({
      value: String(p.Id ?? p.id ?? p._id),
      label: p.name,
    }));
  }, [productsData]);

  const productNameMap = useMemo(() => {
    const m = new Map();
    (productsData || []).forEach((p) => {
      const key = String(p.Id ?? p.id ?? p._id);
      m.set(key, p.name);
    });
    return m;
  }, [productsData]);

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

  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      name: productName || undefined,
      warehouseId: warehouse || undefined,
      supplierId: supplier || undefined,
    };

    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "") {
        delete args[k];
      }
    });

    return args;
  }, [
    currentPage,
    itemsPerPage,
    startDate,
    endDate,
    productName,
    warehouse,
    supplier,
  ]);

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
        Math.max(1, Math.ceil((data?.meta?.count || 0) / itemsPerPage)),
      );
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

  // ✅ Modal handlers
  const handleAddProduct = () => setIsModalOpen1(true);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleModalClose1 = () => {
    setIsModalOpen1(false);
    setCreateProduct(initialCreateProduct);
  };

  const handleModalClose2 = () => {
    setIsModalOpen2(false);
    setCurrentProduct(null);
  };

  const [updateReceivedProduct] = useUpdateReceivedProductMutation();

  const handleEditClick = (rp) => {
    setCurrentProduct({
      ...rp,
      productId: rp.productId ? String(rp.productId) : "",
      supplierId: rp.supplierId ?? "",
      warehouseId: rp.warehouseId ?? "",
      quantity: rp.quantity ?? "",
      bookId: rp.bookId ?? "",
      purchase_price: rp.purchase_price ?? "",
      sale_price: rp.sale_price ?? "",
      duePayment: rp.duePayment ?? "",
      supplier: rp.supplier ?? "",
      date: rp.date ?? "",
      note: rp.note ?? "",
      file: rp.file ?? null,

      // ✅ Warranty preload
      hasWarranty: !!rp.warrantyValue,
      warrantyValue: rp.warrantyValue ?? "",
      warrantyUnit: rp.warrantyUnit ?? "Day",

      userId,
    });

    setIsModalOpen(true);
  };

  const handleEditClick1 = (rp) => {
    setCurrentProduct({
      ...rp,
      productId: rp.productId ? String(rp.productId) : "",
      supplierId: rp.supplierId ?? "",
      warehouseId: rp.warehouseId ?? "",
      quantity: rp.quantity ?? "",
      bookId: rp.bookId ?? "",
      purchase_price: rp.purchase_price ?? "",
      sale_price: rp.sale_price ?? "",
      supplier: rp.supplier ?? "",
      note: rp.note ?? "",
      file: rp.file ?? null,

      // ✅ Warranty preload
      hasWarranty: !!rp.warrantyValue,
      warrantyValue: rp.warrantyValue ?? "",
      warrantyUnit: rp.warrantyUnit ?? "Day",

      userId,
    });

    setIsModalOpen2(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const fd = new FormData();
      fd.append("productId", Number(currentProduct.productId) || "");
      fd.append("bookId", Number(currentProduct.bookId) || "");
      fd.append("supplierId", Number(currentProduct.supplierId) || "");
      fd.append("warehouseId", Number(currentProduct.warehouseId) || "");
      fd.append("quantity", Number(currentProduct.quantity) || 0);
      fd.append("purchase_price", Number(currentProduct.purchase_price) || 0);
      fd.append("sale_price", Number(currentProduct.sale_price) || 0);
      fd.append("date", currentProduct.date || "");
      fd.append("note", currentProduct.note || "");
      fd.append("status", currentProduct.status || "");
      fd.append("userId", Number(currentProduct.userId) || 0);
      fd.append("actorRole", role);

      if (currentProduct.file instanceof File) {
        fd.append("file", currentProduct.file);
      }

      // ✅ Warranty
      fd.append(
        "warrantyValue",
        currentProduct?.hasWarranty ? currentProduct.warrantyValue || "" : "",
      );
      fd.append(
        "warrantyUnit",
        currentProduct?.hasWarranty ? currentProduct.warrantyUnit || "Day" : "",
      );

      const res = await updateReceivedProduct({
        id: currentProduct.Id,
        data: fd,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated!");
        setIsModalOpen(false);
        setCurrentProduct(null);
        refetch?.();
      } else {
        toast.error(res?.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleUpdateProduct1 = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid item!");
    if (currentProduct?.note === "" || currentProduct?.note === null) {
      return toast.error("Note is required!");
    }

    try {
      const fd = new FormData();
      fd.append("productId", Number(currentProduct.productId) || "");
      fd.append("bookId", Number(currentProduct.bookId) || "");
      fd.append("supplierId", Number(currentProduct.supplierId) || "");
      fd.append("warehouseId", Number(currentProduct.warehouseId) || "");
      fd.append("quantity", Number(currentProduct.quantity) || 0);
      fd.append("purchase_price", Number(currentProduct.purchase_price) || 0);
      fd.append("sale_price", Number(currentProduct.sale_price) || 0);
      fd.append("date", currentProduct.date || "");
      fd.append("note", currentProduct.note || "");
      fd.append("status", currentProduct.status || "");
      fd.append("userId", Number(currentProduct.userId) || 0);
      fd.append("actorRole", role);

      if (currentProduct.file instanceof File) {
        fd.append("file", currentProduct.file);
      }

      // ✅ Warranty
      fd.append(
        "warrantyValue",
        currentProduct?.hasWarranty ? currentProduct.warrantyValue || "" : "",
      );
      fd.append(
        "warrantyUnit",
        currentProduct?.hasWarranty ? currentProduct.warrantyUnit || "Day" : "",
      );

      const res = await updateReceivedProduct({
        id: currentProduct.Id,
        data: fd,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated product!");
        setIsModalOpen2(false);
        setCurrentProduct(null);
        refetch?.();
      } else {
        toast.error(res?.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // ✅ Insert
  const [insertReceivedProduct] = useInsertReceivedProductMutation();

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.productId) return toast.error("Please select a product");
    if (!createProduct.quantity || Number(createProduct.quantity) <= 0) {
      return toast.error("Please enter a valid quantity");
    }

    const fd = new FormData();
    fd.append("productId", Number(createProduct.productId) || "");
    fd.append("supplierId", Number(createProduct.supplierId) || "");
    fd.append("bookId", Number(createProduct.bookId) || "");
    fd.append("warehouseId", Number(createProduct.warehouseId) || "");
    fd.append("quantity", Number(createProduct.quantity) || 0);
    fd.append("purchase_price", Number(createProduct.purchase_price) || 0);
    fd.append("sale_price", Number(createProduct.sale_price) || 0);
    fd.append("date", createProduct.date || "");
    fd.append("note", createProduct.note || "");

    if (createProduct.file) {
      fd.append("file", createProduct.file);
    }

    // ✅ Warranty
    fd.append(
      "warrantyValue",
      createProduct.hasWarranty ? createProduct.warrantyValue || "" : "",
    );
    fd.append(
      "warrantyUnit",
      createProduct.hasWarranty ? createProduct.warrantyUnit || "Day" : "",
    );

    try {
      const res = await insertReceivedProduct(fd).unwrap();
      if (res?.success) {
        toast.success("Successfully created received product");
        setIsModalOpen1(false);
        setCreateProduct(initialCreateProduct);
        refetch?.();
      } else {
        toast.error(res?.message || "Create failed!");
      }
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
      } else {
        toast.error(res?.message || "Delete failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setProductName("");
    setWarehouse("");
    setSupplier("");
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 14,
      borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
      "&:hover": { borderColor: "#cbd5e1" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    placeholder: (base) => ({ ...base, color: "#64748b" }),
    menu: (base) => ({ ...base, borderRadius: 14, overflow: "hidden" }),
  };

  // ✅ Books
  const {
    data: allBookRes,
    isError: isErrorBook,
    error: errorBook,
  } = useGetAllBookWithoutQueryQuery();
  const books = allBookRes?.data || [];

  useEffect(() => {
    if (isErrorBook) console.error("Error fetching Books", errorBook);
  }, [isErrorBook, errorBook]);

  // const bookOptions = useMemo(
  //   () =>
  //     (books || []).map((s) => ({
  //       value: s.Id,
  //       label: s.name,
  //     })),
  //   [books],
  // );

  // ✅ suppliers
  const {
    data: allSupplierRes,
    isError: isErrorSupplier,
    error: errorSupplier,
  } = useGetAllSupplierWithoutQueryQuery();
  const suppliers = allSupplierRes?.data || [];

  useEffect(() => {
    if (isErrorSupplier)
      console.error("Error fetching suppliers", errorSupplier);
  }, [isErrorSupplier, errorSupplier]);

  const supplierOptions = useMemo(
    () =>
      (suppliers || []).map((s) => ({
        value: s.Id,
        label: s.name,
      })),
    [suppliers],
  );

  // ✅ warehouses
  const {
    data: allWarehousesRes,
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

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const handleNoteClick = (note) => {
    setNoteContent(note);
    setIsNoteModalOpen(true);
  };

  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false);
    setNoteContent("");
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(15,23,42,0.04)] rounded-2xl p-4 sm:p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.purchase_history || "Purchase History"}
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            {t.incoming_product_acquisitions ||
              "Track and analyze all incoming product acquisitions"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="inline-flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-5 py-2.5 rounded-2xl shadow-sm shadow-indigo-50">
            <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
              <ShoppingBasket size={18} />
            </div>
            <div>
              <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                Total Units
              </div>
              <div className="text-base font-black text-indigo-900 tabular-nums leading-none">
                {isLoading
                  ? "..."
                  : (data?.meta?.totalQuantity ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddProduct}
            className="group relative inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-all px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 active:scale-95 overflow-hidden w-full sm:w-auto"
          >
            <Plus size={18} /> {t.add_new_purchase || "Add New Purchase"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-10 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 items-end">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.from}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.to}
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.per_page_label}
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold text-sm appearance-none cursor-pointer"
          >
            {[10, 20, 50, 100].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.product}
          </label>
          <Select
            options={productDropdownOptions}
            value={
              productDropdownOptions.find((o) => o.label === productName) ||
              null
            }
            onChange={(selected) => setProductName(selected?.label || "")}
            placeholder={t.search}
            isClearable
            isDisabled={isLoadingAllProducts}
            styles={selectStyles}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.warehouse}
          </label>
          <Select
            options={warehouseOptions}
            value={
              warehouseOptions.find(
                (o) => String(o.value) === String(warehouse),
              ) || null
            }
            onChange={(selected) => setWarehouse(selected?.value || "")}
            placeholder={t.search}
            isClearable
            styles={selectStyles}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.supplier}
          </label>
          <Select
            options={supplierOptions}
            value={
              supplierOptions.find(
                (o) => String(o.value) === String(supplier),
              ) || null
            }
            onChange={(selected) => setSupplier(selected?.value || "")}
            placeholder={t.search}
            isClearable
            styles={selectStyles}
          />
        </div>

        <button
          type="button"
          className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 transition rounded-xl px-4 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 border border-slate-200"
          onClick={clearFilters}
        >
          <X size={16} /> {t.clear_filters}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.date}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.warehouse}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.supplier}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.product_details || "Product Details"}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.financials}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.status}
                </th>
                <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.actions}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((rp) => (
                <motion.tr
                  key={rp.Id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {rp.date}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-tighter">
                      {rp?.warehouse?.name || t.no_warehouse || "No Warehouse"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tighter">
                      {rp?.supplier?.name || t.no_supplier || "No Supplier"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-bold text-slate-900">
                        {resolveProductName(rp)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.qty_label || "Qty"}:{" "}
                        {Number(rp.quantity || 0).toFixed(0)}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {t.total_buy_label || "Total Buy"}:{" "}
                        <span className="text-slate-900 border-b border-dotted border-slate-300">
                          ৳
                          {Number(
                            (rp.purchase_price || 0) * (rp.quantity || 0),
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {t.total_sell_label || "Total Sell"}:{" "}
                        <span className="text-emerald-600">
                          ৳
                          {Number(
                            (rp.sale_price || 0) * (rp.quantity || 0),
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                        rp.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100"
                          : rp.status === "Active"
                            ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm shadow-blue-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100"
                      }`}
                    >
                      {rp.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {/* <button
                        className="relative h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition shadow-sm"
                        title="View Note"
                        type="button"
                        onClick={() => handleNoteClick(rp.note)}
                      >
                        <Notebook size={16} />
                        {rp.note && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
                      </button> */}

                      {rp.note ? (
                        <div className="relative">
                          <button
                            className="relative h-10 w-10 rounded-md flex items-center justify-center"
                            title={rp.note}
                            type="button"
                            onClick={() => handleNoteClick(rp.note)}
                          >
                            <Notebook size={18} className="text-slate-700" />
                          </button>

                          <span className="absolute top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
                            1
                          </span>
                        </div>
                      ) : (
                        <button
                          className="h-10 w-10 rounded-md flex items-center justify-center cursor-default"
                          title={t.no_note_available || "No note available"}
                          type="button"
                        >
                          <Notebook size={18} className="text-slate-300" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEditClick(rp)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition shadow-sm"
                        title={t.edit_record || "Edit"}
                      >
                        <Edit size={16} />
                      </button>

                      {role === "superAdmin" || role === "admin" ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(rp.Id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition shadow-sm"
                          title={t.delete_record || "Delete"}
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditClick1(rp)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition shadow-sm"
                          title={t.request_delete || "Request Delete"}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-sm text-slate-400 italic"
                  >
                    {t.no_purchase_records}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-6 px-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {t.showing_page || "Showing Page"}{" "}
          <span className="text-indigo-600">{currentPage}</span> {t.of || "of"}{" "}
          <span className="text-slate-900">{totalPages}</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousSet}
            disabled={startPage === 1}
            className="h-11 px-5 border border-slate-200 rounded-2xl bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 transition active:scale-95 flex items-center gap-2 shadow-sm"
          >
            <ChevronLeft size={16} /> {t.prev}
          </button>

          <div className="flex items-center gap-1.5">
            {[...Array(endPage - startPage + 1)].map((_, index) => {
              const pageNum = startPage + index;
              const active = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-11 w-11 rounded-2xl font-black text-sm transition-all active:scale-90 ${
                    active
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                      : "bg-white text-slate-600 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextSet}
            disabled={endPage === totalPages}
            className="h-11 px-5 border border-slate-200 rounded-2xl bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 transition active:scale-95 flex items-center gap-2 shadow-sm"
          >
            {t.next} <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Note Preview Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={handleNoteModalClose}
        title={t.note_preview || "Note Preview"}
      >
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[120px]">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {noteContent || t.no_note_available || "No note available."}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleNoteModalClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition shadow-sm active:scale-95"
            >
              {t.done || "Done"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Purchase Modal */}
      <Modal
        isOpen={isModalOpen && !!currentProduct}
        onClose={handleModalClose}
        title={t.edit_purchase || "Edit Purchase"}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.select_product || "Select Product"}
            </label>
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
              placeholder={t.search_product || "Search product..."}
              isClearable
              styles={selectStyles}
              className="text-sm font-medium"
              isDisabled={isLoadingAllProducts}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.purchase_date || "Purchase Date"}
              </label>
              <input
                type="date"
                value={currentProduct?.date || ""}
                onChange={(e) =>
                  setCurrentProduct((p) => ({ ...p, date: e.target.value }))
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.warehouse || "Warehouse"}
              </label>
              <select
                value={currentProduct?.warehouseId || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    warehouseId: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="">
                  {t.select_warehouse || "Select Warehouse"}
                </option>
                {warehouses?.map((w) => (
                  <option key={w.Id} value={w.Id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.book || "Book"}
              </label>
              <select
                value={currentProduct?.bookId || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    bookId: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="">{t.select_book || "Select Book"}</option>
                {books?.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.supplier || "Supplier"}
              </label>
              <select
                value={currentProduct?.supplierId || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    supplierId: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="">
                  {t.select_supplier || "Select Supplier"}
                </option>
                {suppliers?.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.quantity || "Quantity"}
              </label>
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
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.purchase_price || "Purchase Price"}
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
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.sale_price || "Sale Price"}
              </label>
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
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* ✅ Warranty block (Edit) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
                  {t.warranty_coverage || "Warranty Coverage"}
                </span>
                <p className="text-[10px] font-bold text-slate-400">
                  {t.enable_warranty_if_product_has_warranty ||
                    "Enable if product has warranty"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentProduct((prev) => ({
                    ...prev,
                    hasWarranty: !prev?.hasWarranty,
                    warrantyValue: prev?.hasWarranty
                      ? ""
                      : prev?.warrantyValue || "",
                    warrantyUnit: prev?.hasWarranty
                      ? "Day"
                      : prev?.warrantyUnit || "Day",
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  currentProduct?.hasWarranty ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span className="sr-only">
                  {t.toggle_warranty || "Toggle Warranty"}
                </span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    currentProduct?.hasWarranty
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {currentProduct?.hasWarranty && (
              <div className="bg-white rounded-xl border border-slate-100 m-1 p-4 space-y-3 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.duration || "Duration"}
                </label>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={currentProduct?.warrantyValue || ""}
                    onChange={(e) =>
                      setCurrentProduct((prev) => ({
                        ...prev,
                        warrantyValue: e.target.value,
                      }))
                    }
                    placeholder="30"
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none
                    focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                  />

                  <select
                    value={currentProduct?.warrantyUnit || "Day"}
                    onChange={(e) =>
                      setCurrentProduct((prev) => ({
                        ...prev,
                        warrantyUnit: e.target.value,
                      }))
                    }
                    className="h-11 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none
                    focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition appearance-none cursor-pointer"
                  >
                    <option value="Day">{t.days}</option>
                    <option value="Month">{t.months || "Months"}</option>
                    <option value="Year">{t.years || "Years"}</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {role === "superAdmin" || role === "admin" ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.status || "Status"}
              </label>
              <select
                value={currentProduct?.status || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    status: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="Pending">{t.pending}</option>
                <option value="Active">{t.active}</option>
                <option value="Approved">{t.approved}</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.note || "Note"}
              </label>
              <textarea
                value={currentProduct?.note || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, note: e.target.value })
                }
                className="w-full min-h-[90px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition resize-none"
                placeholder={t.extra_details || "Extra details..."}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
          <button
            onClick={handleModalClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
          >
            {t.cancel || "Cancel"}
          </button>
          <button
            onClick={handleUpdateProduct}
            className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 active:scale-95"
          >
            {t.update_changes || "Update Changes"}
          </button>
        </div>
      </Modal>

      {/* Add Purchase Modal */}
      <Modal
        isOpen={isModalOpen1}
        onClose={handleModalClose1}
        title={t.add_new_purchase || "Add New Purchase"}
      >
        <form
          onSubmit={handleCreateProduct}
          className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar"
        >
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.select_product || "Select Product"}
            </label>
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
              placeholder={t.search_product || "Search product..."}
              isClearable
              styles={selectStyles}
              className="text-sm text-black font-medium"
              isDisabled={isLoadingAllProducts}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.purchase_date || "Purchase Date"}
              </label>
              <input
                type="date"
                value={createProduct?.date || ""}
                onChange={(e) =>
                  setCreateProduct((p) => ({ ...p, date: e.target.value }))
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.warehouse || "Warehouse"}
              </label>
              <select
                value={createProduct?.warehouseId || ""}
                onChange={(e) =>
                  setCreateProduct({
                    ...createProduct,
                    warehouseId: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                required
              >
                <option value="">
                  {t.select_warehouse || "Select Warehouse"}
                </option>
                {warehouses?.map((w) => (
                  <option key={w.Id} value={w.Id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.book || "Book"}
              </label>
              <select
                value={createProduct?.bookId || ""}
                onChange={(e) =>
                  setCreateProduct({ ...createProduct, bookId: e.target.value })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="">{t.select_book || "Select Book"}</option>
                {books?.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.supplier || "Supplier"}
              </label>
              <select
                value={createProduct?.supplierId || ""}
                onChange={(e) =>
                  setCreateProduct({
                    ...createProduct,
                    supplierId: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                required
              >
                <option value="">
                  {t.select_supplier || "Select Supplier"}
                </option>
                {suppliers?.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.purchase_price || "Purchase Price"}
              </label>
              <input
                type="number"
                step="0.01"
                value={createProduct?.purchase_price || ""}
                onChange={(e) =>
                  setCreateProduct({
                    ...createProduct,
                    purchase_price: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.sale_price || "Sale Price"}
              </label>
              <input
                type="number"
                step="0.01"
                value={createProduct?.sale_price || ""}
                onChange={(e) =>
                  setCreateProduct({
                    ...createProduct,
                    sale_price: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.quantity || "Quantity"}
              </label>
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
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          {/* ✅ Warranty block (Add) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
                  {t.warranty_coverage || "Warranty Coverage"}
                </span>
                <p className="text-[10px] font-bold text-slate-400">
                  {t.enable_warranty_if_product_has_warranty ||
                    "Enable if product has warranty"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCreateProduct((prev) => ({
                    ...prev,
                    hasWarranty: !prev?.hasWarranty,
                    warrantyValue: prev?.hasWarranty
                      ? ""
                      : prev?.warrantyValue || "",
                    warrantyUnit: prev?.hasWarranty
                      ? "Day"
                      : prev?.warrantyUnit || "Day",
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  createProduct?.hasWarranty ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span className="sr-only">
                  {t.toggle_warranty || "Toggle Warranty"}
                </span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    createProduct?.hasWarranty
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {createProduct?.hasWarranty && (
              <div className="bg-white rounded-xl border border-slate-100 m-1 p-4 space-y-3 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.duration || "Duration"}
                </label>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={createProduct?.warrantyValue || ""}
                    onChange={(e) =>
                      setCreateProduct((prev) => ({
                        ...prev,
                        warrantyValue: e.target.value,
                      }))
                    }
                    placeholder="30"
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none
                    focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                  />

                  <select
                    value={createProduct?.warrantyUnit || "Day"}
                    onChange={(e) =>
                      setCreateProduct((prev) => ({
                        ...prev,
                        warrantyUnit: e.target.value,
                      }))
                    }
                    className="h-11 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none
                    focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition appearance-none cursor-pointer"
                  >
                    <option value="Day">{t.days}</option>
                    <option value="Month">{t.months || "Months"}</option>
                    <option value="Year">{t.years || "Years"}</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.note || "Note"}
            </label>
            <textarea
              value={createProduct?.note || ""}
              onChange={(e) =>
                setCreateProduct({ ...createProduct, note: e.target.value })
              }
              className="w-full min-h-[80px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition resize-none"
              placeholder={t.add_extra_info || "Add any extra info..."}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.document || "Document"}
            </label>
            <div className="relative group/file">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) =>
                  setCreateProduct({
                    ...createProduct,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-12 border-2 border-dashed border-slate-200 rounded-xl flex items-center px-4 gap-3 bg-slate-50 group-hover/file:border-indigo-400 group-hover/file:bg-indigo-50 transition">
                <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover/file:text-indigo-600 transition">
                  <Plus size={16} />
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover/file:text-indigo-600">
                  {createProduct.file
                    ? createProduct.file.name
                    : t.select_drop_file || "Select or drop file..."}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleModalClose1}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
            >
              {t.cancel || "Cancel"}
            </button>

            <button
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 active:scale-95"
            >
              {t.confirm_purchase || "Confirm Purchase"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Request Delete Modal */}
      <Modal
        isOpen={isModalOpen2 && !!currentProduct}
        onClose={handleModalClose2}
        title={t.action_confirmation || "Action Confirmation"}
      >
        <div className="space-y-4">
          {role === "superAdmin" ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.update_status || "Update Status"}
              </label>
              <select
                value={currentProduct?.status || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    status: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="Pending">{t.pending}</option>
                <option value="Active">{t.active}</option>
                <option value="Approved">{t.approved}</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.reason_for_removal || "Reason for Removal"}
              </label>
              <textarea
                value={currentProduct?.note || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, note: e.target.value })
                }
                className="w-full min-h-[120px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition resize-none"
                placeholder={
                  t.explain_why_remove_record ||
                  "Please explain why you want to remove this record..."
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={handleModalClose2}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
            >
              {t.cancel || "Cancel"}
            </button>

            <button
              onClick={handleUpdateProduct1}
              className="px-8 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition shadow-md shadow-amber-100 active:scale-95"
            >
              {t.submit_request || "Submit Request"}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ReceivedProductTable;
