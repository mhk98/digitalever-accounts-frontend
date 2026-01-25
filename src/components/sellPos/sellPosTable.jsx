// import { useMemo, useState } from "react";
// import { motion } from "framer-motion";
// import { ArrowDown } from "lucide-react";

// const demoProducts = [
//   { id: 1, name: "Attar", price: 120, stock: 100 },
//   { id: 2, name: "khezur gur", price: 650, stock: 50, img: true },
// ];

// export default function SellPosTable() {
//   const [q, setQ] = useState("");
//   const [cart, setCart] = useState([]);
//   const [discount, setDiscount] = useState(0);
//   const [deliveryCharge, setDeliveryCharge] = useState(0);

//   const filtered = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     if (!s) return demoProducts;
//     return demoProducts.filter((p) => p.name.toLowerCase().includes(s));
//   }, [q]);

//   const addToCart = (p) => {
//     setCart((prev) => {
//       const exists = prev.find((x) => x.id === p.id);
//       if (exists) {
//         return prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
//       }
//       return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
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

//   const subTotal = useMemo(
//     () => cart.reduce((sum, x) => sum + x.price * x.qty, 0),
//     [cart],
//   );

//   const total = useMemo(() => {
//     const d = Number(discount) || 0;
//     const dc = Number(deliveryCharge) || 0;
//     return Math.max(0, subTotal - d + dc);
//   }, [subTotal, discount, deliveryCharge]);

//   return (
//     <motion.div
//       className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.15 }}
//     >
//       <div className="grid grid-cols-12 gap-4">
//         {/* Left panel */}
//         <div className="col-span-12 lg:col-span-6">
//           <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//             <div className="px-4 py-3 border-b border-gray-200">
//               <div className="text-sm font-semibold text-white">
//                 Select a product to sell
//               </div>
//               <div className="mt-3 flex items-center gap-2">
//                 <div className="flex-1 relative">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//                     🔍
//                   </span>
//                   <input
//                     value={q}
//                     onChange={(e) => setQ(e.target.value)}
//                     placeholder="Search..."
//                     className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-black/10"
//                   />
//                 </div>

//                 <button
//                   className="h-10 w-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
//                   type="button"
//                 >
//                   🖨️
//                 </button>

//                 <button
//                   className="h-10 w-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-black"
//                   type="button"
//                 >
//                   +
//                 </button>
//               </div>
//             </div>

//             <div className="divide-y divide-gray-100">
//               {filtered.map((p) => (
//                 <div key={p.id} className="px-4 py-4 flex items-center gap-3">
//                   <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center ">
//                     {p.img ? (
//                       <span className="text-xs">img</span>
//                     ) : (
//                       <span className="text-lg">📦</span>
//                     )}
//                   </div>

//                   <div className="flex-1">
//                     <div className="text-sm font-semibold text-white">
//                       {p.name}
//                     </div>
//                     <div className="mt-1 flex items-center justify-between text-xs text-white">
//                       <span>Price: {p.price}</span>
//                       <span>Stock: {p.stock}</span>
//                     </div>
//                   </div>

//                   <div className="flex items-center">
//                     <button
//                       onClick={() => addToCart(p)}
//                       className="h-9 px-3 rounded-l-md bg-black text-white text-sm hover:bg-black/90"
//                       type="button"
//                     >
//                       Add
//                     </button>
//                     <button
//                       className="h-9 w-9 rounded-r-md bg-black text-white border-l border-white/15 hover:bg-black/90"
//                       type="button"
//                     >
//                       ▾
//                     </button>
//                   </div>
//                 </div>
//               ))}

//               {filtered.length === 0 ? (
//                 <div className="px-4 py-10 text-center text-sm text-gray-500">
//                   No products found
//                 </div>
//               ) : null}
//             </div>
//           </div>
//         </div>

