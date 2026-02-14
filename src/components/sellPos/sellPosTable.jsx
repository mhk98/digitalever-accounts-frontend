// import { useEffect, useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ArrowDown } from "lucide-react";
// import Select from "react-select";

// import { useReactToPrint } from "react-to-print";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// import { useGetAllReceivedProductQuery } from "../../features/receivedProduct/receivedProduct";
// import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";

// // ✅ adjust this path to your slice
// import { useInsertPosReportMutation } from "../../features/posReport/posReport";

// export default function SellPosTable() {
//   const [cart, setCart] = useState([]);
//   const [discount, setDiscount] = useState(0);
//   const [deliveryCharge, setDeliveryCharge] = useState(0);
//   const [products, setProducts] = useState([]);
//   const [productName, setProductName] = useState("");
//   const [isSummaryOpen, setIsSummaryOpen] = useState(false);

//   // ✅ Drawer state
//   const [isPaymentOpen, setIsPaymentOpen] = useState(false);

//   // ✅ Invoice modal state
//   const [invoiceOpen, setInvoiceOpen] = useState(false);
//   const [invoiceData, setInvoiceData] = useState(null);
//   const invoiceRef = useRef(null);

//   // ✅ Payment form
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

//   // ✅ Insert POS Report mutation
//   const [insertPosReport, { isLoading: isSavingPayment }] =
//     useInsertPosReportMutation();

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
//       value: String(p.Id),
//       label: p.name,
//     }));
//   }, [productsData]);

//   // ✅ productId -> productName map
//   const productNameMap = useMemo(() => {
//     const m = new Map();
//     (productsData || []).forEach((p) => {
//       const key = String(p.Id);
//       m.set(key, p.name);
//     });
//     return m;
//   }, [productsData]);

//   // ---- Normalizers ----
//   const getReceivedId = (rp) => String(rp.Id);
//   const getReceivedPrice = (rp) => Number(rp.price);
//   const getReceivedStock = (rp) => Number(rp.quantity);

//   const resolveProductName = (rp) => {
//     const pid = rp.product?.Id;

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
//       const exists = prev.find((x) => x.Id === p.Id);
//       if (exists) {
//         return prev.map((x) => (x.Id === p.Id ? { ...x, qty: x.qty + 1 } : x));
//       }
//       return [...prev, { Id: p.Id, name: p.name, price: p.price, qty: 1 }];
//     });
//   };

//   const removeFromCart = (Id) =>
//     setCart((prev) => prev.filter((x) => x.Id !== Id));

//   const updateQty = (Id, qty) => {
//     const n = Number(qty) || 0;
//     setCart((prev) =>
//       prev.map((x) => (x.Id === Id ? { ...x, qty: Math.max(1, n) } : x)),
//     );
//   };

//   const subTotal = useMemo(() => {
//     return cart.reduce(
//       (sum, x) => sum + (Number(x.price) || 0) * (Number(x.qty) || 0),
//       0,
//     );
//   }, [cart]);

//   const total = useMemo(() => {
//     const d = Number(discount) || 0;
//     const dc = Number(deliveryCharge) || 0;
//     return Math.max(0, subTotal - d + dc);
//   }, [subTotal, discount, deliveryCharge]);

//   // ✅ open/close drawer
//   const openPayment = () => {
//     setPaidAmount(total);
//     setIsPaymentOpen(true);
//   };
//   const closePayment = () => setIsPaymentOpen(false);

//   // ✅ payload builder (adjust keys if your backend expects different names)
//   const buildPosPayload = () => {
//     const items = cart.map((x) => ({
//       Id: x.Id, // <-- change key name if needed (receivedProductId/productId)
//       qty: Number(x.qty) || 0,
//       price: Number(x.price) || 0,
//       total: (Number(x.price) || 0) * (Number(x.qty) || 0),
//       name: x.name, // optional
//     }));

