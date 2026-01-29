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
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 10;

  const { data, isLoading, isError } = useGetDataByIdQuery({
    page: currentPage,
    limit: itemsPerPage,
    userId,
    branch,
  });

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
      Math.min(prev + pagesPerSet, totalPages - pagesPerSet + 1),
    );

  const [updateNotification] = useUpdateNotificationMutation();

  const notifications = data?.data || [];
  // const totalPages = Math.ceil((data?.meta?.total || 0) / limit);

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

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <div className="w-full bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700">
          {/* Header */}
          <div className="px-5 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Notifications
            </h2>
          </div>

          {/* Content */}
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {isLoading && (
              <p className="p-6 text-center text-gray-500">Loading...</p>
            )}

            {isError && (
              <p className="p-6 text-center text-red-500">
                Failed to load notifications
              </p>
            )}

            {!isLoading && notifications.length === 0 && (
              <p className="p-6 text-center text-white">
                No notifications found
              </p>
            )}

            {notifications.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition ${
                  !item.isRead ? "bg-blue-50" : ""
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brandRed/10 flex items-center justify-center">
                  🔔
                </div>

                {/* Message */}
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    {item.message || "No message"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Action */}
                {!item.isRead && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    className="text-xs text-brandRed font-medium hover:underline"
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
              className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
            >
              Prev
            </button>

            {[...Array(endPage - startPage + 1)].map((_, index) => {
              const pageNum = startPage + index;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-black rounded-md ${
                    pageNum === currentPage
                      ? "bg-white"
                      : "bg-indigo-500 hover:bg-indigo-400"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={handleNextSet}
              disabled={endPage === totalPages}
              className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
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
