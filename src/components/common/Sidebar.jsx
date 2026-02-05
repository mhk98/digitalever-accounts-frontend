// import { useEffect, useMemo, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { Link, useLocation } from "react-router-dom";
// import { useGetAllLogoQuery } from "../../features/logo/logo";

// import {
//   LayoutDashboard,
//   Users,
//   UserCog,
//   BadgeDollarSign,
//   ShoppingBasket,
//   ReceiptText,
//   Store,
//   Warehouse,
//   Package,
//   ShoppingBag,
//   RotateCcw,
//   Truck,
//   ClipboardCheck,
//   TriangleAlert,
//   Wrench,
//   Megaphone,
//   BarChart3,
//   Search,
//   TrendingUp,
//   Globe,
//   Wallet,
//   BookOpen,
//   HandCoins,
//   CreditCard,
//   ArrowUpRight,
//   ArrowDownLeft,
//   Bell,
//   Settings,
//   Image,
//   DollarSign,
//   ShieldCheck,
//   PanelLeftClose,
//   PanelLeftOpen,
//   ChevronDown,
// } from "lucide-react";

// const SIDEBAR_ITEMS = [
//   {
//     name: "Overview",
//     icon: LayoutDashboard,
//     color: "#6366f1",
//     href: "/",
//     roles: [
//       "superAdmin",
//       "admin",
//       "manager",
//       "accountant",
//       "inventor",
//       "marketer",
//       "leader",
//     ],
//   },

//   {
//     name: "User Management",
//     icon: Users,
//     color: "#22c55e",
//     href: "/user-management",
//     roles: ["superAdmin", "admin"],
//   },

//   {
//     name: "Employee",
//     icon: UserCog,
//     color: "#22c55e",
//     href: "/employee",
//     roles: ["superAdmin", "admin", "accountant"],
//   },

//   {
//     name: "Assets",
//     icon: ShieldCheck,
//     color: "#ec4899",
//     roles: ["superAdmin", "admin", "inventor"],
//     children: [
//       {
//         name: "Purchase",
//         icon: ShoppingBasket,
//         href: "/assets-purchase",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//       {
//         name: "Sale",
//         icon: BadgeDollarSign,
//         href: "/assets-sale",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//       {
//         name: "Damage",
//         icon: TriangleAlert,
//         href: "/assets-damage",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//     ],
//   },

//   {
//     name: "DM Expense",
//     icon: Megaphone,
//     color: "#f97316",
//     roles: ["superAdmin", "admin", "marketer"],
//     children: [
//       {
//         name: "Meta",
//         icon: BarChart3,
//         href: "/meta",
//         roles: ["superAdmin", "admin", "marketer"],
//       },
//       {
//         name: "Google",
//         icon: Search,
//         href: "/google",
//         roles: ["superAdmin", "admin", "marketer"],
//       },
//       {
//         name: "TikTok",
//         icon: TrendingUp,
//         href: "/tiktok",
//         roles: ["superAdmin", "admin", "marketer"],
//       },
//       {
//         name: "SEO",
//         icon: Globe,
//         href: "/seo",
//         roles: ["superAdmin", "admin", "marketer"],
//       },
//     ],
//   },

//   {
//     name: "POS",
//     icon: ReceiptText,
//     color: "#6366f1",
//     href: "/pos",
//     roles: ["superAdmin", "admin", "inventor"],
//   },

//   {
//     name: "Inventory",
//     icon: Store,
//     color: "#8b5cf6",
//     roles: ["superAdmin", "admin", "inventor"],
//     children: [
//       {
//         name: "Warehouse",
//         icon: Warehouse,
//         href: "/warehouse",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//       {
//         name: "Supplier",
//         icon: Package,
//         href: "/supplier",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//       {
//         name: "Product",
//         icon: ShoppingBag,
//         href: "/products",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//       {
//         name: "Purchase Product",
//         icon: ShoppingBasket,
//         href: "/purchase-product",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//       {
//         name: "Purchase Return",
//         icon: RotateCcw,
//         href: "/purchase-return",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//       {
//         name: "Intransit Product",
//         icon: Truck,
//         href: "/intransit-product",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//       {
//         name: "Sales Return",
//         icon: RotateCcw,
//         href: "/sales-return",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//       {
//         name: "Confirm Order",
//         icon: ClipboardCheck,
//         href: "/confirm-order",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//       {
//         name: "Damage Product",
//         icon: TriangleAlert,
//         href: "/damage-product",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//       {
//         name: "Damage Repair",
//         icon: Wrench,
//         href: "/damage-repair",
//         roles: ["superAdmin", "admin", "inventor"],
//       },
//     ],
//   },