//     return {
//       date: sellDate,
//       name: customerName,
//       mobile: customerPhone,
//       address: customerAddress,
//       note,
//       subTotal: Number(subTotal) || 0,
//       discount: Number(discount) || 0,
//       deliveryCharge: Number(deliveryCharge) || 0,
//       total: Number(total) || 0,

//       paidAmount: Number(paidAmount) || 0,
//       dueAmount: Math.max(0, (Number(total) || 0) - (Number(paidAmount) || 0)),

//       items,
//     };
//   };

//   // ✅ Print handler
//   const handlePrint = useReactToPrint({
//     // v2 compatible
//     content: () => invoiceRef.current,

//     // v3 compatible (optional, harmless if ignored)
//     contentRef: invoiceRef,

//     documentTitle: invoiceData?.invoiceNo
//       ? String(invoiceData.invoiceNo)
//       : "invoice",
//     removeAfterPrint: true,
//   });

//   // ✅ PDF Download handler
//   const handleDownloadPdf = async () => {
//     try {
//       if (!invoiceRef.current) {
//         console.error("invoiceRef is null");
//         return;
//       }

//       const el = invoiceRef.current;

//       const canvas = await html2canvas(el, {
//         scale: 2,
//         useCORS: true,
//         backgroundColor: "#ffffff",
//         logging: false,
//       });

//       const imgData = canvas.toDataURL("image/png");

//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const pageHeight = pdf.internal.pageSize.getHeight();

//       const imgProps = pdf.getImageProperties(imgData);
//       const imgWidth = pageWidth;
//       const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

//       let heightLeft = imgHeight;
//       let position = 0;

//       pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;

//       while (heightLeft > 0) {
//         position = heightLeft - imgHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//         heightLeft -= pageHeight;
//       }

//       const filename = invoiceData?.invoiceNo
//         ? `${invoiceData.invoiceNo}.pdf`
//         : `invoice-${Date.now()}.pdf`;

//       // ✅ reliable download (Blob + <a>)
//       const blob = pdf.output("blob");
//       const url = URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = url;
//       a.download = filename;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();

//       URL.revokeObjectURL(url);
//     } catch (e) {
//       console.error("PDF download failed:", e);
//       alert("PDF generate করতে সমস্যা হচ্ছে। Console দেখুন.");
//     }
//   };

//   // ✅ Confirm Payment -> insert via API
//   const handleConfirmPayment = async () => {
//     try {
//       if (cart.length === 0) return;

//       const payload = buildPosPayload();

//       // ✅ your mutation response
//       const res = await insertPosReport(payload).unwrap();

//       // ✅ map invoice data from API (fallback to payload)
//       const invoice = res?.data ||
//         res?.posReport ||
//         res || {
//           invoiceNo: res?.invoiceNo || `INV-${Date.now()}`,
//           date: payload.date,
//           customer: {
//             name: payload.name,
//             mobile: payload.mobile,
//             address: payload.address,
//           },
//           subTotal: payload.subTotal,
//           discount: payload.discount,
//           deliveryCharge: payload.deliveryCharge,
//           total: payload.total,
//           paidAmount: payload.paidAmount,
//           dueAmount: payload.dueAmount,
//           items: payload.items,
//           note: payload.note,
//         };

//       // normalize if API returns flat fields
//       const normalizedInvoice = normalizeInvoice(invoice, payload);

//       setInvoiceData(normalizedInvoice);
//       setInvoiceOpen(true);

//       // reset
//       setCart([]);
//       setDiscount(0);
//       setDeliveryCharge(0);
//       setPaidAmount(0);
//       setNote("");
//       setCustomerName("");
//       setCustomerPhone("");
//       setCustomerAddress("");

//       closePayment();
//     } catch (err) {
//       console.error("POS insert failed:", err);
//     }
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
//                   const price = getReceivedPrice(p);
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
//                           <span>Price: {price}</span>
//                           <span>Stock: {stock}</span>
//                         </div>
//                       </div>

