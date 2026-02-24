import { motion } from "framer-motion";
import { Edit, Minus, Notebook, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  useDeletePettyCashMutation,
  useGetAllPettyCashQuery,
  useInsertPettyCashMutation,
  useUpdatePettyCashMutation,
} from "../../features/pettyCash/pettyCash";
import ReportPreviewModal from "./ReportPreviewModal";
import ReportMenu from "./ReportMenu";
import { generatePettyCashXlsx } from "../../utils/pettyCashReport/generatePettyCashXlsx";
import { generatePettyCashPdf } from "../../utils/pettyCashReport/generatePettyCashPdf";
import {
  useGetAllCategoryQuery,
  useInsertCategoryMutation,
} from "../../features/category/category";

const BANKS = [
  "Al Arafah",
  "BRAC Bank",
  "Bank Asia",
  "City Bank",
  "Dutch-Bangla Bank",
  "Dhaka Bank",
  "Eastern Bank",
  "Islami Bank",
  "Janata Bank",
  "Mutual Trust Bank",
  "One Bank",
  "Prime Bank",
  "Pubali Bank",
  "Premier Bank",
  "United Commercial Bank",
  "Sonali Bank",
  "Standard Chartered",
  "Trust Bank",
];

const STATIC_CATEGORIES = [
  "Office Expense",
  "Marketing",
  "Salary",
  "Transport",
  "Utility Bill",
  "Other",
];
const PettyCashTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // edit
  const [isModalOpen1, setIsModalOpen1] = useState(false); // add
  const [currentProduct, setCurrentProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");

  const [createProduct, setCreateProduct] = useState({
    paymentMode: "",
    paymentStatus: "",
    bankName: "",
    category: "",
    remarks: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    file: null,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [products, setProducts] = useState([]);

  // filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterPaymentMode, setFilterPaymentMode] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const userId = localStorage.getItem("userId");

  // ✅ Category states
  const [categories, setCategories] = useState([]);
  const [isNewCategoryAdd, setIsNewCategoryAdd] = useState(false);
  const [newCategoryNameAdd, setNewCategoryNameAdd] = useState("");
  const [isNewCategoryEdit, setIsNewCategoryEdit] = useState(false);
  const [newCategoryNameEdit, setNewCategoryNameEdit] = useState("");

  //Pagination calculation start
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);

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

  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate, itemsPerPage]);

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

  //Pagination calculation end

  // reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate, filterPaymentMode, filterPaymentStatus]);

  // endDate safety
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ Bank না হলে bankName reset (Add)
  useEffect(() => {
    if (createProduct.paymentMode !== "Bank" && createProduct.bankName) {
      setCreateProduct((p) => ({ ...p, bankName: "" }));
    }
  }, [createProduct.paymentMode]);

  // ✅ Bank না হলে bankName reset (Edit)
  useEffect(() => {
    if (!currentProduct) return;
    if (currentProduct.paymentMode !== "Bank" && currentProduct.bankName) {
      setCurrentProduct((p) => ({ ...p, bankName: "" }));
    }
  }, [currentProduct?.paymentMode]);

  // query args memo
  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      category: filterCategory || undefined,
      paymentMode: filterPaymentMode || undefined,
      paymentStatus: filterPaymentStatus || undefined,
      searchTerm: searchTerm || undefined, // ensure it's included in the query
    };

    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "")
        delete args[k]; // Clean empty or undefined values
    });

    return args;
  }, [
    currentPage,
    itemsPerPage,
    startDate,
    endDate,
    filterPaymentMode,
    filterPaymentStatus,
    filterCategory,
    searchTerm,
  ]);

  const { data, isLoading, isError, error, refetch } =
    useGetAllPettyCashQuery(queryArgs);

  useEffect(() => {
    if (isError) console.error("Error:", error);
    if (!isLoading && data) {
      setProducts(data?.data ?? []);
      setTotalPages(Math.ceil((data?.meta?.count || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

  // ✅ Category: fetch all
  const {
    data: categoryRes,
    isLoading: categoryLoading,
    isError: isCategoryError,
    error: categoryError,
  } = useGetAllCategoryQuery();

  useEffect(() => {
    if (isCategoryError) console.error("Category error:", categoryError);
    if (!categoryLoading && categoryRes) {
      setCategories(categoryRes?.data ?? []);
    }
  }, [categoryRes, categoryLoading, isCategoryError, categoryError]);

  // ✅ Category options: static + api
  const categoryOptions = useMemo(() => {
    const staticOnes = STATIC_CATEGORIES.map((name) => ({
      id: `static:${name}`,
      name,
      isStatic: true,
    }));

    const fromApi = (categories || []).map((c) => ({
      id: String(c.Id ?? c.id ?? c._id),
      name: c.name,
      isStatic: false,
    }));

    // de-dup by name
    const seen = new Set();
    const merged = [...staticOnes, ...fromApi].filter((x) => {
      const k = String(x.name || "")
        .toLowerCase()
        .trim();
      if (!k) return false;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return merged;
  }, [categories]);

  // ✅ Insert category mutation
  const [insertCategory, { isLoading: isAddingCategory }] =
    useInsertCategoryMutation();

  const addCategoryByName = async (name) => {
    const n = name.trim();
    if (!n) {
      toast.error("New category name is required!");
      return null;
    }

    try {
      const res = await insertCategory({ name: n }).unwrap();
      if (res?.success) {
        const created = res?.data;
        const createdId = String(created?.Id ?? created?.id ?? created?._id);
        return createdId;
      }
      toast.error(res?.message || "Category add failed!");
      return null;
    } catch (err) {
      toast.error(err?.data?.message || "Category add failed!");
      return null;
    }
  };

  // modals
  const handleAddCashIn = () => setIsModalOpen1(true);
  const handleAddCashOut = () => setIsModalOpen3(true);
  const handleModalClose1 = () => {
    setIsModalOpen1(false);
    setIsNewCategoryAdd(false);
    setNewCategoryNameAdd("");
  };

  const role = localStorage.getItem("role");
  const [updatePettyCash] = useUpdatePettyCashMutation();
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isModalOpen3, setIsModalOpen3] = useState(false);

  const handleModalClose2 = () => setIsModalOpen2(false);
  const handleModalClose3 = () => setIsModalOpen3(false);

  const handleEditClick1 = (rp) => {
    setCurrentProduct({
      ...rp,
      paymentMode: rp.paymentMode ?? "",
      paymentStatus: rp.paymentStatus ?? "",
      note: rp.note ?? "",
      status: rp.status ?? "",
      bankName: rp.bankName ?? "",
      remarks: rp.remarks ?? "",
      amount: rp.amount ?? "",
      userId: userId,
      file: null,
      category: rp.category,
    });
    setIsModalOpen2(true);
  };

  const handleUpdateProduct1 = async () => {
    const rowId = currentProduct?.Id ?? currentProduct?.id;
    if (!rowId) return toast.error("Invalid item!");

    try {
      let finalCategoryName = currentProduct.category;

      // If the category is new and being added dynamically
      if (isNewCategoryEdit) {
        const createdCategoryName =
          await addCategoryByName(newCategoryNameEdit);
        if (!createdCategoryName) return;
        finalCategoryName = createdCategoryName; // Using the newly created category name
      }

      const formData = new FormData();
      formData.append("paymentMode", currentProduct.paymentMode);
      formData.append("paymentStatus", currentProduct.paymentStatus);
      formData.append("note", currentProduct.note);
      formData.append("date", currentProduct.date);
      formData.append("status", currentProduct.status);
      formData.append("category", finalCategoryName); // Using category name here

      formData.append("userId", userId);
      formData.append("actorRole", role);
      formData.append(
        "bankName",
        currentProduct.paymentMode === "Bank" ? currentProduct.bankName : "",
      );
      formData.append("remarks", currentProduct.remarks?.trim() || "");
      formData.append("amount", String(Number(currentProduct.amount)));
      if (currentProduct.file) formData.append("file", currentProduct.file);

      const res = await updatePettyCash({ id: rowId, data: formData }).unwrap();

      if (res?.success) {
        toast.success("Updated!");
        setIsModalOpen(false);
        setCurrentProduct(null);
        setIsNewCategoryEdit(false);
        setNewCategoryNameEdit("");
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleEditClick = (rp) => {
    setCurrentProduct({
      ...rp,
      paymentMode: rp.paymentMode ?? "",
      paymentStatus: rp.paymentStatus ?? "",
      note: rp.note ?? "",
      status: rp.status ?? "",
      bankName: rp.bankName ?? "",
      remarks: rp.remarks ?? "",
      amount: rp.amount ?? "",
      date: rp.date ?? "",
      userId: userId,
      file: null,
      category: rp.category,
    });
    setIsModalOpen(true);
  };

  const handleUpdateProduct = async () => {
    const rowId = currentProduct?.Id ?? currentProduct?.id;
    if (!rowId) return toast.error("Invalid item!");

    try {
      const formData = new FormData();
      formData.append("paymentMode", currentProduct.paymentMode);
      formData.append("paymentStatus", currentProduct.paymentStatus);
      formData.append("note", currentProduct.note);
      formData.append("status", currentProduct.status);
      formData.append("date", currentProduct.date);
      formData.append("userId", userId);
      formData.append("actorRole", role);
      formData.append(
        "bankName",
        currentProduct.paymentMode === "Bank" ? currentProduct.bankName : "",
      );
      formData.append("remarks", currentProduct.remarks?.trim() || "");
      formData.append("amount", String(Number(currentProduct.amount)));
      if (currentProduct.file) formData.append("file", currentProduct.file);

      const res = await updatePettyCash({ id: rowId, data: formData }).unwrap();

      if (res?.success) {
        toast.success("Updated!");
        setIsModalOpen(false);
        setCurrentProduct(null);
        setIsNewCategoryEdit(false);
        setNewCategoryNameEdit("");
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // insert
  const [insertPettyCash] = useInsertPettyCashMutation();
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.amount) return toast.error("Amount is required!");
    if (!createProduct.paymentMode)
      return toast.error("Payment Mode is required!");
    if (createProduct.paymentMode === "Bank" && !createProduct.bankName)
      return toast.error("Bank Name is required!");
    // Category check - Make sure categoryName is either selected or added
    if (!createProduct.category && !isNewCategoryAdd) {
      return toast.error("Category is required!");
    }
    try {
      // Handling new category creation
      let finalCategoryName = createProduct.category;

      // If the category is new and being added dynamically
      if (isNewCategoryAdd) {
        const createdCategoryName = await addCategoryByName(newCategoryNameAdd);
        if (!createdCategoryName) return;
        finalCategoryName = createdCategoryName; // Using the newly created category name
      }

      const formData = new FormData();
      formData.append("paymentMode", createProduct.paymentMode);
      formData.append("date", createProduct.date);
      formData.append("paymentStatus", "CashIn");
      formData.append(
        "bankName",
        createProduct.paymentMode === "Bank" ? createProduct.bankName : "",
      );
      formData.append("category", finalCategoryName); // Using category name here

      formData.append("remarks", createProduct.remarks?.trim() || "");
      formData.append("amount", String(Number(createProduct.amount)));
      if (createProduct.file) formData.append("file", createProduct.file);

      const res = await insertPettyCash(formData).unwrap();

      if (res?.success) {
        toast.success("Successfully created!");
        setIsModalOpen1(false);
        setCreateProduct({
          paymentMode: "",
          paymentStatus: "",
          bankName: "",
          bankAccount: "",
          remarks: "",
          amount: "",
          category: "", // Reset the category name
          date: "",
          file: null,
        });
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };
  const handleCreateProduct1 = async (e) => {
    e.preventDefault();

    if (!createProduct.amount) return toast.error("Amount is required!");
    if (!createProduct.paymentMode)
      return toast.error("Payment Mode is required!");
    if (createProduct.paymentMode === "Bank" && !createProduct.bankName)
      return toast.error("Bank Name is required!");
    // Category check - Make sure categoryName is either selected or added
    if (!createProduct.category && !isNewCategoryAdd) {
      return toast.error("Category is required!");
    }
    try {
      // Handling new category creation
      let finalCategoryName = createProduct.category;

      // If the category is new and being added dynamically
      if (isNewCategoryAdd) {
        const createdCategoryName = await addCategoryByName(newCategoryNameAdd);
        if (!createdCategoryName) return;
        finalCategoryName = createdCategoryName; // Using the newly created category name
      }

      const formData = new FormData();
      formData.append("paymentMode", createProduct.paymentMode);
      formData.append("date", createProduct.date);
      formData.append("paymentStatus", "CashOut");
      formData.append(
        "bankName",
        createProduct.paymentMode === "Bank" ? createProduct.bankName : "",
      );
      formData.append("category", finalCategoryName); // Using category name here

      formData.append("remarks", createProduct.remarks?.trim() || "");
      formData.append("amount", String(Number(createProduct.amount)));
      if (createProduct.file) formData.append("file", createProduct.file);

      const res = await insertPettyCash(formData).unwrap();

      if (res?.success) {
        toast.success("Successfully created!");
        setIsModalOpen3(false);
        setCreateProduct({
          paymentMode: "",
          paymentStatus: "",
          bankName: "",
          bankAccount: "",
          remarks: "",
          amount: "",
          category: "", // Reset the category name
          date: "",
          file: null,
        });
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // delete
  const [deletePettyCash] = useDeletePettyCashMutation();
  const handleDeleteProduct = async (rowId) => {
    if (!rowId) return toast.error("Invalid item!");
    if (!window.confirm("Do you want to delete this item?")) return;

    try {
      const res = await deletePettyCash(rowId).unwrap();
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
    setFilterPaymentMode("");
    setFilterPaymentStatus("");
  };

  // report states
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [reportType, setReportType] = useState(""); // "pdf" | "sheet"
  const [reportBlob, setReportBlob] = useState(null);
  const [reportBlobUrl, setReportBlobUrl] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [sheetPreview, setSheetPreview] = useState({ header: [], rows: [] });

  const closeReportPreview = () => {
    setIsReportPreviewOpen(false);
    setReportType("");
    setReportBlob(null);
    setSheetPreview({ header: [], rows: [] });
    setReportLoading(false);

    if (reportBlobUrl) {
      URL.revokeObjectURL(reportBlobUrl);
      setReportBlobUrl("");
    }
  };

  const handleReportPdf = async () => {
    try {
      if (!products.length) return toast.error("No data found!");

      setReportType("pdf");
      setReportLoading(true);
      setIsReportPreviewOpen(true);
      setIsReportMenuOpen(false);

      const blob = await generatePettyCashPdf({ products });

      const url = URL.createObjectURL(blob);
      setReportBlob(blob);
      setReportBlobUrl(url);
    } catch (e) {
      toast.error("PDF report generate failed!");
      closeReportPreview();
    } finally {
      setReportLoading(false);
    }
  };

  const handleReportSheet = async () => {
    try {
      if (!products.length) return toast.error("No data found!");

      setReportType("sheet");
      setReportLoading(true);
      setIsReportPreviewOpen(true);
      setIsReportMenuOpen(false);

      const { blob, preview } = generatePettyCashXlsx({ products });

      const url = URL.createObjectURL(blob);

      setReportBlob(blob);
      setReportBlobUrl(url);
      setSheetPreview(preview);
    } catch (e) {
      toast.error("Sheet report generate failed!");
      closeReportPreview();
    } finally {
      setReportLoading(false);
    }
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {/* CashIn */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-emerald-50/70 to-transparent" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total CashIn</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
                {isLoading
                  ? "—"
                  : Number(data?.meta?.totalCashIn || 0).toLocaleString()}
              </p>
            </div>

            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-emerald-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* CashOut */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-rose-50/70 to-transparent" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Total CashOut
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
                {isLoading
                  ? "—"
                  : Number(data?.meta?.totalCashOut || 0).toLocaleString()}
              </p>
            </div>

            <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-rose-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14" />
                <path d="M19 12l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Net */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-indigo-50/70 to-transparent" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Net Balance</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
                {isLoading
                  ? "—"
                  : Number(data?.meta?.netBalance || 0).toLocaleString()}
              </p>
            </div>

            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 19V5" />
                <path d="M8 17V7" />
                <path d="M12 19V9" />
                <path d="M16 15V5" />
                <path d="M20 19V11" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Header row */}
      {/* <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
     
        <button
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition w-full sm:w-auto"
          onClick={handleAddProduct}
          type="button"
        >
          Add <Plus size={18} className="ml-2" />
        </button>

        <div className="flex justify-end">
          <ReportMenu
            isOpen={isReportMenuOpen}
            setIsOpen={setIsReportMenuOpen}
            onGoogleSheet={handleReportSheet}
            onPdf={handleReportPdf}
            disabled={isLoading}
          />
        </div>
      </div> */}

      <div className="my-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Actions */}
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-5">
          {/* Cash In (Primary) */}
          <button
            type="button"
            onClick={handleAddCashIn}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:w-auto"
          >
            <Plus size={18} />
            Cash In
          </button>

          {/* Cash Out (Secondary / Neutral) */}
          <button
            type="button"
            onClick={handleAddCashOut}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 border border-slate-200 shadow-md hover:bg-slate-50 active:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-auto"
          >
            <Minus size={18} className="text-slate-700" />
            Cash Out
          </button>
        </div>

        {/* Right: Search Input */}
        <div className="relative w-full sm:max-w-[520px]">
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
              setStartPage(1);
            }}
            placeholder="Search..."
            className="w-full rounded-lg border border-gray-200 bg-white px-5 py-3 pr-12 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 shadow-sm"
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
        </div>

        {/* Right: Report Menu */}
        <div className="flex w-full justify-end sm:w-auto">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-md">
            <ReportMenu
              isOpen={isReportMenuOpen}
              setIsOpen={setIsReportMenuOpen}
              onGoogleSheet={handleReportSheet}
              onPdf={handleReportPdf}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center mb-6 w-full justify-center mx-auto">
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

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Payment Mode:</label>
          <select
            value={filterPaymentMode}
            onChange={(e) => setFilterPaymentMode(e.target.value)}
            className="border py-2 border-slate-300 rounded-lg px-3 text-slate-900 bg-white w-full outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          >
            <option value="">All</option>
            <option value="Cash">Cash</option>
            <option value="Bkash">Bkash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Bank">Bank</option>
            <option value="Card">Card</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Payment Status:</label>
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="border py-2 border-slate-300 rounded-lg px-3 text-slate-900 bg-white w-full outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          >
            <option value="">All</option>
            <option value="CashIn">CashIn</option>
            <option value="CashOut">CashOut</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border py-2 border-slate-300 rounded-lg px-3 text-slate-900 bg-white w-full outline-none
               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          >
            <option value="">All</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Per Page</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
              setStartPage(1);
            }}
            className="px-3 py-[10px] rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div>
          <button
            className="flex items-center mt-0 md:mt-6 bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded-lg w-36 justify-center mx-auto md:col-span-5"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Payment Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Bank
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Payment Status
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
                    {rp.date || "-"}
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
                    {rp.category || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.paymentMode || "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.paymentMode === "Bank" ? rp.bankName || "-" : "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.paymentStatus || "-"}
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

                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                  </td> */}

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
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
                        className="text-indigo-600 hover:text-indigo-700"
                        type="button"
                      >
                        <Edit size={18} />
                      </button>

                      {role === "superAdmin" || role === "admin" ? (
                        <button
                          onClick={() => handleDeleteProduct(rowId)}
                          className="text-red-600 hover:text-red-700"
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditClick1(rp)}
                          className="text-red-600 hover:text-red-700"
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
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
                  colSpan={7}
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
      <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
        <button
          onClick={handlePreviousSet}
          disabled={startPage === 1}
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
        >
          Prev
        </button>

        {[...Array(endPage - startPage + 1)].map((_, index) => {
          const pageNum = startPage + index;
          const active = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-4 py-2 rounded-xl border transition ${
                active
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={handleNextSet}
          disabled={endPage === totalPages}
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {isModalOpen && currentProduct && (
        <div className="fixed inset-0 top-32 flex items-center justify-center  ">
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
                Payment Mode
              </label>
              <select
                value={currentProduct.paymentMode || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    paymentMode: e.target.value,
                  })
                }
                className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                required
              >
                <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Bkash">Bkash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Bank">Bank</option>
                <option value="Card">Card</option>
              </select>
            </div>

            {currentProduct.paymentMode === "Bank" && (
              <div className="mt-4">
                <label className="block text-sm text-slate-700">
                  Bank Name
                </label>
                <select
                  value={currentProduct.bankName || ""}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      bankName: e.target.value,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  required
                >
                  <option value="">Select Bank</option>
                  {BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm text-slate-700">
                Payment Status
              </label>
              <select
                value={currentProduct.paymentStatus || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    paymentStatus: e.target.value,
                  })
                }
                className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                required
              >
                <option value="">Select Payment Status</option>
                <option value="CashIn">CashIn</option>
                <option value="CashOut">CashOut</option>
              </select>
            </div>

            {/* ✅ Category (Edit) */}
            <div className="mt-4">
              <label className="block text-sm text-slate-600 mb-1">
                Category
              </label>
              <select
                value={
                  isNewCategoryAdd ? "__new__" : createProduct.category || ""
                }
                onChange={(e) => {
                  const v = e.target.value;

                  if (v === "__new__") {
                    setIsNewCategoryAdd(true);
                    setCreateProduct((p) => ({ ...p, category: "" }));
                    return;
                  }

                  setIsNewCategoryAdd(false);
                  setNewCategoryNameAdd("");
                  setCreateProduct((p) => ({ ...p, category: v }));
                }}
                className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                required
              >
                <option value="">Select Category</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="__new__">+ New Category</option>
              </select>

              {isNewCategoryAdd && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newCategoryNameAdd}
                    onChange={(e) => setNewCategoryNameAdd(e.target.value)}
                    placeholder="Write new category name"
                    className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                   focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const createdCategoryName =
                        await addCategoryByName(newCategoryNameAdd);
                      if (!createdCategoryName) return;

                      // Set the newly added category name
                      setCreateProduct((p) => ({
                        ...p,
                        category: createdCategoryName, // Update the category state
                      }));

                      setIsNewCategoryAdd(false);
                      setNewCategoryNameAdd("");
                    }}
                    disabled={isAddingCategory}
                    className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:bg-slate-400"
                  >
                    {isAddingCategory ? "Adding..." : "Add"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Remarks</label>
              <input
                type="text"
                value={currentProduct.remarks || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    remarks: e.target.value,
                  })
                }
                className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Amount:</label>
              <input
                type="number"
                step="0.01"
                value={currentProduct.amount ?? ""}
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

            {role === "superAdmin" ? (
              <div className="mt-4">
                <label className="block text-sm text-slate-700">Status</label>
                <select
                  value={currentProduct.status || ""}
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
                  type="text"
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
              {currentProduct.file && (
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
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentProduct(null);
                  setIsNewCategoryAdd(false);
                  setNewCategoryNameAdd("");
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add petty cash in  */}
      {isModalOpen1 && (
        <div className="fixed inset-0 top-12 z-10 flex items-center justify-center  ">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-xl w-full md:w-1/3 lg:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Add Petty Cash In
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
                  Payment Mode
                </label>
                <select
                  value={createProduct.paymentMode}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      paymentMode: e.target.value,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Bkash">Bkash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank">Bank</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {createProduct.paymentMode === "Bank" && (
                <div className="mt-4">
                  <label className="block text-sm text-slate-700">
                    Bank Name
                  </label>
                  <select
                    value={createProduct.bankName}
                    onChange={(e) =>
                      setCreateProduct({
                        ...createProduct,
                        bankName: e.target.value,
                      })
                    }
                    className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                    required
                  >
                    <option value="">Select Bank</option>
                    {BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* <div className="mt-4">
                <label className="block text-sm text-slate-700">
                  Payment Status
                </label>
                <select
                  value={createProduct.paymentStatus}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      paymentStatus: e.target.value,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  required
                >
                  <option value="">Select Payment Status</option>
                  <option value="CashIn">CashIn</option>
                  <option value="CashOut">CashOut</option>
                </select>
              </div> */}

              {/* ✅ Category (Add) */}
              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={
                    isNewCategoryAdd ? "__new__" : createProduct.category || ""
                  }
                  onChange={(e) => {
                    const v = e.target.value;

                    if (v === "__new__") {
                      setIsNewCategoryAdd(true);
                      setCreateProduct((p) => ({ ...p, category: "" }));
                      return;
                    }

                    setIsNewCategoryAdd(false);
                    setNewCategoryNameAdd("");
                    setCreateProduct((p) => ({ ...p, category: v }));
                  }}
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value="__new__">+ New Category</option>
                </select>

                {isNewCategoryAdd && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newCategoryNameAdd}
                      onChange={(e) => setNewCategoryNameAdd(e.target.value)}
                      placeholder="Write new category name"
                      className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                   focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const createdCategoryName =
                          await addCategoryByName(newCategoryNameAdd);
                        if (!createdCategoryName) return;

                        // Set the newly added category name
                        setCreateProduct((p) => ({
                          ...p,
                          category: createdCategoryName, // Update the category state
                        }));

                        setIsNewCategoryAdd(false);
                        setNewCategoryNameAdd("");
                      }}
                      disabled={isAddingCategory}
                      className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:bg-slate-400"
                    >
                      {isAddingCategory ? "Adding..." : "Add"}
                    </button>
                  </div>
                )}
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

      {/* Add petty cash out  */}
      {isModalOpen3 && (
        <div className="fixed inset-0 top-12 z-10 flex items-center justify-center  ">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-xl w-full md:w-1/3 lg:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Add Petty Cash Out
            </h2>

            <form onSubmit={handleCreateProduct1}>
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
                  Payment Mode
                </label>
                <select
                  value={createProduct.paymentMode}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      paymentMode: e.target.value,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Bkash">Bkash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank">Bank</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {createProduct.paymentMode === "Bank" && (
                <div className="mt-4">
                  <label className="block text-sm text-slate-700">
                    Bank Name
                  </label>
                  <select
                    value={createProduct.bankName}
                    onChange={(e) =>
                      setCreateProduct({
                        ...createProduct,
                        bankName: e.target.value,
                      })
                    }
                    className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                    required
                  >
                    <option value="">Select Bank</option>
                    {BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* <div className="mt-4">
                <label className="block text-sm text-slate-700">
                  Payment Status
                </label>
                <select
                  value={createProduct.paymentStatus}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      paymentStatus: e.target.value,
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  required
                >
                  <option value="">Select Payment Status</option>
                  <option value="CashIn">CashIn</option>
                  <option value="CashOut">CashOut</option>
                </select>
              </div> */}

              {/* ✅ Category (Add) */}
              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={
                    isNewCategoryAdd ? "__new__" : createProduct.category || ""
                  }
                  onChange={(e) => {
                    const v = e.target.value;

                    if (v === "__new__") {
                      setIsNewCategoryAdd(true);
                      setCreateProduct((p) => ({ ...p, category: "" }));
                      return;
                    }

                    setIsNewCategoryAdd(false);
                    setNewCategoryNameAdd("");
                    setCreateProduct((p) => ({ ...p, category: v }));
                  }}
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value="__new__">+ New Category</option>
                </select>

                {isNewCategoryAdd && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newCategoryNameAdd}
                      onChange={(e) => setNewCategoryNameAdd(e.target.value)}
                      placeholder="Write new category name"
                      className="h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                   focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const createdCategoryName =
                          await addCategoryByName(newCategoryNameAdd);
                        if (!createdCategoryName) return;

                        // Set the newly added category name
                        setCreateProduct((p) => ({
                          ...p,
                          category: createdCategoryName, // Update the category state
                        }));

                        setIsNewCategoryAdd(false);
                        setNewCategoryNameAdd("");
                      }}
                      disabled={isAddingCategory}
                      className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:bg-slate-400"
                    >
                      {isAddingCategory ? "Adding..." : "Add"}
                    </button>
                  </div>
                )}
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
                  onClick={handleModalClose3}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete/Note Modal */}
      {isModalOpen2 && (
        <div className="fixed inset-0 flex items-center justify-center  ">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-xl w-full md:w-1/3 lg:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Delete Petty Cash In/Out
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
                  type="text"
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

      <ReportPreviewModal
        open={isReportPreviewOpen}
        onClose={closeReportPreview}
        type={reportType}
        blob={reportBlob}
        blobUrl={reportBlobUrl}
        sheetPreview={sheetPreview}
        loading={reportLoading}
      />
    </motion.div>
  );
};

export default PettyCashTable;