//   {
//     name: "Accounting",
//     icon: Wallet,
//     color: "#3b82f6",
//     roles: ["superAdmin", "admin", "accountant"],
//     children: [
//       {
//         name: "Book",
//         icon: BookOpen,
//         href: "/book",
//         roles: ["superAdmin", "admin", "accountant"],
//       },
//       {
//         name: "Petty Cash",
//         icon: HandCoins,
//         href: "/petty-cash",
//         roles: ["superAdmin", "admin", "accountant"],
//       },
//     ],
//   },

//   {
//     name: "Due Management",
//     icon: CreditCard,
//     color: "#3b82f6",
//     roles: ["superAdmin", "accountant"],
//     children: [
//       {
//         name: "Receivable",
//         icon: ArrowUpRight,
//         href: "/receivable",
//         roles: ["superAdmin", "accountant"],
//       },
//       {
//         name: "Payable",
//         icon: ArrowDownLeft,
//         href: "/payable",
//         roles: ["superAdmin", "accountant"],
//       },
//     ],
//   },

//   {
//     name: "Notifications",
//     icon: Bell,
//     color: "#60a5fa",
//     href: "/notifications",
//     roles: [
//       "superAdmin",
//       "admin",
//       "marketer",
//       "leader",
//       "inventor",
//       "accountant",
//       "staff",
//       "user",
//     ],
//   },

//   {
//     name: "Settings",
//     icon: Settings,
//     color: "#60a5fa",
//     roles: ["superAdmin", "admin", "accountant"],
//     children: [
//       {
//         name: "Salary",
//         icon: DollarSign,
//         href: "/salary",
//         roles: ["superAdmin", "admin", "accountant"],
//       },
//       {
//         name: "Logo",
//         icon: Image,
//         href: "/logo",
//         roles: ["superAdmin", "admin", "accountant"],
//       },
//     ],
//   },

//   {
//     name: "Profile",
//     icon: UserCog,
//     color: "#60a5fa",
//     href: "/profile",
//     roles: [
//       "superAdmin",
//       "admin",
//       "marketer",
//       "leader",
//       "inventor",
//       "accountant",
//       "staff",
//       "user",
//     ],
//   },
// ];

// const Tooltip = ({ show, text }) => {
//   return (
//     <AnimatePresence>
//       {show ? (
//         <motion.div
//           initial={{ opacity: 0, x: -6 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -6 }}
//           className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50"
//         >
//           <div className="px-3 py-2 rounded-lg text-xs font-medium text-white bg-gray-900 border border-gray-700 shadow-xl whitespace-nowrap">
//             {text}
//           </div>
//         </motion.div>
//       ) : null}
//     </AnimatePresence>
//   );
// };

// const Sidebar = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [openMenu, setOpenMenu] = useState(null);
//   const [hovered, setHovered] = useState(null);

//   // ✅ menu filter
//   const [menuQuery, setMenuQuery] = useState("");

//   const userRole = localStorage.getItem("role");
//   const { pathname } = useLocation();

//   const toggleMenu = (name) => setOpenMenu((p) => (p === name ? null : name));
//   const isActive = (href) => pathname === href;

//   // ✅ first role filter
//   const roleFiltered = useMemo(() => {
//     return SIDEBAR_ITEMS.filter((item) => item.roles.includes(userRole));
//   }, [userRole]);

//   // ✅ then search filter (parent + child)
//   const filteredItems = useMemo(() => {
//     const q = menuQuery.trim().toLowerCase();
//     if (!q) return roleFiltered;

//     return roleFiltered
//       .map((item) => {
//         if (!item.children) return item;

//         const childMatches = item.children.filter((c) =>
//           c.name.toLowerCase().includes(q),
//         );

//         // keep children also role-based
//         const childRoleMatches = childMatches.filter((c) =>
//           c.roles.includes(userRole),
//         );