//                       <div className="flex items-center">
//                         <button
//                           onClick={() => addToCart({ Id: rid, name, price })}
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
//                         key={x.Id}
//                         className="border border-gray-200 rounded-lg p-3 flex items-center gap-3"
//                       >
//                         <div className="flex-1">
//                           <div className="text-sm font-semibold text-black">
//                             {x.name}
//                           </div>
//                           <div className="text-xs text-slate-700 mt-0.5">
//                             Price: {Number(x.price) || 0} ৳
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2">
//                           <input
//                             value={x.qty}
//                             onChange={(e) => updateQty(x.Id, e.target.value)}
//                             className="w-16 h-9 rounded-md border border-gray-200 px-2 text-black text-sm outline-none"
//                             type="number"
//                             min={1}
//                           />
//                           <div className="w-24 text-right text-sm font-semibold text-black">
//                             {(
//                               (Number(x.price) || 0) * (Number(x.qty) || 0)
//                             ).toFixed(0)}{" "}
//                             ৳
//                           </div>
//                           <button
//                             onClick={() => removeFromCart(x.Id)}
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
//                               className="py-2 rounded-lg px-3 bg-white border border-gray-200 text-black font-semibold hover:bg-gray-50 disabled:opacity-60"
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
//         onConfirm={handleConfirmPayment}
//         isSaving={isSavingPayment}
//       />

//       {/* ✅ Invoice Preview Modal */}
//       {/* <InvoiceModal
//         open={invoiceOpen}
//         onClose={() => setInvoiceOpen(false)}
//         invoice={invoiceData}
//         invoiceRef={invoiceRef}
//         onPrint={handlePrint}
//         onDownload={handleDownloadPdf}
//       /> */}

//       <InvoiceModal
//         open={invoiceOpen}
//         onClose={() => setInvoiceOpen(false)}
//         invoice={invoiceData}
//         invoiceRef={invoiceRef}
//         onPrint={handlePrint}
//         onDownload={handleDownloadPdf} // ✅ this must be passed
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
//   isSaving,
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
//                 disabled={isSaving}
//                 className="w-full h-12 rounded-xl bg-black text-white font-semibold hover:bg-black/90 disabled:opacity-60"
//               >
//                 {isSaving ? "Saving..." : "You have received the payment"}
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

// function InvoiceModal({
//   open,
//   onClose,
//   invoice,
//   invoiceRef,
//   onPrint,
//   // onDownload,
// }) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-[120]">
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} />

//       <div className="absolute inset-0 flex items-center justify-center p-4">
//         <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
//           {/* Header */}
//           <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
//             <div className="text-lg font-semibold text-slate-900">
//               Invoice Preview
//             </div>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={onPrint}
//                 className="h-10 px-4 rounded-xl bg-black text-white font-semibold hover:bg-black/90"
//                 type="button"
//                 disabled={!invoice}
//               >
//                 Print
//               </button>

//               {/* <button
//                 type="button"
//                 onClick={onDownload} // ✅ call prop function
//                 disabled={!invoice}
//                 className="h-10 px-4 rounded-xl border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 disabled:opacity-60"
//               >
//                 Download PDF
//               </button> */}

//               <button
//                 onClick={onClose}
//                 className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-700"
//                 type="button"
//               >
//                 ✕
//               </button>
//             </div>
//           </div>

//           {/* Body */}
//           <div className="p-6 max-h-[75vh] overflow-auto bg-slate-50">
//             <div
//               ref={invoiceRef}
//               className="pdf-safe bg-white rounded-xl p-6 border border-slate-200"
//             >
//               <div className="flex items-start justify-between gap-4">
//                 <div>
//                   <div className="text-2xl font-bold text-slate-900">
//                     INVOICE
//                   </div>

//                   <div className="text-sm text-slate-600 mt-1">
//                     Invoice No:{" "}
//                     <span className="font-semibold text-slate-900">
//                       {invoice?.invoiceNo || "N/A"}
//                     </span>
//                   </div>

