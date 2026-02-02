// import { useNavigate } from "react-router-dom";
// import Header from "../components/common/Header";
// import { useEffect, useState } from "react";
// import {
//   useGetDataByIdQuery,
//   useUpdateNotificationMutation,
// } from "../features/notification/notification";

// const NotificationPage = () => {
//   const branch = localStorage.getItem("branch");
//   const userId = localStorage.getItem("userId");

//   const [currentPage, setCurrentPage] = useState(1);
//   const [startPage, setStartPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [pagesPerSet, setPagesPerSet] = useState(10);
//   const [itemsPerPage] = useState(10);

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

//   const navigate = useNavigate();
//   // const [currentPage, setCurrentPage] = useState(1);
//   // const itemsPerPage = 10;

//   const { data, isLoading, isError } = useGetDataByIdQuery({
//     page: currentPage,
//     limit: itemsPerPage,
//     userId,
//     branch,
//   });

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
//       Math.min(prev + pagesPerSet, totalPages - pagesPerSet + 1),
//     );

//   const [updateNotification] = useUpdateNotificationMutation();

//   const notifications = data?.data || [];
//   // const totalPages = Math.ceil((data?.meta?.total || 0) / limit);

//   const markAsRead = async (id) => {
//     try {
//       const res = await updateNotification({ id, userId }).unwrap();
//       navigate(`/app/${res.data.url}`);
//     } catch (err) {
//       console.error("Failed to mark as read", err);
//     }
//   };

//   return (
//     <div className="flex-1 relative z-10">
//       <Header title="Notifications" />

//       <main className="max-w-8xl mx-auto py-6 px-4 lg:px-8">
//         <div className="w-full bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700">
//           {/* Header */}
//           <div className="px-5 py-4 border-b">
//             <h2 className="text-lg font-semibold text-gray-800">
//               Notifications
//             </h2>
//           </div>

//           {/* Content */}
//           <div className="divide-y max-h-[500px] overflow-y-auto">
//             {isLoading && (
//               <p className="p-6 text-center text-gray-500">Loading...</p>
//             )}

//             {isError && (
//               <p className="p-6 text-center text-red-500">
//                 Failed to load notifications
//               </p>
//             )}

//             {!isLoading && notifications.length === 0 && (
//               <p className="p-6 text-center text-white">
//                 No notifications found
//               </p>
//             )}

//             {notifications.map((item) => (
//               <div
//                 key={item.id}
//                 className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition ${
//                   !item.isRead ? "bg-blue-50" : ""
//                 }`}
//               >
//                 {/* Icon */}
//                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brandRed/10 flex items-center justify-center">
//                   🔔
//                 </div>

//                 {/* Message */}
//                 <div className="flex-1">
//                   <p className="text-sm text-gray-800">
//                     {item.message || "No message"}
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {new Date(item.createdAt).toLocaleString()}
//                   </p>
//                 </div>

//                 {/* Action */}
//                 {!item.isRead && (
//                   <button
//                     onClick={() => markAsRead(item.id)}
//                     className="text-xs text-brandRed font-medium hover:underline"
//                   >
//                     View
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
//           <div className="flex items-center justify-center space-x-2 mt-6">
//             <button
//               onClick={handlePreviousSet}
//               disabled={startPage === 1}
//               className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
//             >
//               Prev
//             </button>

//             {[...Array(endPage - startPage + 1)].map((_, index) => {
//               const pageNum = startPage + index;
//               return (
//                 <button
//                   key={pageNum}
//                   onClick={() => handlePageChange(pageNum)}
//                   className={`px-3 py-2 text-black rounded-md ${
//                     pageNum === currentPage
//                       ? "bg-white"
//                       : "bg-indigo-500 hover:bg-indigo-400"
//                   }`}
//                 >
//                   {pageNum}
//                 </button>
//               );
//             })}

//             <button
//               onClick={handleNextSet}
//               disabled={endPage === totalPages}
//               className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };
// export default NotificationPage;

import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import { useEffect, useState } from "react";
import {
  useGetDataByIdQuery,
  useUpdateNotificationMutation,
} from "../features/notification/notification";

const NotificationPage = () => {
  const branch = localStorage.getItem("branch");
  const userId = localStorage.getItem("userId");

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);
  const [itemsPerPage] = useState(10);

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

  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetDataByIdQuery({
    page: currentPage,
    limit: itemsPerPage,
    userId,
    branch,
  });

  const notifications = data?.data || [];

  // ✅ totalPages fix
  useEffect(() => {
    const total = data?.meta?.total ?? 0;
    const tp = Math.max(1, Math.ceil(total / itemsPerPage));
    setTotalPages(tp);

    // page range safe
    setStartPage((p) => Math.min(p, Math.max(1, tp - pagesPerSet + 1)));
    if (currentPage > tp) setCurrentPage(tp);
  }, [data, itemsPerPage, pagesPerSet]); // currentPage intentionally not included

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

  const [updateNotification] = useUpdateNotificationMutation();

  const markAsRead = async (id) => {
    try {
      const res = await updateNotification({ id, userId }).unwrap();
      navigate(`/app/${res.data.url}`);
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  return (
    <div className="flex-1 relative z-10">
      <Header title="Notifications" />

      <main className="max-w-8xl mx-auto py-6 px-4 lg:px-8 bg-slate-50 min-h-[calc(100vh-64px)]">
        <div className="w-full bg-white shadow-sm rounded-xl p-6 border border-gray-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>

            {/* optional: total count */}
            <span className="text-xs text-gray-500">
              {data?.meta?.total ?? 0} total
            </span>
          </div>

          {/* Content */}
          <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {isLoading && (
              <p className="p-6 text-center text-gray-500">Loading...</p>
            )}

            {isError && (
              <p className="p-6 text-center text-red-600">
                Failed to load notifications
              </p>
            )}

            {!isLoading && !isError && notifications.length === 0 && (
              <p className="p-6 text-center text-gray-500">
                No notifications found
              </p>
            )}

            {notifications.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-4 px-5 py-4 transition ${
                  !item.isRead
                    ? "bg-indigo-50 hover:bg-indigo-100/60"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                  🔔
                </div>

                {/* Message */}
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {item.message || "No message"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                {/* Action */}
                {!item.isRead && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    View
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            <button
              onClick={handlePreviousSet}
              disabled={startPage === 1}
              className="px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Prev
            </button>

            {[...Array(endPage - startPage + 1)].map((_, index) => {
              const pageNum = startPage + index;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm rounded-md border transition ${
                    pageNum === currentPage
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={handleNextSet}
              disabled={endPage === totalPages}
              className="px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationPage;
