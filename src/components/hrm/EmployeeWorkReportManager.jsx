import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Edit3,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import Select from "react-select";
import toast from "react-hot-toast";
import HrmWorkspace from "./HrmWorkspace";
import {
  useCreateEmployeeWorkReportMutation,
  useDeleteEmployeeWorkReportMutation,
  useGetAllEmployeeWorkReportsQuery,
  useGetMyEmployeeWorkReportsQuery,
  useUpdateEmployeeWorkReportMutation,
} from "../../features/employeeWorkReport/employeeWorkReport";
import { useGetAllEmployeeListWithoutQueryQuery } from "../../features/employeeList/employeeList";

const today = new Date().toISOString().slice(0, 10);

const REPORT_FIELDS = [
  { key: "failedGiven", label: "Failed দেওয়া হয়েছে" },
  { key: "failedReceived", label: "Failed থেকে আসছে" },
  { key: "pendingGiven", label: "Pending দেওয়া হয়েছে" },
  { key: "pendingReceived", label: "Pending থেকে আসছে" },
  { key: "pendingReturnReceived", label: "Pending Return থেকে আসছে" },
  { key: "canceledReceived", label: "Canceled থেকে আসছে" },
  { key: "holdReceived", label: "Hold থেকে আসছে" },
  { key: "ideskGiven", label: "Idesk দেওয়া হয়েছে" },
  { key: "ideskReceived", label: "Idesk থেকে আসছে" },
  { key: "callDone", label: "Call করা হয়েছে" },
  { key: "callReceived", label: "Call থেকে আসছে" },
  { key: "whatsappDone", label: "WhatsApp করা হয়েছে" },
  { key: "whatsappReceived", label: "WhatsApp থেকে আসছে" },
  { key: "totalAssign", label: "Total Assign" },
  { key: "totalOrder", label: "Total Order" },
  { key: "totalAmount", label: "Total Amount", step: "0.01" },
];

const EMPTY_FORM = REPORT_FIELDS.reduce(
  (acc, field) => ({ ...acc, [field.key]: "" }),
  { reportDate: today },
);