//         return {
//           ...item,
//           children: childRoleMatches,
//         };
//       })
//       .filter((item) => {
//         const parentMatch = item.name.toLowerCase().includes(q);

//         if (!item.children) return parentMatch; // no children
//         if (parentMatch) return true; // parent matched
//         return item.children.length > 0; // any child matched
//       });
//   }, [roleFiltered, menuQuery, userRole]);

//   // ✅ auto open menu if searching & parent has children
//   // (optional, but feels nice)
//   const handleSearchChange = (v) => {
//     setMenuQuery(v);
//     const q = v.trim();
//     if (!q) return;

//     // open the first matched parent with children
//     const first = filteredItems.find((x) => x.children && x.children.length);
//     if (first) setOpenMenu(first.name);
//   };

//   const [logo, setLogo] = useState([]);

//   const { data, isLoading, isError, error } = useGetAllLogoQuery();

//   useEffect(() => {
//     if (isError) console.error("Error:", error);
//     if (!isLoading && data) {
//       setLogo(data?.data?.file ?? []);
//     }
//   }, [data, isLoading, isError, error]);

//   return (
//     <motion.aside
//       className="relative z-10 h-screen"
//       animate={{ width: isSidebarOpen ? 280 : 88 }}
//       transition={{ type: "spring", stiffness: 260, damping: 24 }}
//       style={{ width: isSidebarOpen ? 280 : 88 }}
//     >
//       <div className="h-full p-4 border-r border-gray-800/70 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
//         <div className="h-full rounded-2xl border border-gray-800/60 bg-gray-900/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden">
//           {/* Header */}
//           <div className="p-4 border-b border-gray-800/60">
//             <div className="flex items-center gap-3">
//               <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-800/60 shadow">
//                 <img
//                   src={` http://localhost:5000/${logo}`}
//                   alt="Logo"
//                   className="h-full w-full object-cover"
//                 />
//               </div>

//               <AnimatePresence>
//                 {isSidebarOpen ? (
//                   <motion.div
//                     initial={{ opacity: 0, x: -8 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: -8 }}
//                     className="flex-1"
//                   >
//                     <div className="text-white font-semibold leading-tight">
//                       Accounting
//                     </div>
//                     <div className="text-xs text-gray-400">Control panel</div>
//                   </motion.div>
//                 ) : null}
//               </AnimatePresence>

//               <button
//                 onClick={() => setIsSidebarOpen((p) => !p)}
//                 className="h-10 w-10 rounded-xl border border-gray-800/70 bg-gray-900/70 hover:bg-gray-800/70 text-gray-200 flex items-center justify-center transition"
//                 type="button"
//                 title={isSidebarOpen ? "Collapse" : "Expand"}
//               >
//                 {isSidebarOpen ? (
//                   <PanelLeftClose size={18} />
//                 ) : (
//                   <PanelLeftOpen size={18} />
//                 )}
//               </button>
//             </div>

//             {/* ✅ Search input (menu filter) */}
//             <AnimatePresence>
//               {isSidebarOpen ? (
//                 <motion.div
//                   initial={{ opacity: 0, y: -8 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -8 }}
//                   className="mt-4"
//                 >
//                   <div className="relative">
//                     {/* <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//                       <Search size={16} />
//                     </span> */}
//                     <input
//                       value={menuQuery}
//                       onChange={(e) => handleSearchChange(e.target.value)}
//                       placeholder="Search Menu..."
//                       className="w-full h-11 pl-9 pr-3 rounded-xl bg-gray-950/50 border border-gray-800/70 text-gray-100 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/30"
//                     />
//                   </div>

//                   {menuQuery.trim() ? (
//                     <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
//                       <span>
//                         Showing results for:{" "}
//                         <span className="text-gray-200">{menuQuery}</span>
//                       </span>
//                       <button
//                         type="button"
//                         onClick={() => setMenuQuery("")}
//                         className="text-indigo-300 hover:text-indigo-200"
//                       >
//                         Clear
//                       </button>
//                     </div>
//                   ) : null}
//                 </motion.div>
//               ) : null}
//             </AnimatePresence>
//           </div>

