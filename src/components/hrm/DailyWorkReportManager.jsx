import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Save,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import HrmWorkspace from "./HrmWorkspace";
import {
  useCreateDailyWorkReportMutation,
  useGetAllDailyWorkReportsQuery,
  useGetMyDailyWorkReportsQuery,
  useReviewDailyWorkReportMutation,
  useSendDailyWorkReportRemindersMutation,
  useUpdateDailyWorkReportMutation,
} from "../../features/dailyWorkReport/dailyWorkReport";

const EMPTY_FORM = {
  reportDate: new Date().toISOString().slice(0, 10),
  todayWork: "",
  tomorrowPlan: "",
  blockers: "",
};

const DailyWorkReportManager = () => {
  const role = localStorage.getItem("role") || "user";
  const canManageReports = ["superAdmin", "admin", "accountant"].includes(role);
  const today = new Date().toISOString().slice(0, 10);
  const adminPageSize = 10;

  const [form, setForm] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNote, setReviewNote] = useState("");

  const myQueryArgs = useMemo(
    () => ({
      page: 1,
      limit: 31,
      startDate: form.reportDate,
      endDate: form.reportDate,
    }),
    [form.reportDate],
  );

  const adminQueryArgs = useMemo(
    () => ({
      page: currentPage,
      limit: adminPageSize,
      searchTerm: searchTerm || undefined,
      startDate: fromDate || undefined,
      endDate: toDate || undefined,
    }),
    [currentPage, searchTerm, fromDate, toDate],
  );

  const {
    data: myReportsRes,
    isLoading: myReportsLoading,
    refetch: refetchMine,
  } = useGetMyDailyWorkReportsQuery(myQueryArgs);
  const {
    data: allReportsRes,
    isLoading: allReportsLoading,
    refetch: refetchAll,
  } = useGetAllDailyWorkReportsQuery(adminQueryArgs, {
    skip: !canManageReports,
  });

  const [createReport, { isLoading: creating }] =
    useCreateDailyWorkReportMutation();
  const [updateReport, { isLoading: updating }] =
    useUpdateDailyWorkReportMutation();
  const [reviewReport, { isLoading: reviewing }] =
    useReviewDailyWorkReportMutation();
  const [sendReminders, { isLoading: sendingReminders }] =
    useSendDailyWorkReportRemindersMutation();

  const myReports = myReportsRes?.data || [];
  const currentReport = myReports.find(
    (row) => row.reportDate === form.reportDate,
  );
  const reports = canManageReports ? allReportsRes?.data || [] : myReports;
  const reportMeta = allReportsRes?.meta || {};
  const totalReports = reportMeta?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalReports / adminPageSize));

  const stats = [
    {
      name: "Today Reports",
      value: canManageReports
        ? totalReports
        : myReports.length,
      icon: ClipboardCheck,
      iconBg: "#EEF2FF",
      iconColor: "#4338CA",
    },
    {
      name: "Reminder Date",
      value: canManageReports ? toDate : form.reportDate,
      icon: CalendarDays,
      iconBg: "#ECFDF5",
      iconColor: "#047857",
    },
  ];

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        reportDate: form.reportDate,
        todayWork: form.todayWork,
        tomorrowPlan: form.tomorrowPlan,
        blockers: form.blockers,
      };

      const res = currentReport
        ? await updateReport({ id: currentReport.Id, data: payload }).unwrap()
        : await createReport(payload).unwrap();

      if (res?.success) {
        toast.success(
          currentReport
            ? "Daily work report updated successfully"
            : "Daily work report submitted successfully",
        );
        refetchMine();
        if (canManageReports) refetchAll();
      }
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to submit daily work report",
      );
    }
  };

  const handleLoadCurrent = () => {
    if (!currentReport) {
      setForm((prev) => ({
        ...prev,
        todayWork: "",
        tomorrowPlan: "",
        blockers: "",
      }));
      return;
    }

    setForm({
      reportDate: currentReport.reportDate,
      todayWork: currentReport.todayWork || "",
      tomorrowPlan: currentReport.tomorrowPlan || "",
      blockers: currentReport.blockers || "",
    });
  };

  const handleReview = async (id, status) => {
    try {
      const res = await reviewReport({
        id,
        data: { status, reviewNote },
      }).unwrap();

      if (res?.success) {
        toast.success("Report review saved successfully");
        setReviewingId(null);
        setReviewNote("");
        refetchAll();
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save review");
    }
  };

  const handleSendReminders = async () => {
    try {
      const res = await sendReminders({ reportDate: toDate || today }).unwrap();
      toast.success(
        res?.data?.reminderCount
          ? `${res.data.reminderCount} reminder sent successfully`
          : "No pending employee found for reminder",
      );
      refetchAll();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send reminders");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromDate, toDate]);

  useEffect(() => {
    handleLoadCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentReport?.Id, form.reportDate]);

  return (
    <HrmWorkspace
      eyebrow="Daily Standard"
      title="Daily Work Reports"
      description="Employees submit end-of-day work summaries before leaving office. Admin can review daily submissions and trigger reminder notifications for missing entries."
      stats={stats}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Submit Today's Report
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Fill this before office checkout so tomorrow's plan is visible
                to the team.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
              {currentReport ? "Editing existing entry" : "New entry"}
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <div className="mb-2 text-sm font-semibold text-slate-700">
                Report Date
              </div>
              <input
                type="date"
                value={form.reportDate}
                onChange={(e) => handleFormChange("reportDate", e.target.value)}
                className="h-11 text-black w-full rounded-xl text-black border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>

            <TextArea
              label="Today, what did you complete?"
              value={form.todayWork}
              onChange={(value) => handleFormChange("todayWork", value)}
              placeholder="Write completed tasks, follow-ups, and outcomes."
              required
            />

            <TextArea
              label="What will you work on tomorrow?"
              value={form.tomorrowPlan}
              onChange={(value) => handleFormChange("tomorrowPlan", value)}
              placeholder="Write tomorrow's planned tasks and priorities."
              required
            />

            <TextArea
              label="Any blocker or support needed?"
              value={form.blockers}
              onChange={(value) => handleFormChange("blockers", value)}
              placeholder="Mention pending issue, dependency, or leave blank if none."
            />

            <button
              type="submit"
              disabled={creating || updating}
              className="inline-flex h-11 text-black items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              <Save size={16} />
              {creating || updating
                ? "Saving..."
                : currentReport
                  ? "Update Report"
                  : "Submit Report"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {canManageReports ? "Submission Monitor" : "My Recent Reports"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {canManageReports
                  ? "Review who submitted today and send reminders to missing employees."
                  : "You can update a report for the same day if work changed before leaving office."}
              </p>
            </div>
          </div>

          {canManageReports && (
            <div className="mt-5 flex flex-col gap-3 lg:flex-row">
              <label className="relative block flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employee or report text"
                  className="h-11 text-black w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-11 text-black rounded-xl border text-black border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-11 text-black rounded-xl border text-black border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
              <button
                type="button"
                onClick={handleSendReminders}
                disabled={sendingReminders}
                className="inline-flex text-black h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
              >
                <BellRing size={16} />
                {sendingReminders ? "Sending..." : "Send Reminder"}
              </button>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {canManageReports && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div>
                  Showing <span className="font-semibold text-slate-900">{reports.length}</span> of{" "}
                  <span className="font-semibold text-slate-900">{totalReports}</span> reports
                </div>
                <div>
                  Date range:{" "}
                  <span className="font-semibold text-slate-900">
                    {fromDate} to {toDate}
                  </span>
                </div>
              </div>
            )}

            {(myReportsLoading || allReportsLoading) && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Loading reports...
              </div>
            )}

            {!myReportsLoading &&
              !allReportsLoading &&
              reports.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No daily work report found for the selected filters.
                </div>
              )}

            {!myReportsLoading &&
              !allReportsLoading &&
              reports.map((row) => {
                const fullName =
                  `${row.user?.FirstName || ""} ${row.user?.LastName || ""}`.trim() ||
                  row.employee?.name ||
                  "Unknown";

                return (
                  <div
                    key={row.Id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {fullName}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{row.user?.Email || "-"}</span>
                          <span>•</span>
                          <span>{row.reportDate}</span>
                          <span>•</span>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                              row.status === "Reviewed"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>

                      {canManageReports && (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewingId((prev) =>
                              prev === row.Id ? null : row.Id,
                            );
                            setReviewNote(row.reviewNote || "");
                          }}
                          className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          {reviewingId === row.Id ? "Close Review" : "Review"}
                        </button>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <InfoBlock title="Today Work" value={row.todayWork} />
                      <InfoBlock
                        title="Tomorrow Plan"
                        value={row.tomorrowPlan}
                      />
                      <InfoBlock
                        title="Blockers"
                        value={row.blockers || "No blocker"}
                      />
                    </div>

                    {reviewingId === row.Id && canManageReports && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-sm font-semibold text-slate-800">
                          Review Note
                        </div>
                        <textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          rows={3}
                          className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                          placeholder="Add feedback or approval note"
                        />
                        <div className="mt-3 flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleReview(row.Id, "Reviewed")}
                            disabled={reviewing}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReview(row.Id, "Submitted")}
                            disabled={reviewing}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                          >
                            Keep Submitted
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            {canManageReports && totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(
                    Math.max(0, currentPage - 3),
                    Math.max(5, currentPage + 2),
                  )
                  .map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

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
          </div>
        </section>
      </div>
    </HrmWorkspace>
  );
};

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <label className="block">
    <div className="mb-2 text-sm font-semibold text-slate-700">
      {label}
      {required ? " *" : ""}
    </div>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={5}
      placeholder={placeholder}
      className="w-full text-black rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
    />
  </label>
);

const InfoBlock = ({ title, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
      {title}
    </div>
    <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
      {value || "-"}
    </div>
  </div>
);

export default DailyWorkReportManager;
