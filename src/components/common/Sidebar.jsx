import {
  LayoutDashboard,
  Package,
  Truck,
  RotateCcw,
  Wallet,
  UserCog,
  ChevronDown,
  ClipboardCheck,
  Users,
  ShoppingBasket,
  BadgeDollarSign,
  BarChart3,
  Store,
  Building2,
  Megaphone,
  Search,
  CreditCard,
  BookOpen,
  HandCoins,
  TrendingUp,
  TrendingDown,
  PackageSearch,
  TriangleAlert,
} from "lucide-react";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logo from "../../images/logo.jpg";

/**
 * ✅ Icon rules:
 * - parent menu: bigger/section icon
 * - submenu: specific icon by meaning
 * - keep colors as you already used
 */

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
    color: "#6366f1",
    href: "/user-management",
    roles: ["superAdmin", "admin"],
  },
  {
    name: "Assets",
    icon: Building2,
    color: "#EC4899",
    roles: ["superAdmin", "admin"],
    children: [
      {
        name: "Purchase",
        icon: ShoppingBasket,
        href: "/assets-purchase",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Sale",
        icon: BadgeDollarSign,
        href: "/assets-sale",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Damage",
        icon: TriangleAlert,
        href: "/assets-damage",
        roles: ["superAdmin", "admin"],
      },
    ],
  },
  {
    name: "Digital Marketing Expense",
    icon: Megaphone,
    color: "#EC4899",
    roles: ["superAdmin", "admin"],
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
        icon: PackageSearch,
        href: "/seo",
        roles: ["superAdmin", "admin", "marketer"],
      },
    ],
  },
  {
    name: "Inventory",
    icon: Store,
    color: "#8B5CF6",
    roles: ["superAdmin", "admin", "inventor"],
    children: [
      {
        name: "Product",
        icon: Package,
        href: "/products",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Purchase Product",
        icon: ShoppingBasket,
        href: "/purchase-product",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Purchase Return",
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
    ],
  },
  {
    name: "Accounting",
    icon: Wallet,
    color: "#3B82F6",
    roles: ["superAdmin", "admin"],
    children: [
      {
        name: "Book",
        icon: BookOpen,
        href: "/book",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Petty Cash",
        icon: HandCoins,
        href: "/petty-cash",
        roles: ["superAdmin", "admin", "inventor"],
      },
    ],
  },
  {
    name: "Due Management",
    icon: CreditCard,
    color: "#3B82F6",
    roles: ["superAdmin", "accountant"],
    children: [
      {
        name: "Receivable",
        icon: TrendingUp,
        href: "/receivable",
        roles: ["superAdmin", "accountant"],
      },
      {
        name: "Payable",
        icon: TrendingDown,
        href: "/payable",
        roles: ["superAdmin", "accountant"],
      },
    ],
  },
  {
    name: "Profile",
    icon: UserCog,
    color: "#3B82F6",
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

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);

  const userRole = localStorage.getItem("role");
  const { pathname } = useLocation();

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const isActive = (href) => pathname === href;

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
                    <motion.div
                      className={`flex items-center p-4 rounded-lg mb-2 hover:bg-gray-700 ${
                        isActive(item.href) ? "bg-gray-700" : ""
                      }`}
                    >
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
                                <div
                                  className={`p-2 rounded mb-1 flex items-center gap-2 hover:bg-gray-700 ${
                                    isActive(sub.href) ? "bg-gray-700" : ""
                                  }`}
                                >
                                  {sub.icon ? <sub.icon size={16} /> : null}
                                  <span>{sub.name}</span>
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