//           {/* Nav */}
//           <nav className="flex-1 overflow-y-auto px-2 py-3 sidebar-scroll">
//             {filteredItems.length === 0 ? (
//               <div className="px-3 py-6 text-sm text-gray-400">
//                 No menu found.
//               </div>
//             ) : null}

//             {filteredItems.map((item) => {
//               const Icon = item.icon;
//               const hasChildren = !!item.children?.length;
//               const menuOpen = openMenu === item.name;

//               const childActive = hasChildren
//                 ? item.children.some((c) => isActive(c.href))
//                 : false;

//               const parentActive = !hasChildren
//                 ? isActive(item.href)
//                 : childActive;

//               return (
//                 <div key={item.name} className="mb-2">
//                   {/* Menu Item */}
//                   <div className="relative">
//                     {hasChildren ? (
//                       <motion.button
//                         onClick={() => toggleMenu(item.name)}
//                         onMouseEnter={() => setHovered(item.name)}
//                         onMouseLeave={() => setHovered(null)}
//                         className={`w-full group flex items-center gap-3 px-3 py-3 rounded-xl transition relative ${
//                           parentActive
//                             ? "bg-gradient-to-r from-white/10 to-transparent border border-white/10"
//                             : "hover:bg-white/5"
//                         }`}
//                         type="button"
//                       >
//                         <span
//                           className={`absolute left-0 top-2 bottom-2 w-1 rounded-full transition ${
//                             parentActive ? "bg-indigo-400" : "bg-transparent"
//                           }`}
//                         />

//                         <span
//                           className={`h-10 w-10 rounded-xl flex items-center justify-center border transition ${
//                             parentActive
//                               ? "border-white/15 bg-white/10"
//                               : "border-gray-800/70 bg-gray-900/40 group-hover:bg-white/5"
//                           }`}
//                         >
//                           <Icon size={18} style={{ color: item.color }} />
//                         </span>

//                         {isSidebarOpen ? (
//                           <>
//                             <span className="text-sm font-medium text-gray-100 flex-1 text-left">
//                               {item.name}
//                             </span>
//                             <ChevronDown
//                               size={16}
//                               className={`text-gray-300 transition-transform ${
//                                 menuOpen ? "rotate-180" : ""
//                               }`}
//                             />
//                           </>
//                         ) : null}

//                         <Tooltip
//                           show={!isSidebarOpen && hovered === item.name}
//                           text={item.name}
//                         />
//                       </motion.button>
//                     ) : (
//                       <Link to={item.href}>
//                         <motion.div
//                           onMouseEnter={() => setHovered(item.name)}
//                           onMouseLeave={() => setHovered(null)}
//                           className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition relative ${
//                             parentActive
//                               ? "bg-gradient-to-r from-white/10 to-transparent border border-white/10"
//                               : "hover:bg-white/5"
//                           }`}
//                         >
//                           <span
//                             className={`absolute left-0 top-2 bottom-2 w-1 rounded-full transition ${
//                               parentActive ? "bg-indigo-400" : "bg-transparent"
//                             }`}
//                           />

//                           <span
//                             className={`h-10 w-10 rounded-xl flex items-center justify-center border transition ${
//                               parentActive
//                                 ? "border-white/15 bg-white/10"
//                                 : "border-gray-800/70 bg-gray-900/40 group-hover:bg-white/5"
//                             }`}
//                           >
//                             <Icon size={18} style={{ color: item.color }} />
//                           </span>

//                           {isSidebarOpen ? (
//                             <span className="text-sm font-medium text-gray-100">
//                               {item.name}
//                             </span>
//                           ) : null}

//                           <Tooltip
//                             show={!isSidebarOpen && hovered === item.name}
//                             text={item.name}
//                           />
//                         </motion.div>
//                       </Link>
//                     )}
//                   </div>

//                   {/* Submenu */}
//                   <AnimatePresence>
//                     {hasChildren && menuOpen && isSidebarOpen ? (
//                       <motion.div
//                         initial={{ height: 0, opacity: 0 }}
//                         animate={{ height: "auto", opacity: 1 }}
//                         exit={{ height: 0, opacity: 0 }}
//                         transition={{ duration: 0.2 }}
//                         className="mt-2 ml-2 pl-4 border-l border-gray-800/60"
//                       >
//                         <div className="space-y-1 pb-2">
//                           {item.children
//                             .filter((sub) => sub.roles.includes(userRole))
//                             .map((sub) => {
//                               const SubIcon = sub.icon;
//                               const activeSub = isActive(sub.href);

