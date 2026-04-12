import { useMemo, useState } from "react";
import { Cpu, Fingerprint, Play, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import HrmWorkspace from "./HrmWorkspace";
import {
  useCreateAttendanceLogMutation,
  useGetAllAttendanceLogsQuery,
  useProcessDailyAttendanceMutation,
} from "../../features/attendanceLog/attendanceLog";
import { useGetAllAttendanceDevicesQuery } from "../../features/attendanceDevice/attendanceDevice";
import { useGetAllAttendanceEnrollmentsQuery } from "../../features/attendanceEnrollment/attendanceEnrollment";
import { useGetAllAttendanceSummariesQuery } from "../../features/attendanceSummary/attendanceSummary";

const initialForm = {
  attendanceDeviceId: "",
  employeeId: "",
  deviceUserId: "",
  punchTime: new Date().toISOString().slice(0, 16),
  punchType: "check",
  verificationMethod: "face",
  syncBatchId: "",
  note: "",
};

const AttendanceLogsManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const queryArgs = useMemo(
    () => ({
      page: 1,
      limit: 200,
      searchTerm: searchTerm || undefined,
      from: selectedDate || undefined,
      to: selectedDate || undefined,
    }),
    [searchTerm, selectedDate],
  );

  const { data, isLoading, refetch } = useGetAllAttendanceLogsQuery(queryArgs);
  const { data: summariesRes } = useGetAllAttendanceSummariesQuery({
    page: 1,
    limit: 200,
    from: selectedDate,
    to: selectedDate,
  });
  const { data: devicesRes } = useGetAllAttendanceDevicesQuery({ page: 1, limit: 500 });
  const { data: enrollmentsRes } = useGetAllAttendanceEnrollmentsQuery({
    page: 1,
    limit: 500,
  });

  const [createLog, { isLoading: isCreating }] = useCreateAttendanceLogMutation();
  const [processDaily, { isLoading: isProcessing }] = useProcessDailyAttendanceMutation();

  const rows = data?.data || [];
  const devices = devicesRes?.data || [];
  const enrollments = enrollmentsRes?.data || [];
  const summaries = summariesRes?.data || [];

  const stats = [
    {
      name: "Raw Logs",
      value: rows.length,
      icon: Fingerprint,
      iconBg: "#EEF2FF",
      iconColor: "#4338CA",
    },
    {
      name: "Processed Summary Rows",
      value: summaries.length,
      icon: Cpu,
      iconBg: "#ECFDF5",
      iconColor: "#047857",
    },
  ];

  const setFieldValue = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.deviceUserId) return toast.error("Device user id is required");
    if (!form.punchTime) return toast.error("Punch time is required");

    try {
      const res = await createLog({
        attendanceDeviceId: form.attendanceDeviceId ? Number(form.attendanceDeviceId) : null,
        employeeId: form.employeeId ? Number(form.employeeId) : null,
        deviceUserId: form.deviceUserId,
        punchTime: new Date(form.punchTime).toISOString(),
        punchType: form.punchType,
        verificationMethod: form.verificationMethod,
        syncBatchId: form.syncBatchId || null,
        note: form.note || null,
      }).unwrap();

      if (res?.success) {
        toast.success("Raw attendance log added");
        setIsCreateOpen(false);
        setForm(initialForm);
        refetch?.();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create attendance log");
    }
  };

  const handleProcess = async () => {
    if (!selectedDate) return toast.error("Select a date first");

    try {
      const res = await processDaily(selectedDate).unwrap();
      toast.success(res?.data?.processedEmployees ? `Processed ${res.data.processedEmployees} employees` : "Attendance processed");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to process attendance");
    }
  };

  return (
    <HrmWorkspace
      eyebrow="Phase 2"
      title="Attendance Logs"
      description="Review machine punches, manually ingest test logs and trigger daily attendance processing for biometric data."
      stats={stats}
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Processing Console</h3>
            <p className="mt-1 text-sm text-slate-500">
              Filter one day of logs, then process summaries after machine sync is complete.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs"
                className="h-11 min-w-[220px] rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
            <button
              type="button"
              onClick={handleProcess}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <Play size={16} />
              {isProcessing ? "Processing..." : "Process Day"}
            </button>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus size={16} />
              Add Raw Log
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <div>
            <div className="text-sm font-semibold text-slate-800">Machine Punches</div>
            <div className="text-xs text-slate-500">{rows.length} logs loaded</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Device User</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Device</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Punch Time</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Method</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((row) => (
                  <tr key={row.Id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{row.employee?.name || "-"}</div>
                      <div className="text-xs text-slate-500">
                        {row.employee?.employeeCode || row.employee?.employee_id || "Unmatched"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.deviceUserId}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.device?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(row.punchTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.verificationMethod || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {row.processingStatus || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12">
                    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
                      <div className="text-base font-semibold text-slate-800">No machine logs found</div>
                      <p className="mt-2 text-sm text-slate-500">
                        Start by recording raw machine punches or syncing from the device middleware.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Raw Attendance Log"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Device</span>
              <select
                value={form.attendanceDeviceId}
                onChange={(e) => setFieldValue("attendanceDeviceId", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="">Select Device</option>
                {devices.map((device) => (
                  <option key={device.Id} value={device.Id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Device User ID</span>
              <input
                value={form.deviceUserId}
                onChange={(e) => setFieldValue("deviceUserId", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                list="attendance-device-user-ids"
              />
              <datalist id="attendance-device-user-ids">
                {enrollments.map((enrollment) => (
                  <option key={enrollment.Id} value={enrollment.deviceUserId}>
                    {enrollment.employee?.name}
                  </option>
                ))}
              </datalist>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Punch Time</span>
              <input
                type="datetime-local"
                value={form.punchTime}
                onChange={(e) => setFieldValue("punchTime", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Verification Method</span>
              <select
                value={form.verificationMethod}
                onChange={(e) => setFieldValue("verificationMethod", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="face">Face</option>
                <option value="fingerprint">Fingerprint</option>
                <option value="card">Card</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Punch Type</span>
              <select
                value={form.punchType}
                onChange={(e) => setFieldValue("punchType", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="check">Check</option>
                <option value="in">In</option>
                <option value="out">Out</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Sync Batch ID</span>
              <input
                value={form.syncBatchId}
                onChange={(e) => setFieldValue("syncBatchId", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Note</span>
            <textarea
              rows={4}
              value={form.note}
              onChange={(e) => setFieldValue("note", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {isCreating ? "Saving..." : "Save Log"}
            </button>
          </div>
        </form>
      </Modal>
    </HrmWorkspace>
  );
};

export default AttendanceLogsManager;
