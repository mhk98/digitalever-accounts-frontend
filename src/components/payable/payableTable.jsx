import { motion } from "framer-motion";
import { Edit, Notebook, Plus, Trash2, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  useDeletePayableMutation,
  useGetAllPayableQuery,
  useInsertPayableMutation,
  useUpdatePayableMutation,
} from "../../features/payable/payable";

const PayableTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [currentProduct, setCurrentProduct] = useState(null);

  const [createProduct, setCreateProduct] = useState({
    name: "",
    remarks: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    file: null,
  });

  const [products, setProducts] = useState([]);

  // filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterName, setFilterName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);
  const itemsPerPage = 10;

  // responsive pagesPerSet
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

  // reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate, filterName]);

  // fix endDate
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ query args (start/end + name)
  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      searchTerm: filterName?.trim() || undefined,
    };

    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "") {
        delete args[k];
      }
    });

    return args;
  }, [currentPage, startDate, endDate, filterName]);

  const { data, isLoading, isError, error, refetch } =
    useGetAllPayableQuery(queryArgs);

  useEffect(() => {
    if (isError) console.error("Error:", error);
    if (!isLoading && data) {
      setProducts(data?.data ?? []);
      setTotalPages(Math.ceil((data?.meta?.count || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error]);

  // modals
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => setIsModalOpen1(false);
  const handleModalClose = () => setIsModalOpen(false);
  const handleModalClose2 = () => setIsModalOpen2(false);

  const handleEditClick = (rp) => {
    setCurrentProduct({
      ...rp,
      name: rp.name ?? "",
      amount: rp.amount ?? "",
      remarks: rp.remarks ?? "",
      note: rp.note ?? "",
      status: rp.status ?? "",
      date: rp.date ?? "",
      userId: userId,
      file: null,
    });
    setIsModalOpen(true);
  };

  const handleEditClick1 = (rp) => {
    setCurrentProduct({
      ...rp,
      name: rp.name ?? "",
      amount: rp.amount ?? "",
      remarks: rp.remarks ?? "",
      note: rp.note ?? "",
      status: rp.status ?? "",
      userId: userId,
      file: null,
    });
    setIsModalOpen2(true);
  };

  // insert
  const [insertPayable] = useInsertPayableMutation();
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.name.trim()) return toast.error("Name is required!");
    if (!createProduct.amount) return toast.error("Amount is required!");

    try {
      const formData = new FormData();
      formData.append("name", createProduct.name.trim());
      formData.append("date", createProduct.date);
      formData.append("remarks", createProduct.remarks?.trim() || "");
      formData.append("amount", String(Number(createProduct.amount)));
      if (createProduct.file) formData.append("file", createProduct.file);

      const res = await insertPayable(formData).unwrap();
      if (res?.success) {
        toast.success("Successfully Created!");
        setIsModalOpen1(false);
        setCreateProduct({
          name: "",
          remarks: "",
          amount: "",
          date: "",
          file: null,
        });
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // update
  const [updatePayable] = useUpdatePayableMutation();

  const handleUpdateProduct = async () => {
    const rowId = currentProduct?.Id ?? currentProduct?.id;
    if (!rowId) return toast.error("Invalid item!");

    try {
      if (currentProduct?.file instanceof File) {
        const fd = new FormData();
        fd.append("name", currentProduct?.name?.trim() || "");
        fd.append("date", currentProduct?.date);
        fd.append("remarks", currentProduct?.remarks?.trim() || "");
        fd.append("note", currentProduct?.note?.trim() || "");
        fd.append("status", currentProduct?.status?.trim() || "");
        fd.append("userId", userId);
        fd.append("actorRole", role);
        fd.append("amount", String(Number(currentProduct?.amount || 0)));
        fd.append("file", currentProduct.file);

        const res = await updatePayable({ id: rowId, data: fd }).unwrap();
        if (res?.success) {
          toast.success("Successfully updated!");

          setIsModalOpen(false);
          refetch?.();
        } else toast.error(res?.message || "Update failed!");
        return;
      }

      const payload = {
        name: currentProduct?.name?.trim() || "",
        date: currentProduct?.date || "",
        remarks: currentProduct?.remarks?.trim() || "",
        amount: Number(currentProduct?.amount || 0),
        note: currentProduct?.note?.trim() || "",
        status: currentProduct?.status?.trim() || "",
        userId: userId,
      };

      const res = await updatePayable({ id: rowId, data: payload }).unwrap();
      if (res?.success) {
        toast.success("Successfully updated!");

        setIsModalOpen(false);
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleUpdateProduct1 = async () => {
    const rowId = currentProduct?.Id ?? currentProduct?.id;
    if (!rowId) return toast.error("Invalid item!");

    try {
      if (currentProduct?.file instanceof File) {
        const fd = new FormData();
        fd.append("name", currentProduct?.name?.trim() || "");
        fd.append("remarks", currentProduct?.remarks?.trim() || "");
        fd.append("note", currentProduct?.note?.trim() || "");
        fd.append("status", currentProduct?.status?.trim() || "");
        fd.append("userId", userId);
        fd.append("actorRole", role);
        fd.append("amount", String(Number(currentProduct?.amount || 0)));
        fd.append("file", currentProduct.file);

        const res = await updatePayable({ id: rowId, data: fd }).unwrap();
        if (res?.success) {
          toast.success("Successfully updated!");

          setIsModalOpen2(false);
          refetch?.();
        } else toast.error(res?.message || "Update failed!");
        return;
      }

      const payload = {
        name: currentProduct?.name?.trim() || "",
        remarks: currentProduct?.remarks?.trim() || "",
        amount: Number(currentProduct?.amount || 0),
        note: currentProduct?.note?.trim() || "",
        status: currentProduct?.status?.trim() || "",
        userId: userId,
      };

      const res = await updatePayable({ id: rowId, data: payload }).unwrap();
      if (res?.success) {
        toast.success("Successfully updated!");

        setIsModalOpen2(false);
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // delete
  const [deletePayable] = useDeletePayableMutation();
  const handleDeleteProduct = async (rowId) => {
    if (!window.confirm("Do you want to delete this item?")) return;
    try {
      const res = await deletePayable(rowId).unwrap();
      if (res?.success) {
        toast.success("Deleted!");
        refetch?.();
      } else toast.error(res?.message || "Delete failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterName("");
  };

  // pagination
  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (pageNumber < startPage) setStartPage(pageNumber);
    else if (pageNumber > endPage) setStartPage(pageNumber - pagesPerSet + 1);
  };

  const handlePreviousSet = () =>
    setStartPage((p) => Math.max(p - pagesPerSet, 1));
  const handleNextSet = () =>
    setStartPage((p) =>
      Math.min(p + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1)),
    );

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const handleNoteClick = (note) => {
    setNoteContent(note);
    setIsNoteModalOpen(true); // Open the modal
  };

  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false); // Close the modal
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Add Button */}
      <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition w-full sm:w-auto"
        >
          Add <Plus size={18} className="ml-2" />
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-slate-700">
            <TrendingUp size={18} className="text-amber-500" />
            <span className="text-sm font-medium">Total Payable Amount</span>
          </div>

          <span className="text-slate-900 font-semibold tabular-nums">
            {isLoading ? "Loading..." : data?.meta?.countAmount}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-6 w-full justify-center mx-auto">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
        </div>

        <div className="flex items-center md:mt-6">
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Search by name..."
            className="border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white w-full outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
        </div>

        <button
          type="button"
          className="flex items-center md:mt-6 bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 px-4 py-2 rounded-lg w-36 justify-center mx-auto"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {products.map((rp) => {
              const rowId = rp.Id ?? rp.id;

              const safePath = String(rp.file || "").replace(/\\/g, "/");
              const fileUrl = safePath
                ? ` http://localhost:5000/${safePath}`
                : "";
              const ext = safePath.split(".").pop()?.toLowerCase();
              const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(
                ext,
              );
              const isPdf = ext === "pdf";

              return (
                <motion.tr
                  key={rowId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {!safePath ? (
                      "-"
                    ) : isImage ? (
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        <img
                          src={fileUrl}
                          alt="document"
                          className="h-12 w-12 object-cover rounded border border-slate-200 hover:opacity-80"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </a>
                    ) : isPdf ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700"
                      >
                        View PDF
                      </a>
                    ) : (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 underline"
                      >
                        Open File
                      </a>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.remarks || "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 tabular-nums">
                    {Number(rp.amount || 0).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.status}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {rp.note ? (
                      <div className="relative">
                        <button
                          className="relative h-10 w-10 rounded-md flex items-center justify-center"
                          title={rp.note}
                          type="button"
                          onClick={() => handleNoteClick(rp.note)} // Open modal on click
                        >
                          <Notebook size={18} className="text-slate-700" />
                        </button>

                        <span className="absolute top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
                          {rp.note ? 1 : null}
                        </span>
                      </div>
                    ) : (
                      <button
                        className="h-10 w-10 rounded-md flex items-center justify-center"
                        title={rp.note}
                        type="button"
                      >
                        <Notebook size={18} className="text-slate-700" />
                      </button>
                    )}

                    <button
                      onClick={() => handleEditClick(rp)}
                      className="text-indigo-600 hover:text-indigo-800"
                      type="button"
                    >
                      <Edit size={18} />
                    </button>

                    {role === "superAdmin" || role === "admin" ? (
                      <button
                        onClick={() => handleDeleteProduct(rowId)}
                        className="text-red-600 hover:text-red-800 ms-4"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick1(rp)}
                        className="text-red-600 hover:text-red-800 ms-4"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>

                  {/* ✅ Note Modal (Popup) */}
                  {isNoteModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                      <div className="bg-white rounded-lg p-6 shadow-xl w-full md:w-1/3">
                        <h2 className="text-xl font-semibold text-slate-900">
                          Note
                        </h2>
                        <p className="mt-4 text-sm text-slate-700">
                          {noteContent}
                        </p>

                        <div className="mt-6 flex justify-end gap-2">
                          <button
                            onClick={handleNoteModalClose}
                            className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.tr>
              );
            })}

            {!isLoading && products.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-6 text-center text-sm text-slate-600"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={handlePreviousSet}
          disabled={startPage === 1}
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
          type="button"
        >
          Prev
        </button>

        {[...Array(endPage - startPage + 1)].map((_, index) => {
          const pageNum = startPage + index;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-2 rounded-md ${
                pageNum === currentPage
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-indigo-500 text-white hover:bg-indigo-600"
              }`}
              type="button"
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={handleNextSet}
          disabled={endPage === totalPages}
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
          type="button"
        >
          Next
        </button>
      </div>

      {/* ✅ Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center  ">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-xl w-full md:w-1/3 lg:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">Edit</h2>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Date</label>
              <input
                type="date"
                value={currentProduct?.date || ""}
                onChange={(e) =>
                  setCurrentProduct((p) => ({ ...p, date: e.target.value }))
                }
                className="border bg-white border-slate-200 rounded-xl p-2 w-full mt-1 text-slate-900 outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">
                Company Name
              </label>
              <input
                type="text"
                value={currentProduct?.name || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, name: e.target.value })
                }
                className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Amount:</label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.amount || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    amount: e.target.value,
                  })
                }
                className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Remarks</label>
              <input
                type="text"
                value={currentProduct?.remarks || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    remarks: e.target.value,
                  })
                }
                className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              />
            </div>

            {role === "superAdmin" ? (
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Status</label>
                <select
                  value={currentProduct?.status || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      status: e.target.value,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            ) : (
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Note:</label>
                <textarea
                  value={currentProduct?.note || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      note: e.target.value,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm text-slate-700">
                Upload Document
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white"
              />
              {currentProduct?.file && (
                <p className="mt-2 text-xs text-slate-500">
                  Selected: {currentProduct.file.name}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg mr-2"
                onClick={handleUpdateProduct}
                type="button"
              >
                Save
              </button>
              <button
                className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg"
                onClick={handleModalClose}
                type="button"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ✅ Add Modal */}
      {isModalOpen1 && (
        <div className="fixed inset-0 top-12 z-10 flex items-center justify-center  ">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-xl w-full md:w-1/3 lg:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Add Payable Information
            </h2>

            <form onSubmit={handleCreateProduct}>
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Date</label>
                <input
                  type="date"
                  value={createProduct?.date || ""}
                  onChange={(e) =>
                    setCreateProduct((p) => ({ ...p, date: e.target.value }))
                  }
                  className="border bg-white border-slate-200 rounded-xl p-2 w-full mt-1 text-slate-900 outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm text-slate-700">
                  Company Name
                </label>
                <input
                  type="text"
                  value={createProduct.name}
                  onChange={(e) =>
                    setCreateProduct({ ...createProduct, name: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-700">Remarks</label>
                <input
                  type="text"
                  value={createProduct.remarks}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      remarks: e.target.value,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct.amount}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      amount: e.target.value,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-700">Note</label>
                <textarea
                  value={createProduct?.note || ""}
                  onChange={(e) =>
                    setCreateProduct((p) => ({ ...p, note: e.target.value }))
                  }
                  className="border bg-white border-slate-200 rounded-xl p-2 w-full mt-1 text-slate-900 outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-700">
                  Upload Document
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white"
                />
                {createProduct.file && (
                  <p className="mt-2 text-xs text-slate-500">
                    Selected: {createProduct.file.name}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg"
                  onClick={handleModalClose1}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {isModalOpen2 && (
        <div className="fixed inset-0 flex items-center justify-center  ">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-xl w-full md:w-1/3 lg:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Delete Meta Expense
            </h2>

            {role === "superAdmin" ? (
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Status</label>
                <select
                  value={currentProduct?.status || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      status: e.target.value,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            ) : (
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Note:</label>
                <textarea
                  value={currentProduct?.note || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      note: e.target.value,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg mr-2"
                onClick={handleUpdateProduct1}
                type="button"
              >
                Save
              </button>
              <button
                className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg"
                onClick={handleModalClose2}
                type="button"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default PayableTable;