//                   <div className="text-sm text-slate-600">
//                     Date:{" "}
//                     <span className="font-semibold text-slate-900">
//                       {invoice?.date || "N/A"}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="text-right">
//                   <div className="text-sm font-semibold text-slate-900">
//                     Kafela / Holy Gift
//                   </div>
//                   <div className="text-xs text-slate-600">POS Sale Invoice</div>
//                 </div>
//               </div>

//               <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="rounded-lg border border-slate-200 p-4">
//                   <div className="text-sm font-semibold text-slate-900 mb-2">
//                     Bill To
//                   </div>
//                   <div className="text-sm text-slate-700">
//                     {invoice?.customer?.name || "N/A"}
//                   </div>
//                   <div className="text-sm text-slate-700">
//                     {invoice?.customer?.mobile || "N/A"}
//                   </div>
//                   <div className="text-sm text-slate-700">
//                     {invoice?.customer?.address || "N/A"}
//                   </div>
//                 </div>

//                 <div className="rounded-lg border border-slate-200 p-4">
//                   <div className="text-sm font-semibold text-slate-900 mb-2">
//                     Payment
//                   </div>

//                   <div className="flex justify-between text-sm text-slate-700">
//                     <span>Total</span>
//                     <span className="font-semibold text-slate-900">
//                       {Number(invoice?.total || 0).toFixed(0)} ৳
//                     </span>
//                   </div>

//                   <div className="flex justify-between text-sm text-slate-700 mt-1">
//                     <span>Paid</span>
//                     <span className="font-semibold text-slate-900">
//                       {Number(invoice?.paidAmount || 0).toFixed(0)} ৳
//                     </span>
//                   </div>

