// import { useEffect, useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ArrowDown } from "lucide-react";
// import { useGetAllReceivedProductQuery } from "../../features/receivedProduct/receivedProduct";
// import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";
// import Select from "react-select";

// export default function SellPosTable() {
//   const [cart, setCart] = useState([]);
//   const [discount, setDiscount] = useState(0);
//   const [deliveryCharge, setDeliveryCharge] = useState(0);
//   const [products, setProducts] = useState([]);
//   const [productName, setProductName] = useState("");
//   const [isSummaryOpen, setIsSummaryOpen] = useState(false);

//   // ✅ Drawer state
//   const [isPaymentOpen, setIsPaymentOpen] = useState(false);

//   // ✅ Payment form (basic)
//   const [sellDate, setSellDate] = useState(() => {
//     const d = new Date();
//     const yyyy = d.getFullYear();
//     const mm = String(d.getMonth() + 1).padStart(2, "0");
//     const dd = String(d.getDate()).padStart(2, "0");
//     return `${yyyy}-${mm}-${dd}`;
//   });
//   const [paidAmount, setPaidAmount] = useState(0);
//   const [note, setNote] = useState("");
//   const [customerName, setCustomerName] = useState("");
//   const [customerPhone, setCustomerPhone] = useState("");
//   const [customerAddress, setCustomerAddress] = useState("");
//   const [collectCustomerEmail, setCollectCustomerEmail] = useState(false);
//   const [collectCustomerInfo, setCollectCustomerInfo] = useState(false);

//   // Pagination
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
//   }, [productName, itemsPerPage]);

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
//       Math.min(prev + pagesPerSet, Math.max(1, totalPages - pagesPerSet + 1)),
//     );

//   // ✅ Query args
//   const queryArgs = useMemo(() => {
//     const args = {
//       page: currentPage,
//       limit: itemsPerPage,
//       name: productName || undefined,
//     };
//     Object.keys(args).forEach((k) => {
//       if (args[k] === undefined || args[k] === null || args[k] === "")
//         delete args[k];
//     });
//     return args;
//   }, [currentPage, itemsPerPage, productName]);

//   const { data, isLoading, isError, error } =
//     useGetAllReceivedProductQuery(queryArgs);

//   useEffect(() => {
//     if (isError) {
//       console.error("Error fetching received product data", error);
//       return;
//     }
//     if (!isLoading && data) {
//       setProducts(data.data || []);
//       setTotalPages(
//         Math.max(1, Math.ceil((data?.meta?.total || 0) / itemsPerPage)),
//       );
//     }
//   }, [data, isLoading, isError, error, itemsPerPage]);

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

//   // ✅ Dropdown options
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

//   // ---- Normalizers ----
//   const getReceivedId = (rp) =>
//     String(
//       rp.id ??
//         rp.Id ??
//         rp._id ??
//         rp.receivedProductId ??
//         rp.received_product_id ??
//         rp.productId ??
//         rp.product_id ??
//         rp.ProductId ??
//         rp.product?.Id ??
//         rp.product?.id ??
//         rp.product?._id ??
//         "",
//     );

//   const getReceivedPrice = (rp) =>
//     Number(
//       rp.price ?? rp.sellingPrice ?? rp.sale_price ?? rp.product?.price ?? 0,
//     );

//   const getReceivedStock = (rp) =>
//     Number(
//       rp.stock ??
//         rp.qty ??
//         rp.quantity ??
//         rp.availableQty ??
//         rp.available_qty ??
//         rp.product?.stock ??
//         0,
//     );

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
//     if (rp.name) return rp.name;

//     if (pid === null || pid === undefined || pid === "") return "N/A";

//     const byId = productNameMap.get(String(pid));
//     if (byId) return byId;

//     return "N/A";
//   };

//   // ✅ react-select styles
//   const selectStyles = {
//     control: (base, state) => ({
//       ...base,
//       minHeight: 44,
//       borderRadius: 14,
//       borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0",
//       boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
//       "&:hover": { borderColor: "#cbd5e1" },
//     }),
//     valueContainer: (base) => ({ ...base, padding: "0 12px" }),
//     placeholder: (base) => ({ ...base, color: "#64748b" }),
//     menu: (base) => ({ ...base, borderRadius: 14, overflow: "hidden" }),
//   };

