// import { useEffect, useState } from "react";
// import { Bell, ChevronDown } from "lucide-react";
// import NotificationDropdown from "./NotificationDropdown";
// import { useGetDataByIdQuery } from "../../features/notification/notification";
// import { Link, useNavigate } from "react-router-dom";

// const Header = () => {
//   const [open, setOpen] = useState(false);
//   const [isNotifOpen, setIsNotifOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const userId = localStorage.getItem("userId");
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   const { data, isLoading, isError, error } = useGetDataByIdQuery(
//     {
//       page: 1,
//       limit: 10,
//       userId,
//     },
//     { pollingInterval: 1000 },
//   );

//   useEffect(() => {
//     if (isError) {
//       console.error("Error fetching user data", error);
//     } else if (!isLoading && data) {
//       const readNotifications = data.data.filter((n) => n.isRead === false);

//       // If your intent was to store the total count of READ notifications
//       setNotifications(readNotifications.length);
//     }
//   }, [data, isLoading, isError, error]);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await fetch(` https://api.digitalever.com.bd/api/v1/user/${userId}`);
//         const data = await res.json();
//         setUser(data.data);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchUser();
//   }, [userId]);

//   const handleLogout = () => {
//     localStorage.removeItem("token"); // Remove token from localStorage
//     localStorage.clear();
//     navigate("/login"); // Redirect to the login page
//   };

//   return (
//     <header className="w-full bg-slate-50 border-b border-slate-200 shadow-sm px-6 py-3 ">
//       <div className="h-14 px-4 flex items-center justify-between gap-3">
//         {/* Left (optional brand / spacer) */}
//         <div className="min-w-[120px]" />

//         {/* Right user */}
//         <div className="relative min-w-[220px] flex justify-end items-center gap-4">
//           <button
//             type="button"
//             onClick={() => setIsNotifOpen(!isNotifOpen)}
//             className="relative h-10 w-10 rounded-md bg-white  border border-slate-200  flex items-center justify-center"
//             title="Notifications"
//           >
//             <Bell className="text-slate-700" size={18} />
//             {Number(notifications) > 0 && (
//               <span className="absolute top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
//                 {notifications}
//               </span>
//             )}
//           </button>
//           {isNotifOpen && <NotificationDropdown />}

//           <button
//             type="button"
//             onClick={() => setOpen((p) => !p)}
//             className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-white/5"
//           >
//             <div className="h-9 w-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white font-semibold">
//               {/* {"U"} */}
//               <img
//                 className="w-8 h-8 rounded-full object-cover"
//                 src={
//                   user?.image && user?.image !== "null"
//                     ? `https://api.digitalever.com.bd/${user?.image}`
//                     : "https://i.pravatar.cc/300"
//                 }
//                 alt="User avatar"
//               />
//             </div>

//             <div className="text-left leading-tight">
//               <div className="text-white text-sm font-medium">
//                 {user?.FirstName} {user?.LastName}
//               </div>
//               <span className="inline-flex items-center h-5 px-2 rounded bg-emerald-500/90 text-white text-xs font-semibold">
//                 {user?.role}
//               </span>
//             </div>

//             <ChevronDown className="text-white/70" size={18} />
//           </button>

//           {open && (
//             <div className="absolute right-0 top-14 w-48 rounded-md bg-[#2f3133] border border-white/10 shadow-lg overflow-hidden z-50">
//               <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5">
//                 <Link to="/profile">Profile</Link>
//               </button>
//               {/* <button
//                 className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
//                 onClick={() => {
//                   setOpen(false);
//                   // handle settings
//                 }}
//               >
//                 Settings
//               </button> */}
//               <div className="h-px bg-white/10" />
//               <button
//                 className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
//                 // onClick={() => {
//                 //   setOpen(false);
//                 // }}
//                 onClick={handleLogout}
//               >
//                 Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useGetDataByIdQuery } from "../../features/notification/notification";
import { Link, useNavigate } from "react-router-dom";
import { useSingleUserQuery } from "../../features/auth/auth";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);

  const navigate = useNavigate();

  const userId = useMemo(() => localStorage.getItem("userId"), []);

  // ✅ user data from RTK Query
  const {
    data: userRes,
    isLoading: userLoading,
    isError: userError,
  } = useSingleUserQuery(userId, {
    skip: !userId,
    // optional: always keep fresh
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const user = userRes?.data;

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.clear();
    navigate("/login");
  };

  const avatarSrc =
    user?.image && user?.image !== "null"
      ? `https://api.digitalever.com.bd/${user.image}`
      : "https://i.pravatar.cc/300";

  return (
    <header className="w-full bg-slate-50 border-b border-slate-200 shadow-sm px-6 py-3">
      <div className="h-14 px-4 flex items-center justify-between gap-3">
        <div className="min-w-[120px]" />

        <div className="relative min-w-[220px] flex justify-end items-center gap-4">
          {/* Notifications */}
          <button
            type="button"
            onClick={() => setIsNotifOpen((p) => !p)}
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

          {isNotifOpen && <NotificationDropdown />}

          {/* User */}
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-white/5"
          >
            <div className="h-9 w-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={avatarSrc}
                alt="User avatar"
                onError={(e) => {
                  e.currentTarget.src = "https://i.pravatar.cc/300";
                }}
              />
            </div>

            <div className="text-left leading-tight">
              <div className="text-white text-sm font-medium">
                {userLoading
                  ? "Loading..."
                  : `${user?.FirstName || ""} ${user?.LastName || ""}`}
              </div>
              <span className="inline-flex items-center h-5 px-2 rounded bg-emerald-500/90 text-white text-xs font-semibold">
                {userError ? "Unknown" : user?.role || "Staff"}
              </span>
            </div>

            <ChevronDown className="text-white/70" size={18} />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-14 w-48 rounded-md bg-[#2f3133] border border-white/10 shadow-lg overflow-hidden z-50">
              <Link
                to="/profile"
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>

              <div className="h-px bg-white/10" />

              <button
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
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
