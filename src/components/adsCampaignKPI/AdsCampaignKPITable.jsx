import { useMemo, useState } from "react";
import {
  BarChart3,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useDeleteAdsCampaignKPIMutation,
  useGetAdsCampaignKPIPerformanceGraphQuery,
  useGetAllAdsCampaignKPIQuery,
  useInsertAdsCampaignKPIMutation,
  useUpdateAdsCampaignKPIMutation,
} from "../../features/adsCampaignKPI/adsCampaignKPI";

const getDefaultForm = () => ({
  campaignName: "",
  platform: "Facebook",
  date: toDateInputValue(new Date()),
  spend: "",
  conversions: "",
  revenue: "",
  status: "Active",
  note: "",
});

const platformOptions = [
  "Facebook",
  "Google",
  "TikTok",
  "SEO",
  "YouTube",
  "Other",
];
const statusOptions = ["Active", "Paused", "Completed", "Pending"];

const metricFields = [
  { key: "spend", label: "Spend", prefix: "৳" },
  { key: "revenue", label: "Revenue", prefix: "৳" },
  { key: "roas", label: "ROAS", suffix: "x" },
  { key: "cpr", label: "CPR", prefix: "৳" },
  { key: "result", label: "Result", digits: 0 },
];

const inputFields = [
  ["spend", "Spend"],
  ["conversions", "Result"],
  ["revenue", "Revenue"],
];

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDatePresetRange = (preset) => {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);

  if (preset === "today") {
    return { date: toDateInputValue(today), startDate: "", endDate: "" };
  }

  if (preset === "yesterday") {
    start.setDate(today.getDate() - 1);
    return { date: toDateInputValue(start), startDate: "", endDate: "" };
  }

  if (preset === "this_week") {
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(today.getDate() + diffToMonday);
    return {
      date: "",
      startDate: toDateInputValue(start),
      endDate: toDateInputValue(end),
    };
  }

  if (preset === "this_month") {
    start.setDate(1);
    return {
      date: "",
      startDate: toDateInputValue(start),
      endDate: toDateInputValue(end),
    };
  }

  return { date: "", startDate: "", endDate: "" };
};

const formatNumber = (value, digits = 2) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0";
  return numericValue.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
};

const formatMetric = (value, metric = {}) => {
  const number = formatNumber(value, metric.digits ?? 2);
  return `${metric.prefix || ""}${number}${metric.suffix || ""}`;
};

const normalizeForm = (form) => {
  const payload = { ...form };
  inputFields.forEach(([key]) => {
    payload[key] = Number(payload[key] || 0);
  });
  return payload;
};