//   // Cart
//   const addToCart = (p) => {
//     setCart((prev) => {
//       const exists = prev.find((x) => x.id === p.id);
//       if (exists) {
//         return prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
//       }
//       // ✅ FIX: we store "sale_price" correctly from p.sale_price
//       return [
//         ...prev,
//         { id: p.id, name: p.name, sale_price: p.sale_price, qty: 1 },
//       ];
//     });
//   };

//   const removeFromCart = (id) =>
//     setCart((prev) => prev.filter((x) => x.id !== id));

//   const updateQty = (id, qty) => {
//     const n = Number(qty) || 0;
//     setCart((prev) =>
//       prev.map((x) => (x.id === id ? { ...x, qty: Math.max(1, n) } : x)),
//     );
//   };

//   const subTotal = useMemo(() => {
//     return cart.reduce(
//       (sum, x) => sum + (Number(x.sale_price) || 0) * (Number(x.qty) || 0),
//       0,
//     );
//   }, [cart]);

//   const total = useMemo(() => {
//     const d = Number(discount) || 0;
//     const dc = Number(deliveryCharge) || 0;
//     return Math.max(0, subTotal - d + dc);
//   }, [subTotal, discount, deliveryCharge]);

//   // ✅ When opening payment drawer: auto-fill paid amount as total (optional)
//   const openPayment = () => {
//     setPaidAmount(total);
//     setIsPaymentOpen(true);
//   };

//   const closePayment = () => setIsPaymentOpen(false);

//   const handleConfirmPayment = () => {
//     // এখানে তুমি API call / checkout flow বসাবে
//     // উদাহরণ:
//     // console.log({ sellDate, paidAmount, note, customerName, customerPhone, customerAddress, collectCustomerEmail, collectCustomerInfo, cart, total })
//     closePayment();
//   };

//   return (
//     <>
//       <motion.div
//         className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.15 }}
//       >
//         <div className="grid grid-cols-12 gap-4">
//           {/* Left panel */}
//           <div className="col-span-12 lg:col-span-6">
//             <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white">
//               <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center w-full px-4 pb-4">
//                 <div className="mt-3 flex gap-2">
//                   <div className="flex flex-col w-full">
//                     <label className="text-sm text-slate-600 mb-1 ms-1">
//                       Product
//                     </label>

//                     <Select
//                       options={productDropdownOptions}
//                       value={
//                         productDropdownOptions.find(
//                           (o) => o.label === productName,
//                         ) || null
//                       }
//                       onChange={(selected) =>
//                         setProductName(selected?.label || "")
//                       }
//                       placeholder={
//                         isLoadingAllProducts ? "Loading..." : "Select Product"
//                       }
//                       isClearable
//                       className="text-black"
//                       isDisabled={isLoadingAllProducts}
//                       styles={selectStyles}
//                     />
//                   </div>
//                 </div>

//                 <div className="flex flex-col w-full mt-3">
//                   <label className="text-sm text-slate-600 mb-1">
//                     Per Page
//                   </label>
//                   <select
//                     value={itemsPerPage}
//                     onChange={(e) => {
//                       setItemsPerPage(Number(e.target.value));
//                       setCurrentPage(1);
//                       setStartPage(1);
//                     }}
//                     className="px-3 py-[10px] rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
//                   >
//                     <option value={10}>10</option>
//                     <option value={20}>20</option>
//                     <option value={50}>50</option>
//                     <option value={100}>100</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="divide-y divide-gray-100">
//                 {products.map((p) => {
//                   const rid = getReceivedId(p);
//                   const name = resolveProductName(p);
//                   const sale_price = getReceivedPrice(p);
//                   const stock = getReceivedStock(p);

//                   return (
//                     <div
//                       key={rid || `${name}-${Math.random()}`}
//                       className="px-4 py-4 flex items-center gap-3"
//                     >
//                       <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
//                         {p.img ? (
//                           <span className="text-xs text-slate-700">img</span>
//                         ) : (
//                           <span className="text-lg">📦</span>
//                         )}
//                       </div>