//                   <div className="flex justify-between text-sm text-slate-700 mt-1">
//                     <span>Due</span>
//                     <span className="font-semibold text-red-600">
//                       {Number(invoice?.dueAmount || 0).toFixed(0)} ৳
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-5 overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="text-left bg-slate-100">
//                       <th className="px-3 py-2 border border-slate-200">
//                         Item
//                       </th>
//                       <th className="px-3 py-2 border border-slate-200">Qty</th>
//                       <th className="px-3 py-2 border border-slate-200">
//                         Price
//                       </th>
//                       <th className="px-3 py-2 border border-slate-200 text-right">
//                         Total
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(invoice?.items || []).map((it, idx) => (
//                       <tr key={idx}>
//                         <td className="px-3 py-2 border border-slate-200">
//                           {it?.name || "N/A"}
//                         </td>
//                         <td className="px-3 py-2 border border-slate-200">
//                           {Number(it?.qty || 0)}
//                         </td>
//                         <td className="px-3 py-2 border border-slate-200">
//                           {Number(it?.price || 0).toFixed(0)} ৳
//                         </td>
//                         <td className="px-3 py-2 border border-slate-200 text-right">
//                           {Number(it?.total || 0).toFixed(0)} ৳
//                         </td>
//                       </tr>
//                     ))}
//                     {(!invoice?.items || invoice.items.length === 0) && (
//                       <tr>
//                         <td
//                           colSpan={4}
//                           className="px-3 py-8 border border-slate-200 text-center text-slate-500"
//                         >
//                           No items
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="text-sm text-slate-700">
//                   <div className="font-semibold text-slate-900 mb-1">Note</div>
//                   <div className="rounded-lg border border-slate-200 p-3 min-h-[56px]">
//                     {invoice?.note || "—"}
//                   </div>
//                 </div>

//                 <div className="rounded-lg border border-slate-200 p-4">
//                   <div className="flex justify-between text-sm text-slate-700">
//                     <span>Subtotal</span>
//                     <span className="font-semibold text-slate-900">
//                       {Number(invoice?.subTotal || 0).toFixed(0)} ৳
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm text-slate-700 mt-1">
//                     <span>Discount</span>
//                     <span className="font-semibold text-slate-900">
//                       {Number(invoice?.discount || 0).toFixed(0)} ৳
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm text-slate-700 mt-1">
//                     <span>Delivery</span>
//                     <span className="font-semibold text-slate-900">
//                       {Number(invoice?.deliveryCharge || 0).toFixed(0)} ৳
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm text-slate-700 mt-2 pt-2 border-t border-slate-200">
//                     <span className="font-semibold text-slate-900">
//                       Grand Total
//                     </span>
//                     <span className="font-bold text-slate-900">
//                       {Number(invoice?.total || 0).toFixed(0)} ৳
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 text-center text-xs text-slate-500">
//                 Thank you for your purchase.
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
//             <button
//               onClick={onClose}
//               className="h-10 px-4 rounded-xl border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50"
//               type="button"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /**
//  * ✅ Normalize invoice shape so UI doesn't break depending on API response
//  * - API যদি flat fields দেয় (name/mobile/address) -> customer object বানায়
//  * - items যদি nested হয় -> basic map করে নেয়
//  */
// function normalizeInvoice(raw, payloadFallback) {
//   if (!raw) return null;

//   const inv = { ...raw };

//   // invoiceNo fallback
//   inv.invoiceNo =
//     inv.invoiceNo ||
//     inv.invoice_no ||
//     inv.voucherNo ||
//     inv.id ||
//     `INV-${Date.now()}`;

//   // date fallback
//   inv.date =
//     inv.date || inv.createdAt || inv.created_at || payloadFallback?.date;

//   // customer normalize
//   const customer =
//     inv.customer ||
//     inv.Customer ||
//     (inv.name || inv.mobile || inv.address
//       ? {
//           name: inv.name || "",
//           mobile: inv.mobile || "",
//           address: inv.address || "",
//         }
//       : null) ||
//     (payloadFallback
//       ? {
//           name: payloadFallback.name,
//           mobile: payloadFallback.mobile,
//           address: payloadFallback.address,
//         }
//       : null);

//   inv.customer = {
//     name: customer?.name || "",
//     mobile: customer?.mobile || "",
//     address: customer?.address || "",
//   };

//   // totals normalize
//   inv.subTotal = Number(
//     inv.subTotal ?? inv.sub_total ?? payloadFallback?.subTotal ?? 0,
//   );
//   inv.discount = Number(inv.discount ?? payloadFallback?.discount ?? 0);
//   inv.deliveryCharge = Number(
//     inv.deliveryCharge ??
//       inv.delivery_charge ??
//       payloadFallback?.deliveryCharge ??
//       0,
//   );
//   inv.total = Number(inv.total ?? payloadFallback?.total ?? 0);
//   inv.paidAmount = Number(
//     inv.paidAmount ?? inv.paid_amount ?? payloadFallback?.paidAmount ?? 0,
//   );
//   inv.dueAmount = Number(
//     inv.dueAmount ?? inv.due_amount ?? payloadFallback?.dueAmount ?? 0,
//   );

//   inv.note = inv.note ?? inv.remarks ?? payloadFallback?.note ?? "";

//   // items normalize
//   const itemsRaw =
//     inv.items || inv.Items || inv.products || payloadFallback?.items || [];
//   inv.items = (itemsRaw || []).map((it) => ({
//     name: it?.name || it?.productName || it?.product?.name || "N/A",
//     qty: Number(it?.qty ?? it?.quantity ?? 0),
//     price: Number(it?.price ?? it?.price ?? it?.unitPrice ?? 0),
//     total:
//       Number(it?.total ?? 0) || Number(it?.qty ?? 0) * Number(it?.price ?? 0),
//   }));

//   return inv;
// }

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Select from "react-select";

import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { useGetAllReceivedProductQuery } from "../../features/receivedProduct/receivedProduct";
import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";
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

  // ✅ Invoice modal state
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef(null);

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

  // ✅ NEW: Warranty (Drawer)
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warrantyValue, setWarrantyValue] = useState("");
  const [warrantyUnit, setWarrantyUnit] = useState("Day"); // Day | Month | Year

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
  const getReceivedPrice = (rp) => Number(rp.price);
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
      return [...prev, { Id: p.Id, name: p.name, price: p.price, qty: 1 }];
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
      (sum, x) => sum + (Number(x.price) || 0) * (Number(x.qty) || 0),
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

  // ✅ payload builder (NOW includes warranty)
  const buildPosPayload = () => {
    const items = cart.map((x) => ({
      Id: x.Id,
      qty: Number(x.qty) || 0,
      price: Number(x.price) || 0,
      total: (Number(x.price) || 0) * (Number(x.qty) || 0),
      name: x.name,
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

      // ✅ NEW
      warrantyValue: hasWarranty ? Number(warrantyValue || 0) : 0,
      warrantyUnit: hasWarranty ? warrantyUnit : null,

      items,
    };
  };

  // ✅ Print handler
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    contentRef: invoiceRef,
    documentTitle: invoiceData?.invoiceNo
      ? String(invoiceData.invoiceNo)
      : "invoice",
    removeAfterPrint: true,
  });

  // ✅ PDF Download handler
  const handleDownloadPdf = async () => {
    try {
      if (!invoiceRef.current) return;

      const el = invoiceRef.current;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = invoiceData?.invoiceNo
        ? `${invoiceData.invoiceNo}.pdf`
        : `invoice-${Date.now()}.pdf`;

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF download failed:", e);
      alert("PDF generate করতে সমস্যা হচ্ছে। Console দেখুন.");
    }
  };

  // ✅ Confirm Payment -> insert via API
  const handleConfirmPayment = async () => {
    try {
      if (cart.length === 0) return;

      const payload = buildPosPayload();

      const res = await insertPosReport(payload).unwrap();

      const invoice = res?.data ||
        res?.posReport ||
        res || {
          invoiceNo: res?.invoiceNo || `INV-${Date.now()}`,
          date: payload.date,
          customer: {
            name: payload.name,
            mobile: payload.mobile,
            address: payload.address,
          },
          subTotal: payload.subTotal,
          discount: payload.discount,
          deliveryCharge: payload.deliveryCharge,
          total: payload.total,
          paidAmount: payload.paidAmount,
          dueAmount: payload.dueAmount,
          items: payload.items,
          note: payload.note,

          // ✅ keep warranty in invoice too (optional)
          warrantyValue: payload.warrantyValue,
          warrantyUnit: payload.warrantyUnit,
        };

      const normalizedInvoice = normalizeInvoice(invoice, payload);

      setInvoiceData(normalizedInvoice);
      setInvoiceOpen(true);

      // reset
      setCart([]);
      setDiscount(0);
      setDeliveryCharge(0);
      setPaidAmount(0);
      setNote("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");

      // ✅ reset warranty
      setHasWarranty(false);
      setWarrantyValue("");
      setWarrantyUnit("Day");

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
                  const price = getReceivedPrice(p);
                  const stock = getReceivedStock(p);

                  return (
                    <div
                      key={rid}
                      className="px-4 py-4 flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <span className="text-lg">📦</span>
                      </div>

                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">
                          {name}
                        </div>

                        <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                          <span>Price: {price}</span>
                          <span>Stock: {stock}</span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <button
                          onClick={() => addToCart({ Id: rid, name, price })}
                          className="h-9 px-3 rounded-l-md bg-black text-white text-sm hover:bg-black/90 disabled:opacity-60"
                          type="button"
                          disabled={!rid}
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
                            Price: {Number(x.price) || 0} ৳
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
                              (Number(x.price) || 0) * (Number(x.qty) || 0)
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
        // ✅ NEW
        hasWarranty={hasWarranty}
        setHasWarranty={setHasWarranty}
        warrantyValue={warrantyValue}
        setWarrantyValue={setWarrantyValue}
        warrantyUnit={warrantyUnit}
        setWarrantyUnit={setWarrantyUnit}
      />

      {/* ✅ Invoice Preview Modal */}
      <InvoiceModal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        invoice={invoiceData}
        invoiceRef={invoiceRef}
        onPrint={handlePrint}
        onDownload={handleDownloadPdf}
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

  // ✅ NEW
  hasWarranty,
  setHasWarranty,
  warrantyValue,
  setWarrantyValue,
  warrantyUnit,
  setWarrantyUnit,
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

              {/* ✅ NEW: Warranty */}
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">
                    Warranty
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setHasWarranty((p) => !p);
                      if (hasWarranty) {
                        setWarrantyValue("");
                        setWarrantyUnit("Day");
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      hasWarranty ? "bg-indigo-600" : "bg-slate-300"
                    }`}
                    aria-pressed={hasWarranty}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                        hasWarranty ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {hasWarranty && (
                  <div className="border-t border-slate-200 px-4 py-3">
                    <label className="block text-xs text-slate-600 mb-1">
                      Warranty Duration
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={warrantyValue}
                        onChange={(e) => setWarrantyValue(e.target.value)}
                        placeholder="e.g. 30"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none
                     focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                      />

                      <select
                        value={warrantyUnit}
                        onChange={(e) => setWarrantyUnit(e.target.value)}
                        className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none
                     focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                      >
                        <option value="Day">Day</option>
                        <option value="Month">Month</option>
                        <option value="Year">Year</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
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

function InvoiceModal({
  open,
  onClose,
  invoice,
  invoiceRef,
  onPrint,
  onDownload,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="text-lg font-semibold text-slate-900">
              Invoice Preview
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onPrint}
                className="h-10 px-4 rounded-xl bg-black text-white font-semibold hover:bg-black/90"
                type="button"
                disabled={!invoice}
              >
                Print
              </button>

              <button
                type="button"
                onClick={onDownload}
                disabled={!invoice}
                className="h-10 px-4 rounded-xl border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 disabled:opacity-60"
              >
                Download PDF
              </button>

              <button
                onClick={onClose}
                className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-700"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[75vh] overflow-auto bg-slate-50">
            <div
              ref={invoiceRef}
              className="pdf-safe bg-white rounded-xl p-6 border border-slate-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    INVOICE
                  </div>

                  <div className="text-sm text-slate-600 mt-1">
                    Invoice No:{" "}
                    <span className="font-semibold text-slate-900">
                      {invoice?.invoiceNo || "N/A"}
                    </span>
                  </div>

                  <div className="text-sm text-slate-600">
                    Date:{" "}
                    <span className="font-semibold text-slate-900">
                      {invoice?.date || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    Kafela / Holy Gift
                  </div>
                  <div className="text-xs text-slate-600">POS Sale Invoice</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    Bill To
                  </div>
                  <div className="text-sm text-slate-700">
                    {invoice?.customer?.name || "N/A"}
                  </div>
                  <div className="text-sm text-slate-700">
                    {invoice?.customer?.mobile || "N/A"}
                  </div>
                  <div className="text-sm text-slate-700">
                    {invoice?.customer?.address || "N/A"}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    Payment
                  </div>

                  <div className="flex justify-between text-sm text-slate-700">
                    <span>Total</span>
                    <span className="font-semibold text-slate-900">
                      {Number(invoice?.total || 0).toFixed(0)} ৳
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-700 mt-1">
                    <span>Paid</span>
                    <span className="font-semibold text-slate-900">
                      {Number(invoice?.paidAmount || 0).toFixed(0)} ৳
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-700 mt-1">
                    <span>Due</span>
                    <span className="font-semibold text-red-600">
                      {Number(invoice?.dueAmount || 0).toFixed(0)} ৳
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-slate-100">
                      <th className="px-3 py-2 border border-slate-200">
                        Item
                      </th>
                      <th className="px-3 py-2 border border-slate-200">Qty</th>
                      <th className="px-3 py-2 border border-slate-200">
                        Price
                      </th>
                      <th className="px-3 py-2 border border-slate-200 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice?.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 border border-slate-200">
                          {it?.name || "N/A"}
                        </td>
                        <td className="px-3 py-2 border border-slate-200">
                          {Number(it?.qty || 0)}
                        </td>
                        <td className="px-3 py-2 border border-slate-200">
                          {Number(it?.price || 0).toFixed(0)} ৳
                        </td>
                        <td className="px-3 py-2 border border-slate-200 text-right">
                          {Number(it?.total || 0).toFixed(0)} ৳
                        </td>
                      </tr>
                    ))}
                    {(!invoice?.items || invoice.items.length === 0) && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-8 border border-slate-200 text-center text-slate-500"
                        >
                          No items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm text-slate-700">
                  <div className="font-semibold text-slate-900 mb-1">Note</div>
                  <div className="rounded-lg border border-slate-200 p-3 min-h-[56px]">
                    {invoice?.note || "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex justify-between text-sm text-slate-700">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      {Number(invoice?.subTotal || 0).toFixed(0)} ৳
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-700 mt-1">
                    <span>Discount</span>
                    <span className="font-semibold text-slate-900">
                      {Number(invoice?.discount || 0).toFixed(0)} ৳
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-700 mt-1">
                    <span>Delivery</span>
                    <span className="font-semibold text-slate-900">
                      {Number(invoice?.deliveryCharge || 0).toFixed(0)} ৳
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-700 mt-2 pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-900">
                      Grand Total
                    </span>
                    <span className="font-bold text-slate-900">
                      {Number(invoice?.total || 0).toFixed(0)} ৳
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-slate-500">
                Thank you for your purchase.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeInvoice(raw, payloadFallback) {
  if (!raw) return null;

  const inv = { ...raw };

  inv.invoiceNo =
    inv.invoiceNo ||
    inv.invoice_no ||
    inv.voucherNo ||
    inv.id ||
    `INV-${Date.now()}`;

  inv.date =
    inv.date || inv.createdAt || inv.created_at || payloadFallback?.date;

  const customer =
    inv.customer ||
    inv.Customer ||
    (inv.name || inv.mobile || inv.address
      ? {
          name: inv.name || "",
          mobile: inv.mobile || "",
          address: inv.address || "",
        }
      : null) ||
    (payloadFallback
      ? {
          name: payloadFallback.name,
          mobile: payloadFallback.mobile,
          address: payloadFallback.address,
        }
      : null);

  inv.customer = {
    name: customer?.name || "",
    mobile: customer?.mobile || "",
    address: customer?.address || "",
  };

  inv.subTotal = Number(
    inv.subTotal ?? inv.sub_total ?? payloadFallback?.subTotal ?? 0,
  );
  inv.discount = Number(inv.discount ?? payloadFallback?.discount ?? 0);
  inv.deliveryCharge = Number(
    inv.deliveryCharge ??
      inv.delivery_charge ??
      payloadFallback?.deliveryCharge ??
      0,
  );
  inv.total = Number(inv.total ?? payloadFallback?.total ?? 0);
  inv.paidAmount = Number(
    inv.paidAmount ?? inv.paid_amount ?? payloadFallback?.paidAmount ?? 0,
  );
  inv.dueAmount = Number(
    inv.dueAmount ?? inv.due_amount ?? payloadFallback?.dueAmount ?? 0,
  );

  inv.note = inv.note ?? inv.remarks ?? payloadFallback?.note ?? "";

  const itemsRaw =
    inv.items || inv.Items || inv.products || payloadFallback?.items || [];
  inv.items = (itemsRaw || []).map((it) => ({
    name: it?.name || it?.productName || it?.product?.name || "N/A",
    qty: Number(it?.qty ?? it?.quantity ?? 0),
    price: Number(it?.price ?? it?.unitPrice ?? 0),
    total:
      Number(it?.total ?? 0) || Number(it?.qty ?? 0) * Number(it?.price ?? 0),
  }));

  return inv;
}