const AdsCampaignKPITable = () => {
  const [datePreset, setDatePreset] = useState("this_week");
  const [filters, setFilters] = useState({
    searchTerm: "",
    platform: "",
    status: "",
    ...getDatePresetRange("this_week"),
  });
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(getDefaultForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const queryArgs = useMemo(
    () => ({
      ...filters,
      page,
      limit: 10,
    }),
    [filters, page],
  );

  const { data, isLoading, isFetching, refetch } =
    useGetAllAdsCampaignKPIQuery(queryArgs);
  const { data: graphRes } = useGetAdsCampaignKPIPerformanceGraphQuery(filters);
  const [insertAdsCampaignKPI, { isLoading: isCreating }] =
    useInsertAdsCampaignKPIMutation();
  const [updateAdsCampaignKPI, { isLoading: isUpdating }] =
    useUpdateAdsCampaignKPIMutation();
  const [deleteAdsCampaignKPI] = useDeleteAdsCampaignKPIMutation();

  const rows = data?.data || [];
  const meta = data?.meta || {};
  const summary = meta.summary || {};
  const graphRows = graphRes?.data || [];
  const totalPages = Math.max(1, Math.ceil((meta.count || 0) / 10));
  const isSaving = isCreating || isUpdating;

  const maxGraphRoas = Math.max(
    1,
    ...graphRows.map((item) => Number(item.roas || 0)),
  );

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateDatePreset = (preset) => {
    setDatePreset(preset);
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      ...getDatePresetRange(preset),
    }));
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(getDefaultForm());
    setEditingId(null);
    setIsFormOpen(false);
  };

  const showSavedEntryDate = (entryDate) => {
    if (!entryDate) return;

    setDatePreset("custom");
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      date: "",
      startDate: entryDate,
      endDate: entryDate,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = normalizeForm(form);

    try {
      if (editingId) {
        await updateAdsCampaignKPI({ id: editingId, data: payload }).unwrap();
        toast.success("Campaign KPI updated");
      } else {
        await insertAdsCampaignKPI(payload).unwrap();
        toast.success("Campaign KPI created");
      }
      showSavedEntryDate(payload.date);
      resetForm();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save campaign KPI");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.Id);
    setForm({
      campaignName: row.campaignName || "",
      platform: row.platform || "Facebook",
      date: row.date || "",
      spend: row.spend || "",
      conversions: row.conversions || "",
      revenue: row.revenue || "",
      status: row.status || "Active",
      note: row.note || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this campaign KPI?")) return;

    try {
      await deleteAdsCampaignKPI(id).unwrap();
      toast.success("Campaign KPI deleted");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete campaign KPI");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-600">Marketing</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Ads Campaign KPI
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <RefreshCcw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(true);
              setEditingId(null);
              setForm(getDefaultForm());
            }}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus size={16} />
            Add Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {metricFields.map((metric) => (
          <div
            key={metric.key}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {metric.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-900">
              {formatMetric(summary[metric.key], metric)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-5">
              <label className="relative md:col-span-2">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={filters.searchTerm}
                  onChange={(event) =>
                    updateFilter("searchTerm", event.target.value)
                  }
                  className="h-10 w-full bg-white rounded-md border border-gray-200 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-orange-400"
                  placeholder="Search campaign"
                />
              </label>
              <select
                value={filters.platform}
                onChange={(event) =>
                  updateFilter("platform", event.target.value)
                }
                className="h-10 bg-white rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-orange-400"
              >
                <option value="">All platforms</option>
                {platformOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value)}
                className="h-10 bg-white rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-orange-400"
              >
                <option value="">All status</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={datePreset}
                onChange={(event) => updateDatePreset(event.target.value)}
                className="h-10 bg-white rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-orange-400"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {datePreset === "custom" ? (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) =>
                    updateFilter("startDate", event.target.value)
                  }
                  className="h-10 w-full bg-white rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-orange-400"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) =>
                    updateFilter("endDate", event.target.value)
                  }
                  className="h-10 w-full bg-white rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-orange-400"
                />
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Campaign",
                      "Spend",
                      "Revenue",
                      "ROAS",
                      "CPR",
                      "Result",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        Loading campaign KPI...
                      </td>
                    </tr>
                  ) : rows.length ? (
                    rows.map((row) => (
                      <tr key={row.Id} className="hover:bg-orange-50/40">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {row.campaignName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {row.platform} • {row.date || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          ৳{formatNumber(row.spend)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          ৳{formatNumber(row.revenue)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatNumber(row.roas)}x
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          ৳{formatNumber(row.cpr ?? row.cpa)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatNumber(row.result ?? row.conversions, 0)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(row)}
                              className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(row.Id)}
                              className="rounded-md border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        No campaign KPI found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="rounded-md border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="rounded-md border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          {isFormOpen ? (
            <form
              onSubmit={handleSubmit}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? "Edit Campaign" : "Add Campaign"}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  value={form.campaignName}
                  onChange={(event) =>
                    updateForm("campaignName", event.target.value)
                  }
                  required
                  className="h-10 w-full bg-white rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-orange-400"
                  placeholder="Campaign name"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={form.platform}
                    onChange={(event) =>
                      updateForm("platform", event.target.value)
                    }
                    className="h-10 bg-white rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-orange-400"
                  >
                    {platformOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm("status", event.target.value)
                    }
                    className="h-10 bg-white rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-orange-400"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) => updateForm("date", event.target.value)}
                    className="h-10 w-full bg-white rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-orange-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {inputFields.map(([key, label]) => (
                    <input
                      key={key}
                      type="number"
                      min="0"
                      step={["spend", "revenue"].includes(key) ? "0.01" : "1"}
                      value={form[key]}
                      onChange={(event) => updateForm(key, event.target.value)}
                      className="h-10 bg-white rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-orange-400"
                      placeholder={label}
                    />
                  ))}
                </div>
                <textarea
                  value={form.note}
                  onChange={(event) => updateForm("note", event.target.value)}
                  className="min-h-20 w-full bg-white rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-400"
                  placeholder="Notes"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save KPI"}
              </button>
            </form>
          ) : (
            <div className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50 p-4">
              <BarChart3 className="mb-3 text-indigo-600" size={24} />
              <h2 className="text-base font-semibold text-gray-900">
                Campaign performance
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Track Spend, Revenue, ROAS, CPR and Result for each ads
                campaign.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Daily Performance Trend
            </h2>
            <div className="space-y-3">
              {graphRows.length ? (
                graphRows.map((item) => (
                  <div key={item.date}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {item.date || "-"}
                      </span>
                      <span
                        className={`font-semibold ${
                          item.trend === "up"
                            ? "text-emerald-600"
                            : item.trend === "down"
                              ? "text-rose-600"
                              : "text-gray-500"
                        }`}
                      >
                        {item.trend === "up"
                          ? "Up"
                          : item.trend === "down"
                            ? "Down"
                            : item.trend === "same"
                              ? "Same"
                              : "New"}{" "}
                        {item.roasDelta
                          ? `(${formatNumber(item.roasDelta)}x)`
                          : ""}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${
                          item.trend === "down"
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.max(4, (Number(item.roas || 0) / maxGraphRoas) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>ROAS {formatNumber(item.roas)}x</span>
                      <span>
                        Result{" "}
                        {formatNumber(item.result ?? item.conversions, 0)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No graph data available.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdsCampaignKPITable;
