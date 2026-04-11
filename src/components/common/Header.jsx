import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronDown, Menu, Languages } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useGetDataByIdQuery } from "../../features/notification/notification";
import { Link, useNavigate } from "react-router-dom";
import { useSingleUserQuery } from "../../features/auth/auth";
import { useLayout } from "../../context/LayoutContext";
import { translations } from "../../utils/translations";

const Header = ({ title }) => {
  const { toggleMobileMenu, language, toggleLanguage } = useLayout();
  const t = translations[language] || translations.EN;

  // Auto-translate titles if possible
  const translatedTitle = useMemo(() => {
    if (!title) return language === "BN" ? "ওভারভিউ" : "Overview";

    // Convert string like "Purchase Assets" to "purchase_assets"
    const key = title.toLowerCase().replace(/\s+/g, "_");
    return t[key] || title;
  }, [title, t, language]);
  const [open, setOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const navigate = useNavigate();

  const userId = useMemo(() => localStorage.getItem("userId"), []);

  // ✅ user data
  const {
    data: userRes,
    isLoading: userLoading,
    isError: userError,
  } = useSingleUserQuery(userId, {
    skip: !userId,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const user = userRes?.data;

  console.log("user", user);

  // ✅ notifications
  const { data, isLoading, isError, error } = useGetDataByIdQuery(
    { page: 1, limit: 10, userId },
    { pollingInterval: 1000 },
  );

  useEffect(() => {
    if (isError) console.error("Error fetching notifications", error);
    if (!isLoading && data?.data) {
      const unread = data.data.filter((n) => n.isRead === false);
      setNotifications(unread.length);
    }
  }, [data, isLoading, isError, error]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [user?.image]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.clear();
    navigate("/login");
  };

  const avatarSrc =
    user?.image && user?.image !== "null"
      ? `http://localhost:5000${user.image}`
      : null;

  const avatarInitials =
    `${user?.FirstName?.[0] || ""}${user?.LastName?.[0] || ""}`
      .trim()
      .toUpperCase();

  // ✅ outside click close (dropdown + notif)
  const rightAreaRef = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      if (!rightAreaRef.current) return;
      if (!rightAreaRef.current.contains(e.target)) {
        setOpen(false);
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="w-full bg-slate-50 border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="h-14 px-3 sm:px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          type="button"
        >
          <Menu size={20} />
        </button>

        {/* Page Title / Left spacer */}
        <div className="flex-1 lg:flex-none min-w-0">
          <h1 className="text-lg font-bold text-slate-900 truncate lg:hidden">
            {translatedTitle}
          </h1>
          <div className="hidden lg:block min-w-[120px]">
            <h1 className="text-xl font-bold text-slate-800">
              {translatedTitle}
            </h1>
          </div>
        </div>

        {/* Right */}
        <div
          ref={rightAreaRef}
          className="relative flex items-center justify-end gap-2 sm:gap-4"
        >
          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex h-10 px-3 items-center justify-center gap-2 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold"
            title={language === "EN" ? "বাংলা করুন" : "Switch to English"}
          >
            <Languages size={18} className="text-emerald-600" />
            <span className="text-xs sm:text-sm uppercase tracking-wider">
              {language === "EN" ? "BN" : "EN"}
            </span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen((p) => !p);
              setOpen(false);
            }}
            className="relative h-10 w-10 rounded-md bg-white border border-slate-200 flex items-center justify-center"
            title="Notifications"
          >
            <Bell className="text-slate-700" size={18} />
            {Number(notifications) > 0 && (
              <span className="absolute top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* ✅ Notification Dropdown responsive position */}
          {isNotifOpen && (
            <div className="absolute right-0 top-12 z-50 w-[92vw] max-w-sm sm:w-96">
              <NotificationDropdown />
            </div>
          )}

          {/* User */}
          <button
            type="button"
            onClick={() => {
              setOpen((p) => !p);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 rounded-md px-2 py-1 hover:bg-slate-100"
          >
            <div className="h-9 w-9 rounded-full bg-emerald-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              {avatarSrc && !avatarLoadError ? (
                <img
                  className="w-9 h-9 object-cover"
                  src={avatarSrc}
                  alt="User avatar"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <span className="text-sm font-semibold text-emerald-700">
                  {avatarInitials || "U"}
                </span>
              )}
            </div>

            {/* ✅ Hide name/role on small devices */}
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-slate-900 text-sm font-medium">
                {userLoading
                  ? "Loading..."
                  : `${user?.FirstName || ""} ${user?.LastName || ""}`}
              </div>
              <span className="inline-flex items-center h-5 px-2 rounded bg-emerald-600 text-white text-xs font-semibold">
                {userError ? "Unknown" : user?.role || "Staff"}
              </span>
            </div>

            {/* ✅ Chevron hide on very small */}
            <ChevronDown className="hidden sm:block text-slate-500" size={18} />
          </button>

          {/* ✅ Dropdown responsive width */}
          {open && (
            <div className="absolute right-0 top-12 w-44 sm:w-48 rounded-md bg-white border border-slate-200 shadow-lg overflow-hidden z-50">
              <Link
                to="/profile"
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>

              <div className="h-px bg-slate-200" />

              <button
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