//         {/* Right panel */}
//         <div className="col-span-12 lg:col-span-6">
//           <div className="rounded-lg bg-gray-800 bg-opacity-50 shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[80vh]">
//             <div className="flex-1 p-4">
//               {cart.length === 0 ? (
//                 <div className="h-full flex items-start justify-center pt-16">
//                   <div className="text-gray-500 text-sm text-white">
//                     No product selected
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {cart.map((x) => (
//                     <div
//                       key={x.id}
//                       className="border border-gray-200 rounded-lg p-3 flex items-center gap-3"
//                     >
//                       <div className="flex-1">
//                         <div className="text-sm font-semibold text-white">
//                           {x.name}
//                         </div>
//                         <div className="text-xs text-white mt-0.5">
//                           Prices: {x.price} ৳
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <input
//                           value={x.qty}
//                           onChange={(e) => updateQty(x.id, e.target.value)}
//                           className="w-16 h-9 rounded-md border border-gray-200 px-2 text-sm outline-none focus:ring-2 "
//                           type="number"
//                           min={1}
//                         />
//                         <div className="w-24 text-right text-sm font-semibold">
//                           {(x.price * x.qty).toFixed(0)} ৳
//                         </div>
//                         <button
//                           onClick={() => removeFromCart(x.id)}
//                           className="h-9 px-3 rounded-md border border-gray-200 hover:bg-gray-50 text-sm"
//                           type="button"
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="border-t border-gray-200">
//               <div className="px-4 py-3">
//                 <div className="flex justify-center -mt-6">
//                   <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow">
//                     <ArrowDown />
//                   </div>
//                 </div>

//                 <div className="mt-3 space-y-3 ">
//                   <Row
//                     label="Subtotal"
//                     right={
//                       <span className="font-semibold text-white">
//                         {subTotal.toFixed(0)} ৳
//                       </span>
//                     }
//                   />

//                   <Row
//                     label="Discount"
//                     right={
//                       <div className="flex items-center gap-2">
//                         <input
//                           value={discount}
//                           onChange={(e) => setDiscount(e.target.value)}
//                           className="h-9 w-28 rounded-md border border-gray-200 px-2 text-sm text-right outline-none focus:ring-2 focus:ring-black/10"
//                           type="number"
//                           min={0}
//                         />
//                         <div className="h-9 w-12 rounded-md border border-gray-200 flex items-center justify-center text-sm">
//                           ৳
//                         </div>
//                       </div>
//                     }
//                   />

//                   <Row
//                     label="Delivery Charge"
//                     right={
//                       <input
//                         value={deliveryCharge}
//                         onChange={(e) => setDeliveryCharge(e.target.value)}
//                         className="h-9 w-44 rounded-md border border-gray-200 px-2 text-sm text-right outline-none focus:ring-2 focus:ring-black/10"
//                         type="number"
//                         min={0}
//                       />
//                     }
//                   />

//                   <Row
//                     label="Total"
//                     right={
//                       <span className="font-semibold text-red-500">
//                         {total.toFixed(0)} ৳
//                       </span>
//                     }
//                   />
//                 </div>
//               </div>

//               <div className="px-4 pb-4">
//                 <div className="grid grid-cols-2 gap-3">
//                   <button
//                     className="h-12 rounded-lg bg-white text-black font-semibold "
//                     type="button"
//                   >
//                     Cash →
//                   </button>
//                   <button
//                     className="h-12 rounded-lg bg-white text-black font-semibold "
//                     type="button"
//                   >
//                     Due →
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>{" "}
//     </motion.div>
//   );
// }

// function Row({ label, right }) {
//   return (
//     <div className="flex items-center justify-between text-sm">
//       <div className="text-white">{label}</div>
//       <div className="text-white">{right}</div>
//     </div>
//   );
// }

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";

const demoProducts = [
  { id: 1, name: "Attar", price: 120, stock: 100 },
  { id: 2, name: "khezur gur", price: 650, stock: 50, img: true },
];

export default function SellPosTable() {
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return demoProducts;
    return demoProducts.filter((p) => p.name.toLowerCase().includes(s));
  }, [q]);

  const addToCart = (p) => {
    setCart((prev) => {
      const exists = prev.find((x) => x.id === p.id);
      if (exists) {
        return prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((x) => x.id !== id));

  const updateQty = (id, qty) => {
    const n = Number(qty) || 0;
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: Math.max(1, n) } : x)),
    );
  };

  const subTotal = useMemo(
    () => cart.reduce((sum, x) => sum + x.price * x.qty, 0),
    [cart],
  );

  const total = useMemo(() => {
    const d = Number(discount) || 0;
    const dc = Number(deliveryCharge) || 0;
    return Math.max(0, subTotal - d + dc);
  }, [subTotal, discount, deliveryCharge]);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="grid grid-cols-12 gap-4">
        {/* Left panel */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="text-sm font-semibold text-white">
                Select a product to sell
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <button
                  className="h-10 w-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
                  type="button"
                >
                  🖨️
                </button>

                <button
                  className="h-10 w-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-black"
                  type="button"
                >
                  +
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <div key={p.id} className="px-4 py-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center ">
                    {p.img ? (
                      <span className="text-xs">img</span>
                    ) : (
                      <span className="text-lg">📦</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">
                      {p.name}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-white">
                      <span>Price: {p.price}</span>
                      <span>Stock: {p.stock}</span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <button
                      onClick={() => addToCart(p)}
                      className="h-9 px-3 rounded-l-md bg-black text-white text-sm hover:bg-black/90"
                      type="button"
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
              ))}

              {filtered.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-gray-500">
                  No products found
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg bg-gray-800 bg-opacity-50 shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[80vh]">
            <div className="flex-1 p-4">
              {cart.length === 0 ? (
                <div className="h-full flex items-start justify-center pt-16">
                  <div className="text-white text-sm">No product selected</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((x) => (
                    <div
                      key={x.id}
                      className="border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">
                          {x.name}
                        </div>
                        <div className="text-xs text-white mt-0.5">
                          Prices: {x.price} ৳
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          value={x.qty}
                          onChange={(e) => updateQty(x.id, e.target.value)}
                          className="w-16 h-9 rounded-md border border-gray-200 px-2 text-sm outline-none"
                          type="number"
                          min={1}
                        />
                        <div className="w-24 text-right text-sm font-semibold text-white">
                          {(x.price * x.qty).toFixed(0)} ৳
                        </div>
                        <button
                          onClick={() => removeFromCart(x.id)}
                          className="h-9 px-3 rounded-md border border-gray-200 hover:bg-gray-50 text-sm text-white"
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
                            <span className="font-semibold text-white">
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
                                onChange={(e) => setDiscount(e.target.value)}
                                className="h-9 w-28 rounded-md border border-gray-200 px-2 text-sm text-right outline-none"
                                type="number"
                                min={0}
                              />
                              <div className="h-9 w-12 rounded-md border border-gray-200 flex items-center justify-center text-sm text-white">
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
                                setDeliveryCharge(e.target.value)
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

                        <div className="pt-2">
                          <div className="grid grid-cols-2 gap-3 pb-3">
                            <button
                              className="h-12 rounded-lg bg-white text-black font-semibold"
                              type="button"
                            >
                              Cash →
                            </button>
                            <button
                              className="h-12 rounded-lg bg-white text-black font-semibold"
                              type="button"
                            >
                              Due →
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* summary বন্ধ থাকলে শুধু total/CTA দেখাতে চাইলে এখানে minimal bar রাখতে পারো (optional) */}
            </div>
          </div>
        </div>
      </div>{" "}
    </motion.div>
  );
}

function Row({ label, right }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-white">{label}</div>
      <div className="text-white">{right}</div>
    </div>
  );
}