//                               return (
//                                 <Link key={sub.href} to={sub.href}>
//                                   <div
//                                     className={`group flex items-center gap-2 px-3 py-2 rounded-xl transition ${
//                                       activeSub
//                                         ? "bg-white/10 border border-white/10"
//                                         : "hover:bg-white/5"
//                                     }`}
//                                   >
//                                     <span
//                                       className={`h-7 w-7 rounded-lg flex items-center justify-center border transition ${
//                                         activeSub
//                                           ? "border-white/15 bg-white/10"
//                                           : "border-gray-800/70 bg-gray-900/40 group-hover:bg-white/5"
//                                       }`}
//                                     >
//                                       {SubIcon ? <SubIcon size={14} /> : null}
//                                     </span>

//                                     <span
//                                       className={`text-sm ${
//                                         activeSub
//                                           ? "text-white"
//                                           : "text-gray-200"
//                                       }`}
//                                     >
//                                       {sub.name}
//                                     </span>

//                                     {activeSub ? (
//                                       <span className="ml-auto h-2 w-2 rounded-full bg-indigo-400" />
//                                     ) : null}
//                                   </div>
//                                 </Link>
//                               );
//                             })}
//                         </div>
//                       </motion.div>
//                     ) : null}
//                   </AnimatePresence>
//                 </div>
//               );
//             })}
//           </nav>

//           {/* Footer */}
//           <div className="p-4 border-t border-gray-800/60">
//             <div className="rounded-xl border border-gray-800/70 bg-gray-900/50 px-3 py-3">
//               <div className="text-xs text-gray-400">Signed in as</div>
//               <div className="text-sm font-medium text-gray-100 truncate">
//                 {userRole || "user"}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         .sidebar-scroll::-webkit-scrollbar { width: 8px; }
//         .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 999px; }
//         .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
//       `}</style>
//     </motion.aside>
//   );
// };

// export default Sidebar;

import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useGetAllLogoQuery } from "../../features/logo/logo";