//                       <div className="flex-1">
//                         <div className="text-sm font-semibold text-slate-900">
//                           {name}
//                         </div>

//                         <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
//                           <span>Price: {sale_price}</span>
//                           <span>Stock: {stock}</span>
//                         </div>
//                       </div>

//                       <div className="flex items-center">
//                         <button
//                           onClick={() =>
//                             addToCart({ id: rid, name, sale_price })
//                           }
//                           className="h-9 px-3 rounded-l-md bg-black text-white text-sm hover:bg-black/90 disabled:opacity-60"
//                           type="button"
//                           disabled={!rid}
//                           title={!rid ? "Missing product id" : "Add to cart"}
//                         >
//                           Add
//                         </button>
//                         <button
//                           className="h-9 w-9 rounded-r-md bg-black text-white border-l border-white/15 hover:bg-black/90"
//                           type="button"
//                         >
//                           ▾
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}

//                 {products.length === 0 ? (
//                   <div className="px-4 py-10 text-center text-sm text-gray-500">
//                     No products found
//                   </div>
//                 ) : null}
//               </div>
//             </div>

//             {/* Pagination */}
//             <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
//               <button
//                 onClick={handlePreviousSet}
//                 disabled={startPage === 1}
//                 className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
//               >
//                 Prev
//               </button>

//               {[...Array(endPage - startPage + 1)].map((_, index) => {
//                 const pageNum = startPage + index;
//                 const active = pageNum === currentPage;
//                 return (
//                   <button
//                     key={pageNum}
//                     onClick={() => handlePageChange(pageNum)}
//                     className={`px-4 py-2 rounded-xl border transition ${
//                       active
//                         ? "bg-indigo-600 text-white border-indigo-600"
//                         : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
//                     }`}
//                   >
//                     {pageNum}
//                   </button>
//                 );
//               })}

//               <button
//                 onClick={handleNextSet}
//                 disabled={endPage === totalPages}
//                 className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
//               >
//                 Next
//               </button>
//             </div>
//           </div>

