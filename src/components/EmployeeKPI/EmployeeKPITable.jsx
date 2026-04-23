import { motion } from "framer-motion";
import { Edit, Notebook, Plus, Trash2, BarChart3, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import Modal from "../common/Modal";
import { requestDeleteConfirmation } from "../../utils/deleteConfirmation";
import {
  useDeleteKPIMutation,
  useGetAllKPIQuery,
  useGetAllKPIWithoutQueryQuery,
  useInsertKPIMutation,
  useGetKPISettingsQuery,
  useUpdateKPIMutation,
  useUpdateKPISettingsMutation,
} from "../../features/kpi/kpi";


const parseSettingRules = (rules) => {
  if (Array.isArray(rules)) return rules;
  if (!rules) return [];

  try {
    const parsed = typeof rules === "string" ? JSON.parse(rules) : rules;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const emptyKpiForm = () => ({
  designationType: "CS",
  periodType: "Monthly",
  periodStartDate: new Date().toISOString().slice(0, 10),
  periodEndDate: new Date().toISOString().slice(0, 10),
  confirmRaw: "",
  deliveredRaw: "",
  returnParcentRaw: "",
  lateRaw: "",
  absentRaw: "",
  leaveRaw: "",
  workingTimeRaw: "",
  confirm: "",
  delivered: "",
  returnParcent: "",
  late: "",
  absent: "",
  leave: "",
  workingTime: "",
  qc: "",
  overallBehind: "",
  totalSaleAmount: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
  status: "",
});

const EmployeeKPITable = () => {
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [currentProduct, setCurrentProduct] = useState(null);
  const [noteContent, setNoteContent] = useState("");

  const [createProduct, setCreateProduct] = useState(emptyKpiForm());
  const [settingsDraft, setSettingsDraft] = useState([]);

  const [products, setProducts] = useState([]);
  const [productsData, setProductsData] = useState([]);

  // filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  // pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);

  // all kpi
  const {
    data: data2,
    isLoading: isLoading2,
    isError: isError2,
    error: error2,
  } = useGetAllKPIWithoutQueryQuery();

  useEffect(() => {
    if (isError2) {
      console.error("Error fetching KPI data", error2);
    } else if (!isLoading2 && data2) {
      setProductsData(data2?.data || []);
    }
  }, [data2, isLoading2, isError2, error2]);

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
  }, [startDate, endDate, status, itemsPerPage]);

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status || undefined,
    };

    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "") {
        delete args[k];
      }
    });

    return args;
  }, [currentPage, itemsPerPage, startDate, endDate, status]);

  const { data, isLoading, isError, error, refetch } =
    useGetAllKPIQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching KPI list", error);
    } else if (!isLoading && data) {
      setProducts(data?.data || []);
      setTotalPages(Math.ceil((data?.meta?.count || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

  const [insertKPI] = useInsertKPIMutation();
  const [updateKPI] = useUpdateKPIMutation();
  const [deleteKPI] = useDeleteKPIMutation();
  const [updateKPISettings, { isLoading: isUpdatingSettings }] =
    useUpdateKPISettingsMutation();
  const {
    data: settingsData,
    isLoading: isSettingsLoading,
    refetch: refetchSettings,
  } = useGetKPISettingsQuery();

  useEffect(() => {
    if (settingsData?.data) {
      setSettingsDraft(
        settingsData.data.map((item) => ({
          ...item,
          rules: parseSettingRules(item.rules),
        })),
      );
    }
  }, [settingsData]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleModalClose1 = () => {
    setIsModalOpen1(false);
    setCreateProduct(emptyKpiForm());
  };

  const handleModalClose2 = () => {
    setIsModalOpen2(false);
    setCurrentProduct(null);
  };

  const stripEmptyRawFields = (payload) => {
    [
      "confirmRaw",
      "deliveredRaw",
      "returnParcentRaw",
      "lateRaw",
      "absentRaw",
      "leaveRaw",
      "workingTimeRaw",
    ].forEach((field) => {
      if (payload[field] === "" || payload[field] === null) {
        delete payload[field];
      }
    });
    return payload;
  };

  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false);
    setNoteContent("");
  };

  const handleAddProduct = () => setIsModalOpen1(true);

  const handleEditClick = (product) => {
    setCurrentProduct({
      ...product,
      designationType: product.designationType ?? "CS",
      periodType: product.periodType ?? "Monthly",
      periodStartDate: product.periodStartDate ?? product.date ?? "",
      periodEndDate: product.periodEndDate ?? product.date ?? "",
      confirmRaw: product.confirmRaw ?? "",
      deliveredRaw: product.deliveredRaw ?? "",
      returnParcentRaw: product.returnParcentRaw ?? "",
      lateRaw: product.lateRaw ?? "",
      absentRaw: product.absentRaw ?? "",
      leaveRaw: product.leaveRaw ?? "",
      workingTimeRaw: product.workingTimeRaw ?? "",
      confirm: product.confirm ?? "",
      delivered: product.delivered ?? "",
      returnParcent: product.returnParcent ?? "",
      late: product.late ?? "",
      absent: product.absent ?? "",
      leave: product.leave ?? "",
      workingTime: product.workingTime ?? "",
      qc: product.qc ?? "",
      overallBehind: product.overallBehind ?? "",
      totalSaleAmount: product.totalSaleAmount ?? "",
      date: product.date ?? "",
      note: product.note ?? "",
      status: product.status ?? "",
      userId,
    });
    setIsModalOpen(true);
  };

  const handleEditClick1 = (product) => {
    setCurrentProduct({
      ...product,
      note: product.note ?? "",
      status: product.status ?? "",
      userId,
    });
    setIsModalOpen2(true);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    try {
      const payload = stripEmptyRawFields({
        designationType: createProduct.designationType,
        periodType: createProduct.periodType,
        periodStartDate: createProduct.periodStartDate,
        periodEndDate: createProduct.periodEndDate,
        confirmRaw: createProduct.confirmRaw,
        deliveredRaw: createProduct.deliveredRaw,
        returnParcentRaw: createProduct.returnParcentRaw,
        lateRaw: createProduct.lateRaw,
        absentRaw: createProduct.absentRaw,
        leaveRaw: createProduct.leaveRaw,
        workingTimeRaw: createProduct.workingTimeRaw,
        confirm: Number(createProduct.confirm || 0),
        delivered: Number(createProduct.delivered || 0),
        returnParcent: Number(createProduct.returnParcent || 0),
        late: Number(createProduct.late || 0),
        absent: Number(createProduct.absent || 0),
        leave: Number(createProduct.leave || 0),
        workingTime: Number(createProduct.workingTime || 0),
        qc: Number(createProduct.qc || 0),
        overallBehind: Number(createProduct.overallBehind || 0),
        totalSaleAmount: Number(createProduct.totalSaleAmount || 0),
        date: createProduct.date,
        note: createProduct.note,
        status: createProduct.status || "Pending",
      });

      const res = await insertKPI(payload).unwrap();

      if (res?.success) {
        toast.success("KPI created successfully");
        handleModalClose1();
        refetch?.();
      } else {
        toast.error(res?.message || "Create failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  const handleUpdateProduct = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid item!");

    try {
      const payload = stripEmptyRawFields({
        designationType: currentProduct.designationType,
        periodType: currentProduct.periodType,
        periodStartDate: currentProduct.periodStartDate,
        periodEndDate: currentProduct.periodEndDate,
        confirmRaw: currentProduct.confirmRaw,
        deliveredRaw: currentProduct.deliveredRaw,
        returnParcentRaw: currentProduct.returnParcentRaw,
        lateRaw: currentProduct.lateRaw,
        absentRaw: currentProduct.absentRaw,
        leaveRaw: currentProduct.leaveRaw,
        workingTimeRaw: currentProduct.workingTimeRaw,
        confirm: Number(currentProduct.confirm || 0),
        delivered: Number(currentProduct.delivered || 0),
        returnParcent: Number(currentProduct.returnParcent || 0),
        late: Number(currentProduct.late || 0),
        absent: Number(currentProduct.absent || 0),
        leave: Number(currentProduct.leave || 0),
        workingTime: Number(currentProduct.workingTime || 0),
        qc: Number(currentProduct.qc || 0),
        overallBehind: Number(currentProduct.overallBehind || 0),
        totalSaleAmount: Number(currentProduct.totalSaleAmount || 0),
        date: currentProduct.date,
        note: currentProduct.note,
        status: currentProduct.status,
        userId,
        actorRole: role,
      });

      const res = await updateKPI({
        id: currentProduct.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("KPI updated successfully");
        handleModalClose();
        refetch?.();
      } else {
        toast.error(res?.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleUpdateProduct1 = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid item!");
    if (role !== "superAdmin" && !String(currentProduct?.note || "").trim()) {
      return toast.error("Note is required!");
    }

    try {
      const payload = {
        note: currentProduct.note,
        status: currentProduct.status,
        userId,
        actorRole: role,
      };

      const res = await updateKPI({
        id: currentProduct.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated!");
        handleModalClose2();
        refetch?.();
      } else {
        toast.error(res?.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmDelete = await requestDeleteConfirmation({ message: "Do you want to delete this KPI?" });
    if (!confirmDelete) return;

    try {
      const res = await deleteKPI(id).unwrap();
      if (res?.success) {
        toast.success("KPI deleted successfully!");
        refetch?.();
      } else {
        toast.error(res?.message || "Delete failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  const handleNoteClick = (note) => {
    setNoteContent(note);
    setIsNoteModalOpen(true);
  };

  const updateSettingField = (settingIndex, field, value) => {
    setSettingsDraft((prev) =>
      prev.map((setting, index) =>
        index === settingIndex ? { ...setting, [field]: value } : setting,
      ),
    );
  };

  const clearSettingRules = async (settingIndex) => {
    const confirmed = await requestDeleteConfirmation({
      title: "Clear KPI ranges?",
      message:
        "All ranges for this KPI setting will be removed. You can save to apply this change.",
      confirmLabel: "Clear",
    });

    if (!confirmed) return;

    setSettingsDraft((prev) =>
      prev.map((setting, index) =>
        index === settingIndex ? { ...setting, rules: [] } : setting,
      ),
    );
  };

  const updateSettingRule = (settingIndex, ruleIndex, field, value) => {
    setSettingsDraft((prev) =>
      prev.map((setting, index) => {
        if (index !== settingIndex) return setting;
        return {
          ...setting,
          rules: setting.rules.map((rule, idx) =>
            idx === ruleIndex ? { ...rule, [field]: value } : rule,
          ),
        };
      }),
    );
  };

  const addSettingRule = (settingIndex) => {
    setSettingsDraft((prev) =>
      prev.map((setting, index) =>
        index === settingIndex
          ? {
              ...setting,
              rules: [
                ...setting.rules,
                { label: "", min: "", max: "", mark: "" },
              ],
            }
          : setting,
      ),
    );
  };

  const removeSettingRule = (settingIndex, ruleIndex) => {
    setSettingsDraft((prev) =>
      prev.map((setting, index) =>
        index === settingIndex
          ? {
              ...setting,
              rules: setting.rules.filter((_, idx) => idx !== ruleIndex),
            }
          : setting,
      ),
    );
  };

  const handleSaveSettings = async () => {
    try {
      const payload = {
        settings: settingsDraft.map((setting) => ({
          key: setting.key,
          label: setting.label,
          status: setting.status || "Active",
          rules: setting.rules.map((rule) => ({
            label: rule.label,
            min: rule.min === "" ? null : Number(rule.min),
            max: rule.max === "" ? null : Number(rule.max),
            mark: Number(rule.mark),
          })),
        })),
      };

      const res = await updateKPISettings(payload).unwrap();
      if (res?.success) {
        toast.success("KPI settings updated");
        refetchSettings?.();
        setIsSettingsModalOpen(false);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Settings update failed");
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatus("");
  };

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
      Math.min(prev + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1)),
    );

  const statusOptions = useMemo(() => {
    const base = [
      { value: "Approved", label: "Approved" },
      { value: "Pending", label: "Pending" },
      { value: "Active", label: "Active" },
    ];

    const dynamic = (productsData || [])
      .map((item) => item?.status)
      .filter(Boolean)
      .map((item) => ({
        value: item,
        label: item,
      }));

    const seen = new Set();
    return [...base, ...dynamic].filter((item) => {
      const key = String(item.value).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [productsData]);

  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        minHeight: 44,
        borderRadius: 12,
        borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0",
        boxShadow: state.isFocused
          ? "0 0 0 4px rgba(99, 102, 241, 0.15)"
          : "none",
        "&:hover": { borderColor: state.isFocused ? "#c7d2fe" : "#cbd5e1" },
      }),
      valueContainer: (base) => ({ ...base, padding: "0 12px" }),
      placeholder: (base) => ({ ...base, color: "#64748b" }),
      singleValue: (base) => ({ ...base, color: "#0f172a" }),
      menu: (base) => ({
        ...base,
        borderRadius: 12,
        overflow: "hidden",
        zIndex: 60,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "rgba(99, 102, 241, 0.12)"
          : state.isFocused
            ? "#f8fafc"
            : "#fff",
        color: "#0f172a",
      }),
    }),
    [],
  );

  const summary = useMemo(() => {
    const rows = products || [];
    return {
      delivered: rows.reduce(
        (sum, item) => sum + Number(item.delivered || 0),
        0,
      ),
      sale: rows.reduce(
        (sum, item) => sum + Number(item.totalSaleAmount || 0),
        0,
      ),
      late: rows.reduce((sum, item) => sum + Number(item.late || 0), 0),
      absent: rows.reduce((sum, item) => sum + Number(item.absent || 0), 0),
    };
  }, [products]);

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Total Delivered" value={summary.delivered} />
        <SummaryCard title="Total Sale" value={summary.sale} />
        <SummaryCard title="Total Late" value={summary.late} />
        <SummaryCard title="Total Absent" value={summary.absent} />
      </div>

      <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleAddProduct}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition px-4 py-2 rounded-xl shadow-sm font-semibold"
          >
            Add KPI <Plus size={18} />
          </button>
          {role === "superAdmin" || role === "admin" ? (
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 transition px-4 py-2 rounded-xl border border-slate-200 font-semibold"
            >
              KPI Settings <Settings size={18} />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2">
          <div className="flex items-center gap-2 text-slate-700">
            <BarChart3 size={18} className="text-amber-500" />
            <span className="text-sm">Total Records</span>
          </div>

          <span className="text-slate-900 font-semibold tabular-nums">
            {isLoading ? "Loading..." : (data?.meta?.count ?? products.length)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6 w-full justify-center mx-auto">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        <div className="flex items-center justify-center md:mt-0">
          <Select
            options={statusOptions}
            value={statusOptions.find((o) => o.value === status) || null}
            onChange={(selected) =>
              setStatus(selected?.value ? String(selected.value) : "")
            }
            placeholder="Select Status"
            isClearable
            styles={selectStyles}
            className="w-full"
          />
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

        <button
          className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 transition px-4 py-[10px] rounded-xl border border-slate-200"
          onClick={clearFilters}
          type="button"
        >
          Clear Filters
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Date",
                "Period",
                "Designation",
                "Order",
                "Delivered",
                "Return %",
                "Late",
                "Absent",
                "Leave",
                "Working Time",
                "QC",
                "Overall Behaviour",
                "Total Sale",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {(products || []).map((product) => (
              <motion.tr
                key={product.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="hover:bg-slate-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                  {product.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.periodStartDate || "-"} to {product.periodEndDate || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.designationType || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.confirm}
                  {product.confirmRaw !== null && product.confirmRaw !== undefined ? (
                    <span className="ml-1 text-xs text-slate-400">
                      ({product.confirmRaw})
                    </span>
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.delivered}
                  {product.deliveredRaw !== null && product.deliveredRaw !== undefined ? (
                    <span className="ml-1 text-xs text-slate-400">
                      ({product.deliveredRaw})
                    </span>
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.returnParcent}
                  {product.returnParcentRaw !== null &&
                  product.returnParcentRaw !== undefined ? (
                    <span className="ml-1 text-xs text-slate-400">
                      ({product.returnParcentRaw})
                    </span>
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.late}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.absent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.leave}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.workingTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.qc}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {product.overallBehind}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(product.totalSaleAmount || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                      product.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : product.status === "Active"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    {product.note ? (
                      <div className="relative">
                        <button
                          className="relative h-10 w-10 rounded-md flex items-center justify-center"
                          title={product.note}
                          type="button"
                          onClick={() => handleNoteClick(product.note)}
                        >
                          <Notebook size={18} className="text-slate-700" />
                        </button>

                        <span className="absolute top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
                          1
                        </span>
                      </div>
                    ) : (
                      <button
                        className="h-10 w-10 rounded-md flex items-center justify-center cursor-default"
                        title="No note available"
                        type="button"
                      >
                        <Notebook size={18} className="text-slate-300" />
                      </button>
                    )}

                    <button
                      onClick={() => handleEditClick(product)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-indigo-50 transition"
                      title="Edit"
                      type="button"
                    >
                      <Edit size={18} className="text-indigo-600" />
                    </button>

                    {role === "superAdmin" || role === "admin" ? (
                      <button
                        onClick={() => handleDeleteProduct(product.Id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-rose-50 transition"
                        title="Delete"
                        type="button"
                      >
                        <Trash2 size={18} className="text-rose-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick1(product)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-rose-50 transition"
                        title="Delete Request / Note"
                        type="button"
                      >
                        <Trash2 size={18} className="text-rose-600" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}

            {!isLoading && products.length === 0 && (
              <tr>
                <td
                  colSpan={15}
                  className="px-6 py-6 text-center text-sm text-slate-600"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
        <button
          onClick={handlePreviousSet}
          disabled={startPage === 1}
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition font-semibold"
          type="button"
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
              className={`px-4 py-2 rounded-xl border transition font-bold ${
                active
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
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
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition font-semibold"
          type="button"
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isNoteModalOpen}
        onClose={handleNoteModalClose}
        title="KPI Note"
      >
        <div className="p-2">
          <p className="text-slate-600 leading-relaxed font-medium">
            {noteContent}
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="KPI Data Settings"
        maxWidth="max-w-6xl"
      >
        <div className="space-y-5">
          {isSettingsLoading ? (
            <div className="text-sm text-slate-500">Loading settings...</div>
          ) : null}
          {settingsDraft.map((setting, settingIndex) => (
            <div
              key={setting.key}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <input
                    value={setting.label || ""}
                    onChange={(e) =>
                      updateSettingField(settingIndex, "label", e.target.value)
                    }
                    className="h-9 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-300"
                  />
                  <div className="text-xs text-slate-500">{setting.key}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => clearSettingRules(settingIndex)}
                    disabled={!setting.rules.length}
                    className="rounded-lg px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => addSettingRule(settingIndex)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Add Range
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 rounded-lg bg-white text-sm">
                  <thead className="bg-white">
                    <tr>
                      {["Label", "Min", "Max", "Mark", ""].map((head) => (
                        <th
                          key={head}
                          className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-400"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {setting.rules.map((rule, ruleIndex) => (
                      <tr key={`${setting.key}-${ruleIndex}`}>
                        <td className="px-3 py-2">
                          <input
                            value={rule.label ?? ""}
                            onChange={(e) =>
                              updateSettingRule(
                                settingIndex,
                                ruleIndex,
                                "label",
                                e.target.value,
                              )
                            }
                            className="h-10 w-36 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-indigo-300"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={rule.min ?? ""}
                            onChange={(e) =>
                              updateSettingRule(
                                settingIndex,
                                ruleIndex,
                                "min",
                                e.target.value,
                              )
                            }
                            className="h-10 w-24 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-indigo-300"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={rule.max ?? ""}
                            onChange={(e) =>
                              updateSettingRule(
                                settingIndex,
                                ruleIndex,
                                "max",
                                e.target.value,
                              )
                            }
                            placeholder="+"
                            className="h-10 w-24 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-indigo-300"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={rule.mark ?? ""}
                            onChange={(e) =>
                              updateSettingRule(
                                settingIndex,
                                ruleIndex,
                                "mark",
                                e.target.value,
                              )
                            }
                            className="h-10 w-24 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-indigo-300"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              removeSettingRule(settingIndex, ruleIndex)
                            }
                            className="rounded-lg px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(false)}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isUpdatingSettings}
            onClick={handleSaveSettings}
            className="rounded-xl bg-indigo-600 px-10 py-2.5 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition hover:bg-indigo-700 disabled:bg-slate-300"
          >
            Save Settings
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Edit KPI"
        maxWidth="max-w-4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Date"
            type="date"
            value={currentProduct?.date}
            onChange={(v) => setCurrentProduct({ ...currentProduct, date: v })}
            required
          />
          <SelectField
            label="Designation"
            value={currentProduct?.designationType || "CS"}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, designationType: v })
            }
            options={["CS", "UP"]}
          />
          <SelectField
            label="Period Type"
            value={currentProduct?.periodType || "Monthly"}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, periodType: v })
            }
            options={["Monthly", "Half Month"]}
          />
          <Field
            label="Period Start"
            type="date"
            value={currentProduct?.periodStartDate || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, periodStartDate: v })
            }
          />
          <Field
            label="Period End"
            type="date"
            value={currentProduct?.periodEndDate || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, periodEndDate: v })
            }
          />
          <Field
            label="Order Raw"
            type="number"
            value={currentProduct?.confirmRaw || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, confirmRaw: v })
            }
          />
          <Field
            label="Order Mark"
            value={currentProduct?.confirm || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, confirm: v })
            }
          />
          <Field
            label="Delivered Raw"
            type="number"
            value={currentProduct?.deliveredRaw || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, deliveredRaw: v })
            }
          />
          <Field
            label="Delivered Mark"
            type="number"
            value={currentProduct?.delivered || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, delivered: v })
            }
          />
          <Field
            label="Return Raw"
            type="number"
            value={currentProduct?.returnParcentRaw || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, returnParcentRaw: v })
            }
          />
          <Field
            label="Return Mark"
            type="number"
            value={currentProduct?.returnParcent || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, returnParcent: v })
            }
          />
          <Field
            label="Late Raw"
            type="number"
            value={currentProduct?.lateRaw || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, lateRaw: v })
            }
          />
          <Field
            label="Late Mark"
            type="number"
            value={currentProduct?.late || ""}
            onChange={(v) => setCurrentProduct({ ...currentProduct, late: v })}
          />
          <Field
            label="Absent Raw"
            type="number"
            value={currentProduct?.absentRaw || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, absentRaw: v })
            }
          />
          <Field
            label="Absent Mark"
            type="number"
            value={currentProduct?.absent || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, absent: v })
            }
          />
          <Field
            label="Leave Raw"
            type="number"
            value={currentProduct?.leaveRaw || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, leaveRaw: v })
            }
          />
          <Field
            label="Leave Mark"
            type="number"
            value={currentProduct?.leave || ""}
            onChange={(v) => setCurrentProduct({ ...currentProduct, leave: v })}
          />
          <Field
            label="Working Time Raw"
            type="number"
            step="0.01"
            value={currentProduct?.workingTimeRaw || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, workingTimeRaw: v })
            }
          />
          <Field
            label="Working Time Mark"
            type="number"
            value={currentProduct?.workingTime || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, workingTime: v })
            }
          />
          <Field
            label="QC"
            type="number"
            value={currentProduct?.qc || ""}
            onChange={(v) => setCurrentProduct({ ...currentProduct, qc: v })}
          />
          <Field
            label="Overall Behaviour"
            type="number"
            value={currentProduct?.overallBehind || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, overallBehind: v })
            }
          />
          <Field
            label="Total Sale Amount"
            type="number"
            step="0.01"
            value={currentProduct?.totalSaleAmount || ""}
            onChange={(v) =>
              setCurrentProduct({ ...currentProduct, totalSaleAmount: v })
            }
          />

          {role === "superAdmin" ? (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Approval Status
              </label>
              <select
                value={currentProduct?.status || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    status: e.target.value,
                  })
                }
                className="h-12 w-full px-4 rounded-xl border border-slate-200 bg-white font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="">Select Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
              </select>
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Note
              </label>
              <textarea
                value={currentProduct?.note || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, note: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleModalClose}
            className="px-6 py-2.5 border border-slate-200 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateProduct}
            className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-xl shadow-indigo-100"
            type="button"
          >
            Apply Changes
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen2}
        onClose={handleModalClose2}
        title="Action Request / Note Update"
      >
        <div className="space-y-5">
          {role === "superAdmin" ? (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Status Overwrite
              </label>
              <select
                value={currentProduct?.status || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    status: e.target.value,
                  })
                }
                className="h-12 w-full px-4 rounded-xl border border-slate-200 bg-white font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="">Select Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Request Note
              </label>
              <textarea
                value={currentProduct?.note || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, note: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                rows={4}
                placeholder="Reason for request..."
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleModalClose2}
            className="px-6 py-2.5 border border-slate-200 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateProduct1}
            className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-xl shadow-indigo-100"
            type="button"
          >
            Submit Request
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen1}
        onClose={handleModalClose1}
        title="Add KPI"
        maxWidth="max-w-4xl"
      >
        <form
          onSubmit={handleCreateProduct}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <Field
            label="Date"
            type="date"
            value={createProduct.date}
            onChange={(v) => setCreateProduct({ ...createProduct, date: v })}
            required
          />
          <SelectField
            label="Designation"
            value={createProduct.designationType}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, designationType: v })
            }
            options={["CS", "UP"]}
          />
          <SelectField
            label="Period Type"
            value={createProduct.periodType}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, periodType: v })
            }
            options={["Monthly", "Half Month"]}
          />
          <Field
            label="Period Start"
            type="date"
            value={createProduct.periodStartDate}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, periodStartDate: v })
            }
          />
          <Field
            label="Period End"
            type="date"
            value={createProduct.periodEndDate}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, periodEndDate: v })
            }
          />
          <Field
            label="Order Raw"
            type="number"
            value={createProduct.confirmRaw}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, confirmRaw: v })
            }
          />
          <Field
            label="Order Mark"
            value={createProduct.confirm}
            onChange={(v) => setCreateProduct({ ...createProduct, confirm: v })}
          />
          <Field
            label="Delivered Raw"
            type="number"
            value={createProduct.deliveredRaw}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, deliveredRaw: v })
            }
          />
          <Field
            label="Delivered Mark"
            type="number"
            value={createProduct.delivered}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, delivered: v })
            }
          />
          <Field
            label="Return Raw"
            type="number"
            value={createProduct.returnParcentRaw}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, returnParcentRaw: v })
            }
          />
          <Field
            label="Return Mark"
            type="number"
            value={createProduct.returnParcent}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, returnParcent: v })
            }
          />
          <Field
            label="Late Raw"
            type="number"
            value={createProduct.lateRaw}
            onChange={(v) => setCreateProduct({ ...createProduct, lateRaw: v })}
          />
          <Field
            label="Late Mark"
            type="number"
            value={createProduct.late}
            onChange={(v) => setCreateProduct({ ...createProduct, late: v })}
          />
          <Field
            label="Absent Raw"
            type="number"
            value={createProduct.absentRaw}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, absentRaw: v })
            }
          />
          <Field
            label="Absent Mark"
            type="number"
            value={createProduct.absent}
            onChange={(v) => setCreateProduct({ ...createProduct, absent: v })}
          />
          <Field
            label="Leave Raw"
            type="number"
            value={createProduct.leaveRaw}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, leaveRaw: v })
            }
          />
          <Field
            label="Leave Mark"
            type="number"
            value={createProduct.leave}
            onChange={(v) => setCreateProduct({ ...createProduct, leave: v })}
          />
          <Field
            label="Working Time Raw"
            type="number"
            step="0.01"
            value={createProduct.workingTimeRaw}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, workingTimeRaw: v })
            }
          />
          <Field
            label="Working Time Mark"
            type="number"
            value={createProduct.workingTime}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, workingTime: v })
            }
          />
          <Field
            label="QC"
            type="number"
            value={createProduct.qc}
            onChange={(v) => setCreateProduct({ ...createProduct, qc: v })}
          />
          <Field
            label="Overall Behaviour"
            type="number"
            value={createProduct.overallBehind}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, overallBehind: v })
            }
          />
          <Field
            label="Total Sale Amount"
            type="number"
            step="0.01"
            value={createProduct.totalSaleAmount}
            onChange={(v) =>
              setCreateProduct({ ...createProduct, totalSaleAmount: v })
            }
          />

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
              Status
            </label>
            <select
              value={createProduct.status}
              onChange={(e) =>
                setCreateProduct({ ...createProduct, status: e.target.value })
              }
              className="h-12 w-full px-4 rounded-xl border border-slate-200 bg-white font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
            >
              <option value="">Select Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
              Note
            </label>
            <textarea
              value={createProduct.note}
              onChange={(e) =>
                setCreateProduct({ ...createProduct, note: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              rows={3}
              placeholder="Additional note..."
            />
          </div>

          <div className="md:col-span-2 mt-4 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleModalClose1}
              className="px-6 py-2.5 border border-slate-200 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-xl shadow-indigo-100"
            >
              Create KPI
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
          {Number(value || 0).toLocaleString()}
        </p>
      </div>
    </div>
  </div>
);

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  step,
  readOnly,
  required,
  placeholder,
}) => (
  <div>
    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
      {label}
    </label>
    <input
      type={type}
      step={step}
      value={value ?? ""}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      readOnly={readOnly}
      required={required}
      placeholder={placeholder}
      className={`h-12 w-full px-4 rounded-xl border border-slate-200 bg-white font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition ${
        readOnly ? "opacity-70 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options = [] }) => (
  <div>
    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
      {label}
    </label>
    <select
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      className="h-12 w-full px-4 rounded-xl border border-slate-200 bg-white font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default EmployeeKPITable;