import {
  LayoutDashboard,
  Users,
  UserCog,
  BadgeDollarSign,
  ShoppingBasket,
  ReceiptText,
  Store,
  Warehouse,
  Package,
  ShoppingBag,
  RotateCcw,
  Truck,
  ClipboardCheck,
  TriangleAlert,
  Wrench,
  Megaphone,
  BarChart3,
  TrendingUp,
  Globe,
  Wallet,
  BookOpen,
  HandCoins,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  Settings,
  Image,
  DollarSign,
  ShieldCheck,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  {
    name: "Overview",
    icon: LayoutDashboard,
    color: "#6366f1",
    href: "/",
    roles: [
      "superAdmin",
      "admin",
      "manager",
      "accountant",
      "inventor",
      "marketer",
      "leader",
    ],
  },

  {
    name: "User Management",
    icon: Users,
    color: "#22c55e",
    href: "/user-management",
    roles: ["superAdmin", "admin"],
  },

  {
    name: "Payroll",
    icon: UserCog,
    color: "#22c55e",
    href: "/employee",
    roles: ["superAdmin", "admin", "accountant"],
  },

  {
    name: "Assets",
    icon: ShieldCheck,
    color: "#ec4899",
    roles: ["superAdmin", "admin", "inventor"],
    children: [
      {
        name: "Purchase",
        icon: ShoppingBasket,
        href: "/assets-purchase",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Sale",
        icon: BadgeDollarSign,
        href: "/assets-sale",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Damage",
        icon: TriangleAlert,
        href: "/assets-damage",
        roles: ["superAdmin", "admin", "inventor"],
      },
    ],
  },

  {
    name: "DM Expense",
    icon: Megaphone,
    color: "#f97316",
    roles: ["superAdmin", "admin", "marketer"],
    children: [
      {
        name: "Meta",
        icon: BarChart3,
        href: "/meta",
        roles: ["superAdmin", "admin", "marketer"],
      },
      {
        name: "Google",
        icon: Search,
        href: "/google",
        roles: ["superAdmin", "admin", "marketer"],
      },
      {
        name: "TikTok",
        icon: TrendingUp,
        href: "/tiktok",
        roles: ["superAdmin", "admin", "marketer"],
      },
      {
        name: "SEO",
        icon: Globe,
        href: "/seo",
        roles: ["superAdmin", "admin", "marketer"],
      },
    ],
  },

  {
    name: "POS",
    icon: ReceiptText,
    color: "#6366f1",
    href: "/pos",
    roles: ["superAdmin", "admin", "inventor"],
  },

  {
    name: "Inventory",
    icon: Store,
    color: "#8b5cf6",
    roles: ["superAdmin", "admin", "inventor"],
    children: [
      {
        name: "Warehouse",
        icon: Warehouse,
        href: "/warehouse",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Supplier",
        icon: Package,
        href: "/supplier",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Product",
        icon: ShoppingBag,
        href: "/products",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Purchase Requisition",
        icon: ShoppingBasket,
        href: "/purchase-requisition",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Received Product",
        icon: ShoppingBasket,
        href: "/purchase-product",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Received Return Product",
        icon: RotateCcw,
        href: "/purchase-return",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Intransit Product",
        icon: Truck,
        href: "/intransit-product",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Sales Return",
        icon: RotateCcw,
        href: "/sales-return",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Confirm Order",
        icon: ClipboardCheck,
        href: "/confirm-order",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Damage Product",
        icon: TriangleAlert,
        href: "/damage-product",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Damage Repairing",
        icon: Wrench,
        href: "/damage-repair",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Damage Repaired",
        icon: Wrench,
        href: "/damage-repaired",
        roles: ["superAdmin", "admin", "inventor"],
      },
    ],
  },

  {
    name: "Accounting",
    icon: Wallet,
    color: "#3b82f6",
    roles: ["superAdmin", "admin", "accountant"],
    children: [
      {
        name: "Book",
        icon: BookOpen,
        href: "/book",
        roles: ["superAdmin", "admin", "accountant"],
      },
      {
        name: "Petty Cash",
        icon: HandCoins,
        href: "/petty-cash",
        roles: ["superAdmin", "admin", "accountant"],
      },
    ],
  },

  {
    name: "Due Management",
    icon: CreditCard,
    color: "#3b82f6",
    roles: ["superAdmin", "accountant"],
    children: [
      {
        name: "Receivable",
        icon: ArrowUpRight,
        href: "/receivable",
        roles: ["superAdmin", "accountant"],
      },
      {
        name: "Payable",
        icon: ArrowDownLeft,
        href: "/payable",
        roles: ["superAdmin", "accountant"],
      },
    ],
  },

  {
    name: "Notifications",
    icon: Bell,
    color: "#60a5fa",
    href: "/notifications",
    roles: [
      "superAdmin",
      "admin",
      "marketer",
      "leader",
      "inventor",
      "accountant",
      "staff",
      "user",
    ],
  },

  {
    name: "Settings",
    icon: Settings,
    color: "#60a5fa",
    roles: ["superAdmin", "admin", "accountant"],
    children: [
      {
        name: "Payroll Fine",
        icon: DollarSign,
        href: "/salary",
        roles: ["superAdmin", "admin", "accountant"],
      },
      {
        name: "Logo",
        icon: Image,
        href: "/logo",
        roles: ["superAdmin", "admin", "accountant"],
      },
    ],
  },

  {
    name: "Profile",
    icon: UserCog,
    color: "#60a5fa",
    href: "/profile",
    roles: [
      "superAdmin",
      "admin",
      "marketer",
      "leader",
      "inventor",
      "accountant",
      "staff",
      "user",
    ],
  },
];

