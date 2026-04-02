import {
  ChevronDown,
  Factory,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from "lucide-react";
import { useLayout } from "../../context/LayoutContext";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useGetAllLogoQuery } from "../../features/logo/logo";
import { translations } from "../../utils/translations";

import {
  LayoutDashboard,
  Users,
  UserCog,
  BadgeDollarSign,
  ShoppingBasket,
  Store,
  Warehouse,
  Package,
  ShoppingBag,
  RotateCcw,
  Truck,
  ClipboardList,
  TriangleAlert,
  Wrench,
  Megaphone,
  BarChart3,
  Wallet,
  BookOpen,
  HandCoins,
  Bell,
  Settings,
  Image,
  DollarSign,
  ShieldCheck,
  Boxes,
  PackageCheck,
  User,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  {
    name: "Overview",
    key: "overview",
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
    key: "user_management",
    icon: Users,
    color: "#22c55e",
    href: "/user-management",
    roles: ["superAdmin", "admin"],
  },

  {
    name: "Assets",
    key: "assets",
    icon: ShieldCheck,
    color: "#ec4899",
    roles: ["superAdmin", "admin", "inventor"],
    children: [
      {
        name: "Requisition",
        key: "requisition",
        icon: ClipboardList,
        href: "/assets-requisition",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Purchase",
        key: "purchase",
        icon: ShoppingBasket,
        href: "/assets-purchase",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Sale",
        key: "sale",
        icon: BadgeDollarSign,
        href: "/assets-sale",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Damage",
        key: "damage",
        icon: TriangleAlert,
        href: "/assets-damage",
        roles: ["superAdmin", "admin", "inventor"],
      },
    ],
  },

  {
    name: "Marketing",
    key: "marketing",
    icon: Megaphone,
    color: "#f97316",
    roles: ["superAdmin", "admin", "marketer"],
    children: [
      {
        name: "DM Expense",
        key: "dm_expense",
        icon: Megaphone,
        color: "#f97316",
        href: "/marketing-book",
        roles: ["superAdmin", "admin", "marketer"],
      },
      {
        name: "Daily Profit & Loss",
        key: "profit_loss",
        icon: BarChart3,
        color: "#f97316",
        href: "/profit-loss",
        roles: ["superAdmin", "admin", "marketer"],
      },
    ],
  },

  {
    name: "Inventory",
    key: "inventory",
    icon: Boxes,
    color: "#8b5cf6",
    roles: ["superAdmin", "admin", "inventor"],
    children: [
      {
        name: "Item",
        key: "item",
        icon: Package,
        href: "/item",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Manufacture Stock",
        key: "manufacture_stock",
        icon: Factory,
        href: "/manufacture-stock",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Manufacture",
        key: "manufacture",
        icon: Factory,
        href: "/manufacture",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Stock Adjustment",
        key: "stock_adjustment",
        icon: Factory,
        href: "/stock-adjustment",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Mixer",
        key: "mixer",
        icon: Factory,
        href: "/mixer",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Overview",
        key: "overview",
        icon: LayoutDashboard,
        href: "/inventory-overview",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Stock Product",
        key: "stock_product",
        icon: Boxes,
        href: "/stock-product",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Warehouse",
        key: "warehouse",
        icon: Warehouse,
        href: "/warehouse",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Supplier",
        key: "supplier",
        icon: Truck,
        href: "/supplier",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Product",
        key: "product",
        icon: Package,
        href: "/products",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Purchase Requisition",
        key: "purchase_requisition",
        icon: ClipboardList,
        href: "/purchase-requisition",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Received Product",
        key: "received_product",
        icon: PackageCheck,
        href: "/purchase-product",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Received Return Product",
        key: "received_return",
        icon: RotateCcw,
        href: "/purchase-return",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Intransit Product",
        key: "intransit_product",
        icon: Truck,
        href: "/intransit-product",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Sales Return",
        key: "sales_return",
        icon: RotateCcw,
        href: "/sales-return",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Damage stock",
        key: "damage_stock",
        icon: TriangleAlert,
        href: "/damage-stock",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Damage Product",
        key: "damage_product",
        icon: TriangleAlert,
        href: "/damage-product",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Damage Repairing Stock",
        key: "damage_repairing_stock",
        icon: Wrench,
        href: "/damage-repairing-stock",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Damage Repairing",
        key: "damage_repairing",
        icon: Wrench,
        href: "/damage-repair",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Damage Repaired",
        key: "damage_repaired",
        icon: Wrench,
        href: "/damage-repaired",
        roles: ["superAdmin", "admin", "inventor"],
      },
    ],
  },
  {
    name: "Pos",
    key: "pos_panel",
    icon: Store,
    color: "#f97316",
    roles: ["superAdmin", "admin", "inventor"],
    children: [
      {
        name: "Sell",
        key: "sell",
        icon: ShoppingBag,
        href: "/pos-sell",
        roles: ["superAdmin", "admin", "inventor"],
      },
      {
        name: "Pos Report",
        key: "pos_report",
        icon: BarChart3,
        href: "/pos-report",
        roles: ["superAdmin", "admin", "inventor"],
      },
    ],
  },
  {
    name: "Accounting",
    key: "accounting",
    icon: Wallet,
    color: "#3b82f6",
    roles: ["superAdmin", "admin", "accountant"],
    children: [
      {
        name: "Supplier",
        key: "supplier",
        icon: Truck,
        href: "/supplier",
        roles: ["superAdmin", "admin"],
      },
      {
        name: "Book",
        key: "book",
        icon: BookOpen,
        href: "/book",
        roles: ["superAdmin", "admin", "accountant"],
      },
      {
        name: "Petty Cash",
        key: "petty_cash",
        icon: HandCoins,
        href: "/petty-cash",
        roles: ["superAdmin", "admin", "accountant"],
      },
      {
        name: "Credit Ledger",
        key: "credit_ledger",
        icon: HandCoins,
        href: "/credit-ledger",
        roles: ["superAdmin", "admin", "accountant"],
      },
    ],
  },

  // {
  //   name: "Due Management",
  //   icon: CreditCard,
  //   color: "#3b82f6",
  //   roles: ["superAdmin", "accountant"],
  //   children: [
  //     {
  //       name: "Receivable",
  //       icon: ArrowUpRight,
  //       href: "/receivable",
  //       roles: ["superAdmin", "accountant"],
  //     },
  //     {
  //       name: "Payable",
  //       icon: ArrowDownLeft,
  //       href: "/payable",
  //       roles: ["superAdmin", "accountant"],
  //     },
  //   ],
  // },

  {
    name: "Notifications",
    key: "notifications",
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
    key: "settings",
    icon: Settings,
    color: "#60a5fa",
    roles: ["superAdmin", "admin"],
    children: [
      {
        name: "Logo",
        key: "logo",
        icon: Image,
        href: "/logo",
        roles: ["superAdmin", "admin"],
      },
    ],
  },
  {
    name: "HR & Payroll",
    key: "hr_payroll",
    icon: UserCog,
    color: "#ec4899",
    roles: ["superAdmin", "admin", "accountant"],
    children: [
      {
        name: "Employee List",
        key: "employee_list",
        icon: UserCog,
        color: "#22c55e",
        href: "/employee-list",
        roles: ["superAdmin", "admin", "accountant"],
      },

      {
        name: "Payroll",
        key: "payroll",
        icon: UserCog,
        color: "#22c55e",
        href: "/employee",
        roles: ["superAdmin", "admin", "accountant"],
      },
      {
        name: "Payroll Fine",
        key: "payroll_fine",
        icon: DollarSign,
        href: "/salary",
        roles: ["superAdmin", "admin", "accountant"],
      },
    ],
  },
  {
    name: "Expire Product",
    key: "expired_product",
    icon: TriangleAlert,
    color: "#ef4444",
    href: "/expired-product",
    roles: ["superAdmin", "admin"],
  },

  {
    name: "Profile",
    key: "profile",
    icon: User,
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
  const {
    isSidebarOpen,
    toggleSidebar,
    isMobileMenuOpen,
    toggleMobileMenu,
    language,
  } = useLayout();
  const t = translations[language] || translations.EN;
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
          .filter((c) => {
            const translatedChild = (t[c.key] || c.name).toLowerCase();
            return (
              c.name.toLowerCase().includes(q) || translatedChild.includes(q)
            );
          });

        return { ...item, children: childMatches };
      })
      .filter((item) => {
        const translatedParent = (t[item.key] || item.name).toLowerCase();
        const parentMatch =
          item.name.toLowerCase().includes(q) || translatedParent.includes(q);

        if (!item.children) return parentMatch;
        if (parentMatch) return true;
        return item.children.length > 0;
      });
  }, [roleFiltered, menuQuery, userRole, t]);

  // ✅ auto open first matched parent when searching (no stale state)
  useEffect(() => {
    const q = menuQuery.trim();
    if (!q) return;

    const firstWithChildren = filteredItems.find(
      (x) => x.children && x.children.length,
    );

    if (firstWithChildren) setOpenMenu(firstWithChildren.key);
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
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 lg:translate-x-0 ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } bg-slate-50 border-r border-slate-200`}
        animate={{ width: isSidebarOpen ? 280 : 88 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{ width: isSidebarOpen ? 280 : 88 }}
      >
        {/* ✅ Light dashboard sidebar shell */}
        <div
          className={`h-full border-r border-slate-200 bg-slate-50 flex flex-col ${
            isSidebarOpen ? "p-4" : "p-2"
          }`}
        >
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] flex flex-col overflow-hidden">
            {/* Header */}
            <div
              className={`border-b border-slate-200 ${
                isSidebarOpen ? "p-4" : "p-2"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                  <img
                    src={
                      logo
                        ? ` https://apikafela.digitalever.com.bd/${logo}`
                        : ""
                    }
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
                      <div className="text-xs text-slate-500">
                        {t.control_panel}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <button
                  onClick={toggleSidebar}
                  className="hidden lg:flex h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 items-center justify-center transition"
                  type="button"
                  title={isSidebarOpen ? "Collapse" : "Expand"}
                >
                  {isSidebarOpen ? (
                    <PanelLeftClose size={18} />
                  ) : (
                    <PanelLeftOpen size={18} />
                  )}
                </button>

                {/* Mobile Close Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="flex lg:hidden h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 items-center justify-center transition"
                  type="button"
                >
                  <X size={18} />
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
            <nav
              className={`flex-1 overflow-y-auto py-3 sidebar-scroll min-h-0 ${
                isSidebarOpen ? "px-2" : "px-1"
              }`}
            >
              {filteredItems.length === 0 ? (
                <div className="px-3 py-6 text-sm text-slate-500">
                  No menu found.
                </div>
              ) : null}

              {filteredItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = !!item.children?.length;
                const menuOpen = openMenu === item.key;

                const childActive = hasChildren
                  ? item.children.some((c) => isActive(c.href))
                  : false;

                const parentActive = !hasChildren
                  ? isActive(item.href)
                  : childActive;

                const parentBase = `w-full group flex items-center rounded-xl transition relative ${
                  isSidebarOpen ? "gap-3 px-3 py-3" : "justify-center px-2 py-3"
                }`;

                const parentState = parentActive
                  ? "bg-indigo-50 border border-indigo-100"
                  : "hover:bg-slate-50 border border-transparent";

                return (
                  <div key={item.key} className="mb-2">
                    {/* Menu Item */}
                    <div className="relative">
                      {hasChildren ? (
                        <motion.button
                          onClick={() => toggleMenu(item.key)}
                          onMouseEnter={() => setHovered(item.key)}
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
                                {t[item.key] || item.name}
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
                            show={!isSidebarOpen && hovered === item.key}
                            text={t[item.key] || item.name}
                          />
                        </motion.button>
                      ) : (
                        <Link to={item.href}>
                          <motion.div
                            onMouseEnter={() => setHovered(item.key)}
                            onMouseLeave={() => setHovered(null)}
                            className={`${parentBase} ${parentState}`}
                          >
                            <span
                              className={`absolute left-0 top-2 bottom-2 w-1 rounded-full transition ${
                                parentActive
                                  ? "bg-indigo-500"
                                  : "bg-transparent"
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
                                {t[item.key] || item.name}
                              </span>
                            ) : null}

                            <Tooltip
                              show={!isSidebarOpen && hovered === item.key}
                              text={t[item.key] || item.name}
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
                                        {t[sub.key] || sub.name}
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
                <div className="text-xs text-slate-500">{t.signed_in_as}</div>
                <div className="text-sm font-medium text-slate-900 truncate">
                  {userRole}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 5px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 999px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.4); }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
      </motion.aside>
    </>
  );
};

export default Sidebar;