//           {/* Right panel */}
//           <div className="col-span-12 lg:col-span-6">
//             <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white flex flex-col min-h-[80vh]">
//               <div className="flex-1 p-4">
//                 {cart.length === 0 ? (
//                   <div className="h-full flex items-start justify-center pt-16">
//                     <div className="text-slate-600 text-sm">
//                       No product selected
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {cart.map((x) => (
//                       <div
//                         key={x.id}
//                         className="border border-gray-200 rounded-lg p-3 flex items-center gap-3"
//                       >
//                         <div className="flex-1">
//                           <div className="text-sm font-semibold text-black">
//                             {x.name}
//                           </div>
//                           <div className="text-xs text-slate-700 mt-0.5">
//                             Price: {Number(x.sale_price) || 0} ৳
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2">
//                           <input
//                             value={x.qty}
//                             onChange={(e) => updateQty(x.id, e.target.value)}
//                             className="w-16 h-9 rounded-md border border-gray-200 px-2 text-black text-sm outline-none"
//                             type="number"
//                             min={1}
//                           />
//                           <div className="w-24 text-right text-sm font-semibold text-black">
//                             {(
//                               (Number(x.sale_price) || 0) * (Number(x.qty) || 0)
//                             ).toFixed(0)}{" "}
//                             ৳
//                           </div>
//                           <button
//                             onClick={() => removeFromCart(x.id)}
//                             className="h-9 px-3 rounded-md border border-gray-200 hover:bg-gray-50 text-sm text-black"
//                             type="button"
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Bottom area */}
//               <div className="border-t border-gray-200">
//                 <div className="px-4 py-3">
//                   <div className="flex justify-center -mt-6">
//                     <button
//                       type="button"
//                       onClick={() => setIsSummaryOpen((p) => !p)}
//                       className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow"
//                       aria-label="Toggle summary"
//                     >
//                       <motion.div
//                         animate={{ rotate: isSummaryOpen ? 180 : 0 }}
//                         transition={{ duration: 0.2 }}
//                       >
//                         <ArrowDown />
//                       </motion.div>
//                     </button>
//                   </div>

//                   <AnimatePresence initial={false}>
//                     {isSummaryOpen && (
//                       <motion.div
//                         initial={{ height: 0, opacity: 0, y: 12 }}
//                         animate={{ height: "auto", opacity: 1, y: 0 }}
//                         exit={{ height: 0, opacity: 0, y: 12 }}
//                         transition={{ duration: 0.22 }}
//                         className="overflow-hidden"
//                       >
//                         <div className="mt-3 space-y-3">
//                           <Row
//                             label="Subtotal"
//                             right={
//                               <span className="font-semibold text-black">
//                                 {subTotal.toFixed(0)} ৳
//                               </span>
//                             }
//                           />

//                           <Row
//                             label="Discount"
//                             right={
//                               <div className="flex items-center gap-2">
//                                 <input
//                                   value={discount}
//                                   onChange={(e) =>
//                                     setDiscount(Number(e.target.value) || 0)
//                                   }
//                                   className="h-9 w-28 rounded-md border border-gray-200 px-2 text-sm text-right outline-none"
//                                   type="number"
//                                   min={0}
//                                 />
//                                 <div className="h-9 w-12 rounded-md border border-gray-200 flex items-center justify-center text-sm text-black">
//                                   ৳
//                                 </div>
//                               </div>
//                             }
//                           />

//                           <Row
//                             label="Delivery Charge"
//                             right={
//                               <input
//                                 value={deliveryCharge}
//                                 onChange={(e) =>
//                                   setDeliveryCharge(Number(e.target.value) || 0)
//                                 }
//                                 className="h-9 w-44 rounded-md border border-gray-200 px-2 text-sm text-right outline-none"
//                                 type="number"
//                                 min={0}
//                               />
//                             }
//                           />

//                           <Row
//                             label="Total"
//                             right={
//                               <span className="font-semibold text-red-500">
//                                 {total.toFixed(0)} ৳
//                               </span>
//                             }
//                           />

//                           <div className="flex flex-col items-end">
//                             <button
//                               className="py-2 rounded-lg px-3 bg-white border border-gray-200 text-black font-semibold hover:bg-gray-50"
//                               type="button"
//                               onClick={openPayment}
//                               disabled={cart.length === 0}
//                             >
//                               Payment →
//                             </button>
//                           </div>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* ✅ Payment Drawer */}
//       <PaymentDrawer
//         open={isPaymentOpen}
//         onClose={closePayment}
//         total={total}
//         sellDate={sellDate}
//         setSellDate={setSellDate}
//         paidAmount={paidAmount}
//         setPaidAmount={setPaidAmount}
//         note={note}
//         setNote={setNote}
//         customerName={customerName}
//         setCustomerName={setCustomerName}
//         customerPhone={customerPhone}
//         setCustomerPhone={setCustomerPhone}
//         customerAddress={customerAddress}
//         setCustomerAddress={setCustomerAddress}
//         collectCustomerEmail={collectCustomerEmail}
//         setCollectCustomerEmail={setCollectCustomerEmail}
//         collectCustomerInfo={collectCustomerInfo}
//         setCollectCustomerInfo={setCollectCustomerInfo}
//         onConfirm={handleConfirmPayment}
//       />
//     </>
//   );
// }

// function Row({ label, right }) {
//   return (
//     <div className="flex items-center justify-between text-sm">
//       <div className="text-black">{label}</div>
//       <div className="text-black">{right}</div>
//     </div>
//   );
// }

// function PaymentDrawer({
//   open,
//   onClose,
//   total,
//   sellDate,
//   setSellDate,
//   paidAmount,
//   setPaidAmount,
//   note,
//   setNote,
//   customerName,
//   setCustomerName,
//   customerPhone,
//   setCustomerPhone,
//   customerAddress,
//   setCustomerAddress,
//   onConfirm,
// }) {
//   return (
//     <AnimatePresence>
//       {open && (
//         <>
//           {/* Overlay */}
//           <motion.div
//             className="fixed inset-0 bg-black/40 z-[80]"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//           />

//           {/* Drawer */}
//           <motion.aside
//             className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white z-[90] shadow-2xl flex flex-col"
//             initial={{ x: 480 }}
//             animate={{ x: 0 }}
//             exit={{ x: 480 }}
//             transition={{ type: "tween", duration: 0.22 }}
//             role="dialog"
//             aria-modal="true"
//           >
//             {/* Header */}
//             <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
//               <div className="text-xl font-semibold text-slate-900">
//                 Confirm Payment
//               </div>
//               <button
//                 onClick={onClose}
//                 className="h-9 w-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700"
//                 type="button"
//                 aria-label="Close"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Body */}
//             <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
//               <Field label="Date">
//                 <input
//                   value={sellDate}
//                   onChange={(e) => setSellDate(e.target.value)}
//                   type="date"
//                   className="w-full h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
//                 />
//               </Field>

//               <Field label="Amount" required>
//                 <input
//                   value={paidAmount}
//                   onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
//                   type="number"
//                   min={0}
//                   className="w-full h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
//                 />
//               </Field>

//               <Field label="Remarks">
//                 <input
//                   value={note}
//                   onChange={(e) => setNote(e.target.value)}
//                   type="text"
//                   placeholder="Write Something"
//                   className="w-full h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
//                 />
//               </Field>

//               <Field label="Customer Name">
//                 <div className="relative">
//                   <input
//                     value={customerName}
//                     onChange={(e) => setCustomerName(e.target.value)}
//                     type="text"
//                     placeholder="Customer Name"
//                     className="w-full h-11 rounded-lg border border-slate-200 px-3 pr-10 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
//                   />
//                   <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
//                     👤
//                   </span>
//                 </div>
//               </Field>

//               <Field label="Customer Mobile Number">
//                 <div className="flex items-center gap-2">
//                   <div className="h-11 px-3 rounded-lg border border-slate-200 flex items-center text-sm text-slate-700 bg-white">
//                     🇧🇩 +88
//                   </div>
//                   <input
//                     value={customerPhone}
//                     onChange={(e) => setCustomerPhone(e.target.value)}
//                     type="text"
//                     placeholder="XXXXXXXXXXX"
//                     className="flex-1 h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
//                   />
//                 </div>
//               </Field>

//               <Field label="Address">
//                 <input
//                   value={customerAddress}
//                   onChange={(e) => setCustomerAddress(e.target.value)}
//                   type="text"
//                   placeholder="Address"
//                   className="w-full h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
//                 />
//               </Field>

//               {/* <div className="pt-2 space-y-4">
//                 <ToggleRow
//                   label="কাস্টমার ইমেইল নম্বর"
//                   checked={collectCustomerEmail}
//                   onChange={() => setCollectCustomerEmail((p) => !p)}
//                 />
//                 <ToggleRow
//                   label="কাস্টমারীর তথ্য"
//                   checked={collectCustomerInfo}
//                   onChange={() => setCollectCustomerInfo((p) => !p)}
//                 />
//               </div> */}
//             </div>

//             {/* Bottom fixed bar */}
//             <div className="border-t border-slate-200 px-6 py-4">
//               <div className="flex items-center justify-between mb-3">
//                 <div className="text-sm text-slate-600">
//                   You have received the payment
//                 </div>
//                 <div className="text-sm font-semibold text-slate-900">
//                   {Number(total || 0).toFixed(0)} ৳
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={onConfirm}
//                 className="w-full h-12 rounded-xl bg-black text-white font-semibold hover:bg-black/90"
//               >
//                 You have received the payment
//               </button>
//             </div>
//           </motion.aside>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }

// function Field({ label, required, children }) {
//   return (
//     <div>
//       <div className="text-sm font-medium text-slate-800 mb-2">
//         {label} {required ? <span className="text-red-500">*</span> : null}
//       </div>
//       {children}
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Select from "react-select";

import { useGetAllReceivedProductQuery } from "../../features/receivedProduct/receivedProduct";
import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";

// ✅ adjust this path to your slice
import { useInsertPosReportMutation } from "../../features/posReport/posReport";

export default function SellPosTable() {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // ✅ Drawer state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // ✅ Payment form
  const [sellDate, setSellDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // ✅ Insert POS Report mutation
  const [insertPosReport, { isLoading: isSavingPayment }] =
    useInsertPosReportMutation();

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
  }, [productName, itemsPerPage]);

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
      Math.min(prev + pagesPerSet, Math.max(1, totalPages - pagesPerSet + 1)),
    );

  // ✅ Query args
  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      name: productName || undefined,
    };
    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "")
        delete args[k];
    });
    return args;
  }, [currentPage, itemsPerPage, productName]);

  const { data, isLoading, isError, error } =
    useGetAllReceivedProductQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching received product data", error);
      return;
    }
    if (!isLoading && data) {
      setProducts(data.data || []);
      setTotalPages(
        Math.max(1, Math.ceil((data?.meta?.total || 0) / itemsPerPage)),
      );
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

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

  // ✅ Dropdown options
  const productDropdownOptions = useMemo(() => {
    return (productsData || []).map((p) => ({
      value: String(p.Id),
      label: p.name,
    }));
  }, [productsData]);

  // ✅ productId -> productName map
  const productNameMap = useMemo(() => {
    const m = new Map();
    (productsData || []).forEach((p) => {
      const key = String(p.Id);
      m.set(key, p.name);
    });
    return m;
  }, [productsData]);

  // ---- Normalizers ----
  const getReceivedId = (rp) => String(rp.Id);

  const getReceivedPrice = (rp) => Number(rp.sale_price);

  const getReceivedStock = (rp) => Number(rp.quantity);

  const resolveProductName = (rp) => {
    const pid = rp.product?.Id;

    if (rp.productName) return rp.productName;
    if (rp.product?.name) return rp.product?.name;
    if (rp.name) return rp.name;

    if (pid === null || pid === undefined || pid === "") return "N/A";

    const byId = productNameMap.get(String(pid));
    if (byId) return byId;

    return "N/A";
  };

  // ✅ react-select styles
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

  // Cart
  const addToCart = (p) => {
    setCart((prev) => {
      const exists = prev.find((x) => x.Id === p.Id);
      if (exists) {
        return prev.map((x) => (x.Id === p.Id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...prev,
        { Id: p.Id, name: p.name, sale_price: p.sale_price, qty: 1 },
      ];
    });
  };

  const removeFromCart = (Id) =>
    setCart((prev) => prev.filter((x) => x.Id !== Id));

  const updateQty = (Id, qty) => {
    const n = Number(qty) || 0;
    setCart((prev) =>
      prev.map((x) => (x.Id === Id ? { ...x, qty: Math.max(1, n) } : x)),
    );
  };

  const subTotal = useMemo(() => {
    return cart.reduce(
      (sum, x) => sum + (Number(x.sale_price) || 0) * (Number(x.qty) || 0),
      0,
    );
  }, [cart]);

  const total = useMemo(() => {
    const d = Number(discount) || 0;
    const dc = Number(deliveryCharge) || 0;
    return Math.max(0, subTotal - d + dc);
  }, [subTotal, discount, deliveryCharge]);

  // ✅ open/close drawer
  const openPayment = () => {
    setPaidAmount(total);
    setIsPaymentOpen(true);
  };
  const closePayment = () => setIsPaymentOpen(false);

  // ✅ payload builder (adjust keys if your backend expects different names)
  const buildPosPayload = () => {
    const items = cart.map((x) => ({
      Id: x.Id, // <-- change key name if needed (receivedProductId/productId)
      qty: Number(x.qty) || 0,
      price: Number(x.sale_price) || 0,
      total: (Number(x.sale_price) || 0) * (Number(x.qty) || 0),
      name: x.name, // optional
    }));

    return {
      date: sellDate,
      name: customerName,
      mobile: customerPhone,
      address: customerAddress,
      note,
      subTotal: Number(subTotal) || 0,
      discount: Number(discount) || 0,
      deliveryCharge: Number(deliveryCharge) || 0,
      total: Number(total) || 0,

      paidAmount: Number(paidAmount) || 0,
      dueAmount: Math.max(0, (Number(total) || 0) - (Number(paidAmount) || 0)),

      items,
    };
  };

  // ✅ Confirm Payment -> insert via API
  const handleConfirmPayment = async () => {
    try {
      if (cart.length === 0) return;

      const payload = buildPosPayload();
      await insertPosReport(payload).unwrap();

      // reset
      setCart([]);
      setDiscount(0);
      setDeliveryCharge(0);
      setPaidAmount(0);
      setNote("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");

      closePayment();
    } catch (err) {
      console.error("POS insert failed:", err);
    }
  };

  return (
    <>
      <motion.div
        className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="grid grid-cols-12 gap-4">
          {/* Left panel */}
          <div className="col-span-12 lg:col-span-6">
            <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white">
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center w-full px-4 pb-4">
                <div className="mt-3 flex gap-2">
                  <div className="flex flex-col w-full">
                    <label className="text-sm text-slate-600 mb-1 ms-1">
                      Product
                    </label>

                    <Select
                      options={productDropdownOptions}
                      value={
                        productDropdownOptions.find(
                          (o) => o.label === productName,
                        ) || null
                      }
                      onChange={(selected) =>
                        setProductName(selected?.label || "")
                      }
                      placeholder={
                        isLoadingAllProducts ? "Loading..." : "Select Product"
                      }
                      isClearable
                      className="text-black"
                      isDisabled={isLoadingAllProducts}
                      styles={selectStyles}
                    />
                  </div>
                </div>

                <div className="flex flex-col w-full mt-3">
                  <label className="text-sm text-slate-600 mb-1">
                    Per Page
                  </label>
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
              </div>

              <div className="divide-y divide-gray-100">
                {products.map((p) => {
                  const rid = getReceivedId(p);
                  const name = resolveProductName(p);
                  const sale_price = getReceivedPrice(p);
                  const stock = getReceivedStock(p);

                  return (
                    <div
                      key={rid || `${name}-${Math.random()}`}
                      className="px-4 py-4 flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                        {p.img ? (
                          <span className="text-xs text-slate-700">img</span>
                        ) : (
                          <span className="text-lg">📦</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">
                          {name}
                        </div>

                        <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                          <span>Price: {sale_price}</span>
                          <span>Stock: {stock}</span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            addToCart({ Id: rid, name, sale_price })
                          }
                          className="h-9 px-3 rounded-l-md bg-black text-white text-sm hover:bg-black/90 disabled:opacity-60"
                          type="button"
                          disabled={!rid}
                          title={!rid ? "Missing product id" : "Add to cart"}
                        >
                          Add
                        </button>
                        <button
                          className="h-9 w-9 rounded-r-md bg-black text-white border-l border-white/15 hover:bg-black/90"
                          type="button"
                        >
                          ▾
                        </button>
                      </div>
                    </div>
                  );
                })}

                {products.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-gray-500">
                    No products found
                  </div>
                ) : null}
              </div>
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
          </div>

          {/* Right panel */}
          <div className="col-span-12 lg:col-span-6">
            <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white flex flex-col min-h-[80vh]">
              <div className="flex-1 p-4">
                {cart.length === 0 ? (
                  <div className="h-full flex items-start justify-center pt-16">
                    <div className="text-slate-600 text-sm">
                      No product selected
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((x) => (
                      <div
                        key={x.Id}
                        className="border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-black">
                            {x.name}
                          </div>
                          <div className="text-xs text-slate-700 mt-0.5">
                            Price: {Number(x.sale_price) || 0} ৳
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            value={x.qty}
                            onChange={(e) => updateQty(x.Id, e.target.value)}
                            className="w-16 h-9 rounded-md border border-gray-200 px-2 text-black text-sm outline-none"
                            type="number"
                            min={1}
                          />
                          <div className="w-24 text-right text-sm font-semibold text-black">
                            {(
                              (Number(x.sale_price) || 0) * (Number(x.qty) || 0)
                            ).toFixed(0)}{" "}
                            ৳
                          </div>
                          <button
                            onClick={() => removeFromCart(x.Id)}
                            className="h-9 px-3 rounded-md border border-gray-200 hover:bg-gray-50 text-sm text-black"
                            type="button"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom area */}
              <div className="border-t border-gray-200">
                <div className="px-4 py-3">
                  <div className="flex justify-center -mt-6">
                    <button
                      type="button"
                      onClick={() => setIsSummaryOpen((p) => !p)}
                      className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow"
                      aria-label="Toggle summary"
                    >
                      <motion.div
                        animate={{ rotate: isSummaryOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowDown />
                      </motion.div>
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {isSummaryOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, y: 12 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: 12 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-3">
                          <Row
                            label="Subtotal"
                            right={
                              <span className="font-semibold text-black">
                                {subTotal.toFixed(0)} ৳
                              </span>
                            }
                          />

                          <Row
                            label="Discount"
                            right={
                              <div className="flex items-center gap-2">
                                <input
                                  value={discount}
                                  onChange={(e) =>
                                    setDiscount(Number(e.target.value) || 0)
                                  }
                                  className="h-9 w-28 rounded-md border border-gray-200 px-2 text-sm text-right outline-none"
                                  type="number"
                                  min={0}
                                />
                                <div className="h-9 w-12 rounded-md border border-gray-200 flex items-center justify-center text-sm text-black">
                                  ৳
                                </div>
                              </div>
                            }
                          />

                          <Row
                            label="Delivery Charge"
                            right={
                              <input
                                value={deliveryCharge}
                                onChange={(e) =>
                                  setDeliveryCharge(Number(e.target.value) || 0)
                                }
                                className="h-9 w-44 rounded-md border border-gray-200 px-2 text-sm text-right outline-none"
                                type="number"
                                min={0}
                              />
                            }
                          />

                          <Row
                            label="Total"
                            right={
                              <span className="font-semibold text-red-500">
                                {total.toFixed(0)} ৳
                              </span>
                            }
                          />

                          <div className="flex flex-col items-end">
                            <button
                              className="py-2 rounded-lg px-3 bg-white border border-gray-200 text-black font-semibold hover:bg-gray-50 disabled:opacity-60"
                              type="button"
                              onClick={openPayment}
                              disabled={cart.length === 0}
                            >
                              Payment →
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ✅ Payment Drawer */}
      <PaymentDrawer
        open={isPaymentOpen}
        onClose={closePayment}
        total={total}
        sellDate={sellDate}
        setSellDate={setSellDate}
        paidAmount={paidAmount}
        setPaidAmount={setPaidAmount}
        note={note}
        setNote={setNote}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        customerAddress={customerAddress}
        setCustomerAddress={setCustomerAddress}
        onConfirm={handleConfirmPayment}
        isSaving={isSavingPayment}
      />
    </>
  );
}

function Row({ label, right }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-black">{label}</div>
      <div className="text-black">{right}</div>
    </div>
  );
}

function PaymentDrawer({
  open,
  onClose,
  total,
  sellDate,
  setSellDate,
  paidAmount,
  setPaidAmount,
  note,
  setNote,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  onConfirm,
  isSaving,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white z-[90] shadow-2xl flex flex-col"
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ type: "tween", duration: 0.22 }}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div className="text-xl font-semibold text-slate-900">
                Confirm Payment
              </div>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700"
                type="button"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <Field label="Date">
                <input
                  value={sellDate}
                  onChange={(e) => setSellDate(e.target.value)}
                  type="date"
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </Field>

              <Field label="Amount" required>
                <input
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                  type="number"
                  min={0}
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </Field>

              <Field label="Remarks">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  type="text"
                  placeholder="Write Something"
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </Field>

              <Field label="Customer Name">
                <div className="relative">
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    type="text"
                    placeholder="Customer Name"
                    className="w-full h-11 rounded-lg border border-slate-200 px-3 pr-10 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    👤
                  </span>
                </div>
              </Field>

              <Field label="Customer Mobile Number">
                <div className="flex items-center gap-2">
                  <div className="h-11 px-3 rounded-lg border border-slate-200 flex items-center text-sm text-slate-700 bg-white">
                    🇧🇩 +88
                  </div>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    type="text"
                    placeholder="XXXXXXXXXXX"
                    className="flex-1 h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  />
                </div>
              </Field>

              <Field label="Address">
                <input
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  type="text"
                  placeholder="Address"
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </Field>
            </div>

            {/* Bottom fixed bar */}
            <div className="border-t border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-600">
                  You have received the payment
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {Number(total || 0).toFixed(0)} ৳
                </div>
              </div>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isSaving}
                className="w-full h-12 rounded-xl bg-black text-white font-semibold hover:bg-black/90 disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "You have received the payment"}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <div className="text-sm font-medium text-slate-800 mb-2">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>
      {children}
    </div>
  );
}