const Tooltip = ({ show, text }) => {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50"
        >
          <div className="px-3 py-2 rounded-lg text-xs font-medium text-white bg-slate-900 border border-slate-700 shadow-xl whitespace-nowrap">
            {text}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [hovered, setHovered] = useState(null);

  // ✅ menu filter
  const [menuQuery, setMenuQuery] = useState("");

  const userRole = localStorage.getItem("role") || "user";
  const { pathname } = useLocation();

  const toggleMenu = (name) => setOpenMenu((p) => (p === name ? null : name));
  const isActive = (href) => pathname === href;

  // ✅ first role filter
  const roleFiltered = useMemo(() => {
    return SIDEBAR_ITEMS.filter((item) => item.roles.includes(userRole));
  }, [userRole]);

  // ✅ then search filter (parent + child)
  const filteredItems = useMemo(() => {
    const q = menuQuery.trim().toLowerCase();
    if (!q) return roleFiltered;

    return roleFiltered
      .map((item) => {
        if (!item.children) return item;

        const childMatches = item.children
          .filter((c) => c.roles.includes(userRole))
          .filter((c) => c.name.toLowerCase().includes(q));

        return { ...item, children: childMatches };
      })
      .filter((item) => {
        const parentMatch = item.name.toLowerCase().includes(q);

        if (!item.children) return parentMatch;
        if (parentMatch) return true;
        return item.children.length > 0;
      });
  }, [roleFiltered, menuQuery, userRole]);

  // ✅ auto open first matched parent when searching (no stale state)
  useEffect(() => {
    const q = menuQuery.trim();
    if (!q) return;

    const firstWithChildren = filteredItems.find(
      (x) => x.children && x.children.length,
    );

    if (firstWithChildren) setOpenMenu(firstWithChildren.name);
  }, [menuQuery, filteredItems]);

  // ✅ logo
  const [logo, setLogo] = useState("");
  const { data, isLoading, isError, error } = useGetAllLogoQuery();

  useEffect(() => {
    if (isError) console.error("Error:", error);
    if (!isLoading && data) {
      setLogo(data?.data?.file ?? "");
    }
  }, [data, isLoading, isError, error]);

  return (
    <motion.aside
      className="relative z-10 min-h-dvh bg-slate-50"
      animate={{ width: isSidebarOpen ? 280 : 88 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      style={{ width: isSidebarOpen ? 280 : 88 }}
    >
      {/* ✅ Light dashboard sidebar shell */}
      <div className="min-h-dvh p-4 border-r border-slate-200 bg-slate-50">
        <div className="h-full rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                <img
                  src={logo ? ` http://localhost:5000/${logo}` : ""}
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              </div>

              <AnimatePresence>
                {isSidebarOpen ? (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="flex-1"
                  >
                    <div className="text-slate-900 font-semibold leading-tight">
                      Accounting
                    </div>
                    <div className="text-xs text-slate-500">Control panel</div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <button
                onClick={() => setIsSidebarOpen((p) => !p)}
                className="h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition"
                type="button"
                title={isSidebarOpen ? "Collapse" : "Expand"}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose size={18} />
                ) : (
                  <PanelLeftOpen size={18} />
                )}
              </button>
            </div>

            {/* Search input (menu filter) */}
            <AnimatePresence>
              {isSidebarOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4"
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search size={16} />
                    </span>

                    <input
                      value={menuQuery}
                      onChange={(e) => setMenuQuery(e.target.value)}
                      placeholder="Search Menu..."
                      className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {menuQuery.trim() ? (
                    <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                      <span>
                        Showing results for:{" "}
                        <span className="text-slate-900 font-medium">
                          {menuQuery}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setMenuQuery("")}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        Clear
                      </button>
                    </div>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 sidebar-scroll">
            {filteredItems.length === 0 ? (
              <div className="px-3 py-6 text-sm text-slate-500">
                No menu found.
              </div>
            ) : null}

            {filteredItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children?.length;
              const menuOpen = openMenu === item.name;

              const childActive = hasChildren
                ? item.children.some((c) => isActive(c.href))
                : false;

              const parentActive = !hasChildren
                ? isActive(item.href)
                : childActive;

              const parentBase =
                "w-full group flex items-center gap-3 px-3 py-3 rounded-xl transition relative";

              const parentState = parentActive
                ? "bg-indigo-50 border border-indigo-100"
                : "hover:bg-slate-50 border border-transparent";

              return (
                <div key={item.name} className="mb-2">
                  {/* Menu Item */}
                  <div className="relative">
                    {hasChildren ? (
                      <motion.button
                        onClick={() => toggleMenu(item.name)}
                        onMouseEnter={() => setHovered(item.name)}
                        onMouseLeave={() => setHovered(null)}
                        className={`${parentBase} ${parentState}`}
                        type="button"
                      >
                        <span
                          className={`absolute left-0 top-2 bottom-2 w-1 rounded-full transition ${
                            parentActive ? "bg-indigo-500" : "bg-transparent"
                          }`}
                        />

                        <span
                          className={`h-10 w-10 rounded-xl flex items-center justify-center border transition ${
                            parentActive
                              ? "border-indigo-200 bg-indigo-100"
                              : "border-slate-200 bg-white group-hover:bg-slate-50"
                          }`}
                        >
                          <Icon
                            size={18}
                            className={
                              parentActive
                                ? "text-indigo-600"
                                : "text-slate-600"
                            }
                          />
                        </span>

                        {isSidebarOpen ? (
                          <>
                            <span className="text-sm font-medium text-slate-800 flex-1 text-left">
                              {item.name}
                            </span>
                            <ChevronDown
                              size={16}
                              className={`text-slate-500 transition-transform ${
                                menuOpen ? "rotate-180" : ""
                              }`}
                            />
                          </>
                        ) : null}

                        <Tooltip
                          show={!isSidebarOpen && hovered === item.name}
                          text={item.name}
                        />
                      </motion.button>
                    ) : (
                      <Link to={item.href}>
                        <motion.div
                          onMouseEnter={() => setHovered(item.name)}
                          onMouseLeave={() => setHovered(null)}
                          className={`${parentBase} ${parentState}`}
                        >
                          <span
                            className={`absolute left-0 top-2 bottom-2 w-1 rounded-full transition ${
                              parentActive ? "bg-indigo-500" : "bg-transparent"
                            }`}
                          />

                          <span
                            className={`h-10 w-10 rounded-xl flex items-center justify-center border transition ${
                              parentActive
                                ? "border-indigo-200 bg-indigo-100"
                                : "border-slate-200 bg-white group-hover:bg-slate-50"
                            }`}
                          >
                            <Icon
                              size={18}
                              className={
                                parentActive
                                  ? "text-indigo-600"
                                  : "text-slate-600"
                              }
                            />
                          </span>

                          {isSidebarOpen ? (
                            <span className="text-sm font-medium text-slate-800">
                              {item.name}
                            </span>
                          ) : null}

                          <Tooltip
                            show={!isSidebarOpen && hovered === item.name}
                            text={item.name}
                          />
                        </motion.div>
                      </Link>
                    )}
                  </div>

                  {/* Submenu */}
                  <AnimatePresence>
                    {hasChildren && menuOpen && isSidebarOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 ml-2 pl-4 border-l border-slate-200"
                      >
                        <div className="space-y-1 pb-2">
                          {item.children
                            .filter((sub) => sub.roles.includes(userRole))
                            .map((sub) => {
                              const SubIcon = sub.icon;
                              const activeSub = isActive(sub.href);

                              return (
                                <Link key={sub.href} to={sub.href}>
                                  <div
                                    className={`group flex items-center gap-2 px-3 py-2 rounded-xl transition border ${
                                      activeSub
                                        ? "bg-indigo-50 border-indigo-100"
                                        : "hover:bg-slate-50 border-transparent"
                                    }`}
                                  >
                                    <span
                                      className={`h-7 w-7 rounded-lg flex items-center justify-center border transition ${
                                        activeSub
                                          ? "border-indigo-200 bg-indigo-100"
                                          : "border-slate-200 bg-white group-hover:bg-slate-50"
                                      }`}
                                    >
                                      {SubIcon ? (
                                        <SubIcon
                                          size={14}
                                          className={
                                            activeSub
                                              ? "text-indigo-600"
                                              : "text-slate-600"
                                          }
                                        />
                                      ) : null}
                                    </span>

                                    <span
                                      className={`text-sm ${
                                        activeSub
                                          ? "text-indigo-700"
                                          : "text-slate-700"
                                      }`}
                                    >
                                      {sub.name}
                                    </span>

                                    {activeSub ? (
                                      <span className="ml-auto h-2 w-2 rounded-full bg-indigo-500" />
                                    ) : null}
                                  </div>
                                </Link>
                              );
                            })}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
              <div className="text-xs text-slate-500">Signed in as</div>
              <div className="text-sm font-medium text-slate-900 truncate">
                {userRole}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 8px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.12); border-radius: 999px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </motion.aside>
  );
};

export default Sidebar;
