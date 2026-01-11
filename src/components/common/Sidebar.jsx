// import {
//   BarChart2,
//   Settings,
//   ShoppingBasket,
//   TrendingUp,
//   Users,
//   ChevronDown
// } from "lucide-react";
// import { useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import logo from "../../images/logo.jpg";

// // Sidebar configuration with submenus
// const SIDEBAR_ITEMS = [
//   {
//     name: "Overview",
//     icon: BarChart2,
//     color: "#6366f1",
//     href: "/",
//     roles: ["superAdmin", "admin", "manager", "staff"],
//   },

//    {
//     name: "Office Assets",
//     icon: Users,
//     color: "#EC4899",
//     href: "/suppliers",
//     roles: ["superAdmin", "admin"],
//   },
//    {
//     name: "Meta Expense",
//     icon: Users,
//     color: "#EC4899",
//     href: "/suppliers",
//     roles: ["superAdmin", "admin"],
//   },

//   {
//     name: "Inventory",
//     icon: ShoppingBasket,
//     color: "#8B5CF6",
//     roles: ["superAdmin", "admin", "manager"],
//     children: [
//       {
//         name: "Product",
//         href: "/products",
//         roles: ["superAdmin", "admin", "manager"],
//       },
//       {
//         name: "Received Product",
//         href: "/received-product",
//         roles: ["superAdmin", "admin", "manager"],
//       },
//       {
//         name: "Intransite Product",
//         href: "/intransit-product",
//         roles: ["superAdmin", "admin", "manager"],
//       },
//       {
//         name: "Return Product",
//         href: "/return-product",
//         roles: ["superAdmin", "admin", "manager"],
//       },

//     ],
//   },

//   {
//     name: "Sales",
//     icon: TrendingUp,
//     color: "#3B82F6",
//     roles: ["superAdmin", "admin"],
//     children: [
//       {
//         name: "Confirm Order",
//         href: "/confirm-order",
//         roles: ["superAdmin", "admin"],
//       },

//     ],
//   },
//   {
//     name: "Accounting",
//     icon: TrendingUp,
//     color: "#3B82F6",
//     roles: ["superAdmin", "admin"],
//     children: [
//       {
//         name: "Cash In",
//         href: "/accounting",
//         roles: ["superAdmin", "admin"],
//       },
//       {
//         name: "Petty Cash",
//         href: "/accounting",
//         roles: ["superAdmin", "admin"],
//       },
//       {
//         name: "Expense",
//         href: "/accounting/reports",
//         roles: ["superAdmin", "admin"],
//       },
//     ],
//   },

//   {
//     name: "Profile",
//     icon: Settings,
//     color: "#3B82F6",
//     href: "/profile",
//     roles: ["superAdmin", "admin", "manager", "staff"],
//   },
// ];

// const Sidebar = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [openMenu, setOpenMenu] = useState(null);

//   const userRole = localStorage.getItem("role");

//   const toggleMenu = (name) => {
//     setOpenMenu(openMenu === name ? null : name);
//   };

//   return (
//     <motion.div
//       className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
//         isSidebarOpen ? "w-64" : "w-20"
//       }`}
//       animate={{ width: isSidebarOpen ? 256 : 80 }}
//     >
//       <div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">

//         {/* Logo */}
//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//           className="p-2 max-w-fit"
//         >
//           <img className="logo" src={logo} alt="Logo" />
//         </motion.button>

//         {/* Menu */}
//         <nav className="mt-8 flex-grow">
//           {SIDEBAR_ITEMS
//             .filter(item => item.roles.includes(userRole))
//             .map((item) => (
//               <div key={item.name}>

//                 {/* Main menu item */}
//                 <motion.div
//                   onClick={() => item.children ? toggleMenu(item.name) : null}
//                   className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2 cursor-pointer"
//                 >
//                   <item.icon size={20} style={{ color: item.color, minWidth: 20 }} />

//                   {isSidebarOpen && (
//                     <span className="ml-4 flex-1">{item.name}</span>
//                   )}

//                   {item.children && isSidebarOpen && (
//                     <ChevronDown
//                       size={16}
//                       className={`transition-transform ${
//                         openMenu === item.name ? "rotate-180" : ""
//                       }`}
//                     />
//                   )}
//                 </motion.div>

//                 {/* Submenu */}
//                 <AnimatePresence>
//                   {item.children && openMenu === item.name && isSidebarOpen && (
//                     <motion.div
//                       initial={{ height: 0, opacity: 0 }}
//                       animate={{ height: "auto", opacity: 1 }}
//                       exit={{ height: 0, opacity: 0 }}
//                       className="ml-8 overflow-hidden"
//                     >
//                       {item.children
//                         .filter(sub => sub.roles.includes(userRole))
//                         .map(sub => (
//                           <Link key={sub.href} to={sub.href}>
//                             <div className="p-2 text-sm rounded-lg hover:bg-gray-700 mb-1">
//                               {sub.name}
//                             </div>
//                           </Link>
//                         ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//               </div>
//             ))}
//         </nav>
//       </div>
//     </motion.div>
//   );
// };

// export default Sidebar;

import {
  LayoutDashboard,
  Building2,
  Receipt,
  Boxes,
  Package,
  PackageCheck,
  Truck,
  RotateCcw,
  Wallet,
  ArrowUpCircle,
  UserCog,
  ChevronDown,
  ClipboardCheck,
} from "lucide-react";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../../images/logo.jpg";

