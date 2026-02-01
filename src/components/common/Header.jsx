// /* eslint-disable no-mixed-spaces-and-tabs */
// import { useNavigate } from "react-router-dom";

// const Header = ({ title }) => {
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate(); // Hook to navigate programmatically

//   // eslint-disable-next-line no-unused-vars
//   const profileImage = localStorage.getItem("image");

//   // Logout handler
//   const handleLogout = () => {
//     localStorage.removeItem("token"); // Remove token from localStorage
//     localStorage.clear();
//     navigate("/login"); // Redirect to the login page
//   };

//   return (
//     <header className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700">
//       <div className="navbar bg-[#182130]">
//         <div className="flex-1">
//           <a className="btn btn-ghost text-xl">{title}</a>
//         </div>
//         <div className="flex-none gap-2">
//           <div className="dropdown dropdown-end">
//             {token ? (
//               <button onClick={handleLogout} className="btn">
//                 Sign Out
//               </button> // Use button for logout
//             ) : (
//               <a href="/login" className="btn">
//                 Sign In
//               </a> // Use anchor for login
//             )}

//             {/* <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
//         <div className="w-10 rounded-full">
//           <img
//             alt="Tailwind CSS Navbar component"
//             src={`https://api.digitalever.com.bd/${profileImage}`}/>P
//         </div>
//       </div> */}
//             {/* <ul
//         tabIndex={0}
//         className="menu menu-sm dropdown-content bg-[#182130] rounded-box z-[1] mt-3 w-52 p-2 shadow border">
//         <li>
//           <a>
//             Profile

//           </a>
//         </li>
//         <li><a>Settings</a></li>
//         <li >

// 		</li>
//       </ul> */}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };
// export default Header;

import { useEffect, useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useGetDataByIdQuery } from "../../features/notification/notification";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetDataByIdQuery(
    {
      page: 1,
      limit: 10,
      userId,
    },
    { pollingInterval: 1000 },
  );

  useEffect(() => {
    if (isError) {
      console.error("Error fetching user data", error);
    } else if (!isLoading && data) {
      const readNotifications = data.data.filter((n) => n.isRead === false);

      // If your intent was to store the total count of READ notifications
      setNotifications(readNotifications.length);
    }
  }, [data, isLoading, isError, error]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `https://api.digitalever.com.bd/api/v1/user/${userId}`,
        );
        const data = await res.json();
        setUser(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    localStorage.clear();
    navigate("/login"); // Redirect to the login page
  };

  return (
    <header className="w-full bg-slate-50 border-b border-slate-200 shadow-sm px-6 py-3 ">
      <div className="h-14 px-4 flex items-center justify-between gap-3">
        {/* Left (optional brand / spacer) */}
        <div className="min-w-[120px]" />

        {/* Right user */}
        <div className="relative min-w-[220px] flex justify-end items-center gap-4">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative h-10 w-10 rounded-md bg-white  border border-slate-200  flex items-center justify-center"
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

          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-white/5"
          >
            <div className="h-9 w-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white font-semibold">
              {/* {"U"} */}
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={
                  user?.image && user?.image !== "null"
                    ? `http://localhost:4000/${user?.image}`
                    : "https://i.pravatar.cc/300"
                }
                alt="User avatar"
              />
            </div>

            <div className="text-left leading-tight">
              <div className="text-white text-sm font-medium">
                {user?.FirstName} {user?.LastName}
              </div>
              <span className="inline-flex items-center h-5 px-2 rounded bg-emerald-500/90 text-white text-xs font-semibold">
                {user?.role}
              </span>
            </div>

            <ChevronDown className="text-white/70" size={18} />
          </button>

          {open && (
            <div className="absolute right-0 top-14 w-48 rounded-md bg-[#2f3133] border border-white/10 shadow-lg overflow-hidden z-50">
              <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5">
                <Link to="/profile">Profile</Link>
              </button>
              {/* <button
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
                onClick={() => {
                  setOpen(false);
                  // handle settings
                }}
              >
                Settings
              </button> */}
              <div className="h-px bg-white/10" />
              <button
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
                // onClick={() => {
                //   setOpen(false);
                // }}
                onClick={handleLogout}
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