const EmployeeWorkReportManager = () => {
  const role = localStorage.getItem("role") || "user";
  const canManageReports = ["superAdmin", "admin"].includes(role);
  const currentUserId = Number(localStorage.getItem("userId") || 0);
  const pageSize = 10;

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [currentPage, setCurrentPage] = useState(1);

  const currentReportArgs = useMemo(
    () => ({ page: 1, limit: 1, reportDate: form.reportDate }),
    [form.reportDate],
  );

  const listQueryArgs = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      searchTerm: searchTerm || undefined,
      employeeId: selectedEmployee?.value || undefined,
      startDate: fromDate || undefined,
      endDate: toDate || undefined,
    }),
    [currentPage, searchTerm, selectedEmployee, fromDate, toDate],
  );

  const { data: employeeListRes } = useGetAllEmployeeListWithoutQueryQuery(
    undefined,
    {
      skip: !canManageReports,
    },
  );
  const { data: currentReportRes, refetch: refetchCurrent } =
    useGetMyEmployeeWorkReportsQuery(currentReportArgs);
  const {
    data: myReportsRes,
    isLoading: myReportsLoading,
    refetch: refetchMine,
  } = useGetMyEmployeeWorkReportsQuery(listQueryArgs, {
    skip: canManageReports,
  });
  const {
    data: allReportsRes,
    isLoading: allReportsLoading,
    refetch: refetchAll,
  } = useGetAllEmployeeWorkReportsQuery(listQueryArgs, {
    skip: !canManageReports,
  });

  const [createReport, { isLoading: creating }] =
    useCreateEmployeeWorkReportMutation();
  const [updateReport, { isLoading: updating }] =
    useUpdateEmployeeWorkReportMutation();
  const [deleteReport, { isLoading: deleting }] =
    useDeleteEmployeeWorkReportMutation();

  const employeeOptions = useMemo(
    () =>
      (employeeListRes?.data || [])
        .filter((employee) => employee?.Id)
        .map((employee) => ({
          value: employee.Id,
          label: `${employee.name || "Unnamed Employee"}${
            employee.employeeCode ? ` (${employee.employeeCode})` : ""
          }`,
        })),
    [employeeListRes],
  );

  const currentReport = currentReportRes?.data?.[0];
  const reportRes = canManageReports ? allReportsRes : myReportsRes;
  const reports = reportRes?.data || [];
  const reportMeta = reportRes?.meta || {};
  const totalReports = reportMeta?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalReports / pageSize));
  const isLoading = myReportsLoading || allReportsLoading;

  const totals = reports.reduce(
    (acc, row) => ({
      totalAssign: acc.totalAssign + Number(row.totalAssign || 0),
      totalOrder: acc.totalOrder + Number(row.totalOrder || 0),
      totalAmount: acc.totalAmount + Number(row.totalAmount || 0),
    }),
    { totalAssign: 0, totalOrder: 0, totalAmount: 0 },
  );

  const stats = [
    {
      name: "Reports",
      value: totalReports,
      icon: ClipboardList,
      iconBg: "#EEF2FF",
      iconColor: "#4338CA",
    },
    {
      name: "Total Assign",
      value: totals.totalAssign,
      icon: BarChart3,
      iconBg: "#ECFDF5",
      iconColor: "#047857",
    },
    {
      name: "Total Order",
      value: totals.totalOrder,
      icon: CalendarDays,
      iconBg: "#FFF7ED",
      iconColor: "#C2410C",
    },
    {
      name: "Total Amount",
      value: totals.totalAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      icon: BarChart3,
      iconBg: "#F0F9FF",
      iconColor: "#0369A1",
    },
  ];

  const refetchReports = () => {
    refetchCurrent();
    if (canManageReports) refetchAll();
    else refetchMine();
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, reportDate: today });
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = () => ({
    reportDate: form.reportDate,
    ...REPORT_FIELDS.reduce(
      (acc, field) => ({ ...acc, [field.key]: form[field.key] || 0 }),
      {},
    ),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = buildPayload();
      const targetId = editingId || currentReport?.Id;
      const res = targetId
        ? await updateReport({ id: targetId, data: payload }).unwrap()
        : await createReport(payload).unwrap();

      if (res?.success) {
        toast.success(
          targetId ? "Work report updated" : "Work report submitted",
        );
        setEditingId(null);
        refetchReports();
      }
    } catch (err) {
      toast.error(
        err?.data?.message || err?.error || "Failed to save work report",
      );
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.Id);
    setForm({
      reportDate: row.reportDate || today,
      ...REPORT_FIELDS.reduce(
        (acc, field) => ({ ...acc, [field.key]: row[field.key] ?? "" }),
        {},
      ),
    });
  };

  const handleDelete = async (row) => {
    const ok = window.confirm("Delete this cs work report?");
    if (!ok) return;

    try {
      const res = await deleteReport(row.Id).unwrap();
      if (res?.success) {
        toast.success("Work report deleted");
        if (editingId === row.Id) resetForm();
        refetchReports();
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete work report");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEmployee, fromDate, toDate]);

  useEffect(() => {
    if (editingId) return;
    if (!currentReport) return;

    setForm({
      reportDate: currentReport.reportDate || today,
      ...REPORT_FIELDS.reduce(
        (acc, field) => ({
          ...acc,
          [field.key]: currentReport[field.key] ?? "",
        }),
        {},
      ),
    });
  }, [currentReport?.Id, editingId]);

  return (
    <HrmWorkspace
      eyebrow="Employee Report"
      title="CS Work Reports"
      description="Employees submit daily operation counts, and managers can search, compare, and filter submissions by date range."
      stats={stats}
    >
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingId || currentReport
                  ? "Edit Work Report"
                  : "Submit Work Report"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                One report can be submitted per employee for a date.
              </p>
            </div>
            {(editingId || currentReport) && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                New
              </button>
            )}
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <InputField
              label="Report Date"
              type="date"
              value={form.reportDate}
              onChange={(value) => handleFormChange("reportDate", value)}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {REPORT_FIELDS.map((field) => (
                <InputField
                  key={field.key}
                  label={field.label}
                  type="number"
                  min="0"
                  step={field.step || "1"}
                  value={form[field.key]}
                  onChange={(value) => handleFormChange(field.key, value)}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={creating || updating}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              <Save size={16} />
              {creating || updating
                ? "Saving..."
                : editingId || currentReport
                  ? "Update Report"
                  : "Submit Report"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {canManageReports ? "All Employee Reports" : "My Reports"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search by name and filter with start and end date.
              </p>
            </div>
            <div className="text-sm font-semibold text-slate-600">
              Showing {reports.length} of {totalReports}
            </div>
          </div>

          <div
            className={`mt-5 grid gap-3 ${
              canManageReports
                ? "lg:grid-cols-[260px_1fr_160px_160px]"
                : "lg:grid-cols-[1fr_160px_160px]"
            }`}
          >
            {canManageReports && (
              <Select
                value={selectedEmployee}
                onChange={setSelectedEmployee}
                options={employeeOptions}
                isClearable
                placeholder="Select employee"
                className="text-sm text-slate-900"
                styles={selectStyles}
              />
            )}
            <label className="relative block">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search something..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[1180px] w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Failed</th>
                  <th className="px-4 py-3">Pending</th>
                  <th className="px-4 py-3">Inbox</th>
                  <th className="px-4 py-3">Call</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Assign</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {isLoading && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Loading reports...
                    </td>
                  </tr>
                )}
                {!isLoading && reports.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No cs work report found.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  reports.map((row) => {
                    const canMutateRow = Number(row.user?.Id) === currentUserId;

                    return (
                      <tr key={row.Id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {row.reportDate}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {row.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {row.user?.Email || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {row.failedGiven || 0} / {row.failedReceived || 0}
                        </td>
                        <td className="px-4 py-3">
                          {row.pendingGiven || 0} / {row.pendingReceived || 0}
                        </td>
                        <td className="px-4 py-3">
                          {row.ideskGiven || 0} / {row.ideskReceived || 0}
                        </td>
                        <td className="px-4 py-3">
                          {row.callDone || 0} / {row.callReceived || 0}
                        </td>
                        <td className="px-4 py-3">
                          {row.whatsappDone || 0} / {row.whatsappReceived || 0}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {row.totalAssign || 0}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {row.totalOrder || 0}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {Number(row.totalAmount || 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {canMutateRow ? (
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(row)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                                title="Edit"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(row)}
                                disabled={deleting}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ) : (
                            <div className="text-right text-xs font-semibold text-slate-400">
                              View only
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 text-sm font-semibold text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </HrmWorkspace>
  );
};

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 12,
    borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 4px rgb(99 102 241 / 0.1)" : "none",
    "&:hover": { borderColor: state.isFocused ? "#6366f1" : "#cbd5e1" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#4f46e5"
      : state.isFocused
        ? "#eef2ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#0f172a",
  }),
};

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  ...props
}) => (
  <label className="block">
    <div className="mb-2 text-sm font-semibold text-slate-700">
      {label}
      {required ? " *" : ""}
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      {...props}
    />
  </label>
);

export default EmployeeWorkReportManager;