const SIDEBAR_ITEMS = [
  {
    name: "Overview",
    icon: LayoutDashboard,
    color: "#6366f1",
    href: "/",
    roles: ["superAdmin", "admin", "manager", "staff"],
  },
  {
    name: "Assets",
    icon: Building2,
    color: "#EC4899",
    roles: ["superAdmin", "admin"],
    children: [
      {
        name: "Purchase",
        icon: Receipt,
        href: "/assets-purchase",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Sale",
        icon: Receipt,
        href: "/assets-sale",
        roles: ["superAdmin", "admin"],
      },
    ],
  },
  {
    name: "Digital Marketing Expense",
    icon: Receipt,
    color: "#EC4899",
    roles: ["superAdmin", "admin"],
    children: [
      {
        name: "Meta",
        icon: Receipt,
        href: "/meta",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Google",
        icon: Receipt,
        href: "/google",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "TikTok",
        icon: Receipt,
        href: "/tiktok",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "SEO",
        icon: Receipt,
        href: "/seo",
        roles: ["superAdmin", "admin"],
      },
    ],
  },
  {
    name: "Inventory",
    icon: Boxes,
    color: "#8B5CF6",
    roles: ["superAdmin", "admin", "manager"],
    children: [
      {
        name: "Product",
        icon: Package,
        href: "/products",
        roles: ["superAdmin", "admin", "manager"],
      },
      {
        name: "Purchase Product",
        icon: PackageCheck,
        href: "/purchase-product",
        roles: ["superAdmin", "admin", "manager"],
      },
      {
        name: "Purchase Return",
        icon: PackageCheck,
        href: "/purchase-return",
        roles: ["superAdmin", "admin", "manager"],
      },
      {
        name: "Intransit Product",
        icon: Truck,
        href: "/intransit-product",
        roles: ["superAdmin", "admin", "manager"],
      },
      {
        name: "Sales Return",
        icon: RotateCcw,
        href: "/sales-return",
        roles: ["superAdmin", "admin", "manager"],
      },
      {
        name: "Confirm Order",
        icon: ClipboardCheck,
        href: "/confirm-order",
        roles: ["superAdmin", "admin"],
      },
    ],
  },
  {
    name: "Accounting",
    icon: Wallet,
    color: "#3B82F6",
    roles: ["superAdmin", "admin"],
    children: [
      // {
      //   name: "Cash In",
      //   icon: ArrowDownCircle,
      //   href: "/cash-in",
      //   roles: ["superAdmin", "admin"],
      // },
      // {
      //   name: "Petty Cash",
      //   icon: Coins,
      //   href: "/petty-cash",
      //   roles: ["superAdmin", "admin"],
      // },
      // {
      //   name: "Expense",
      //   icon: ArrowUpCircle,
      //   href: "/expense",
      //   roles: ["superAdmin", "admin"],
      // },
      {
        name: "Book",
        icon: ArrowUpCircle,
        href: "/book",
        roles: ["superAdmin", "admin"],
      },
    ],
  },

  {
    name: "Due Management",
    icon: Wallet,
    color: "#3B82F6",
    roles: ["superAdmin", "admin"],
    children: [
      {
        name: "Receivable",
        icon: ArrowUpCircle,
        href: "/receivable",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Payable",
        icon: ArrowUpCircle,
        href: "/payable",
        roles: ["superAdmin", "admin"],
      },
    ],
  },
  {
    name: "Profile",
    icon: UserCog,
    color: "#3B82F6",
    href: "/profile",
    roles: ["superAdmin", "admin", "manager", "staff"],
  },
];

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);

  const userRole = localStorage.getItem("role");

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  return (
    <motion.div
      className={`relative z-10 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className="h-full bg-gray-800 p-4 flex flex-col border-r border-gray-700">
        {/* Logo */}
        <motion.button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 max-w-fit"
        >
          <img src={logo} alt="Logo" />
        </motion.button>

        {/* Menu */}
        <nav className="mt-8 flex-grow">
          {SIDEBAR_ITEMS.filter((item) => item.roles.includes(userRole)).map(
            (item) => (
              <div key={item.name}>
                {/* ✅ MENU WITHOUT SUBMENU */}
                {!item.children && (
                  <Link to={item.href}>
                    <motion.div className="flex items-center p-4 rounded-lg hover:bg-gray-700 mb-2">
                      <item.icon size={20} style={{ color: item.color }} />
                      {isSidebarOpen && (
                        <span className="ml-4">{item.name}</span>
                      )}
                    </motion.div>
                  </Link>
                )}

                {/* ✅ MENU WITH SUBMENU */}
                {item.children && (
                  <>
                    <motion.div
                      onClick={() => toggleMenu(item.name)}
                      className="flex items-center p-4 rounded-lg hover:bg-gray-700 mb-2 cursor-pointer"
                    >
                      <item.icon size={20} style={{ color: item.color }} />
                      {isSidebarOpen && (
                        <>
                          <span className="ml-4 flex-1">{item.name}</span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${
                              openMenu === item.name ? "rotate-180" : ""
                            }`}
                          />
                        </>
                      )}
                    </motion.div>

                    <AnimatePresence>
                      {openMenu === item.name && isSidebarOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-8"
                        >
                          {item.children
                            .filter((sub) => sub.roles.includes(userRole))
                            .map((sub) => (
                              <Link key={sub.href} to={sub.href}>
                                <div className="p-2 hover:bg-gray-700 rounded mb-1">
                                  {sub.name}
                                </div>
                              </Link>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            )
          )}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;
