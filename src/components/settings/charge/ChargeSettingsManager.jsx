import { useState } from "react";
import {
  Banknote,
  CalendarDays,
  Pencil,
  Search,
  Trash2,
  Truck,
  WalletCards,
  X,
} from "lucide-react";
import {
  useCreateChargeSettingMutation,
  useDeleteChargeSettingMutation,
  useGetChargeSettingsQuery,
  useUpdateChargeSettingMutation,
} from "../../../features/chargeSetting/chargeSetting";

const today = () => new Date().toISOString().slice(0, 10);

const CHARGE_COPY = {
  cod: {
    title: "COD Charge",
    subtitle: "Add and manage Cash on Delivery charges.",
    icon: WalletCards,
    accent: "emerald",
  },
  delivery: {
    title: "Delivery Charge",
    subtitle: "Add and manage delivery charges.",
    icon: Truck,
    accent: "sky",
  },
};

const accentClasses = {
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
  sky: "bg-sky-50 border-sky-100 text-sky-600",
};

const initialForm = () => ({
  date: today(),
  amount: "",
  note: "",
});

const formatAmount = (value) => {
  const amount = Number(value || 0);
  return `৳${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ChargeSettingsManager = ({ chargeType }) => {
  const copy = CHARGE_COPY[chargeType] || CHARGE_COPY.cod;
  const Icon = copy.icon;
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [createChargeSetting, { isLoading: isCreating }] =
    useCreateChargeSettingMutation();
  const [updateChargeSetting, { isLoading: isUpdating }] =
    useUpdateChargeSettingMutation();
  const [deleteChargeSetting, { isLoading: isDeleting }] =
    useDeleteChargeSettingMutation();
  const { data, isLoading } = useGetChargeSettingsQuery({
    page: 1,
    limit: 20,
    chargeType,
    searchTerm: searchTerm.trim(),
  });

  const rows = data?.data || [];
  const isSaving = isCreating || isUpdating;

  const resetForm = () => {
    setForm(initialForm());
    setEditingId(null);
    setError("");
  };

  const handleEdit = (row) => {
    setEditingId(row.Id);
    setForm({
      date: row.date || today(),
      amount: row.amount ?? "",
      note: row.note || "",
    });
    setError("");
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(`Delete ${copy.title} row?`);
    if (!confirmed) return;

    try {
      setError("");
      await deleteChargeSetting({ id: row.Id, chargeType }).unwrap();
      if (editingId === row.Id) resetForm();
    } catch (err) {
      setError(err?.data?.message || "Failed to delete charge");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);

    if (!form.date) {
      setError("Date is required");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      setError("Amount must be a positive number");
      return;
    }

    const payload = {
      chargeType,
      date: form.date,
      amount,
      note: form.note.trim(),
    };

    try {
      setError("");
      if (editingId) {
        await updateChargeSetting({ id: editingId, data: payload }).unwrap();
      } else {
        await createChargeSetting(payload).unwrap();
      }
      resetForm();
    } catch (err) {
      setError(
        err?.data?.message ||
          `Failed to ${editingId ? "update" : "create"} charge`,
      );
    }
  };

  return (
    <div className="w-full bg-white shadow-sm rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
        <div
          className={`h-11 w-11 rounded-xl border flex items-center justify-center ${accentClasses[copy.accent]}`}
        >
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{copy.title}</h2>
          <p className="text-sm text-gray-500">{copy.subtitle}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[180px_180px_1fr_auto]"
      >
        <div className="relative">
          <CalendarDays
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="date"
            value={form.date}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, date: event.target.value }))
            }
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-400"
          />
        </div>
        <div className="relative">
          <Banknote
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, amount: event.target.value }))
            }
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-400"
            placeholder="Amount"
          />
        </div>
        <input
          value={form.note}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, note: event.target.value }))
          }
          className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-400"
          placeholder="Note"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="h-11 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : editingId ? "Update" : "Add"}
        </button>
      </form>

      {editingId && (
        <button
          type="button"
          onClick={resetForm}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <X size={15} />
          Cancel edit
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Saved Charges
          </h3>
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-900 outline-none focus:border-indigo-400"
              placeholder="Search note"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
          <div className="grid grid-cols-[160px_160px_1fr_104px] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Date</span>
            <span>Amount</span>
            <span>Note</span>
            <span className="text-right">Action</span>
          </div>
          {isLoading && (
            <p className="border-t border-slate-100 p-4 text-sm text-slate-500">
              Loading...
            </p>
          )}
          {!isLoading && rows.length === 0 && (
            <p className="border-t border-slate-100 p-4 text-sm text-slate-500">
              No charges found.
            </p>
          )}
          {rows.map((row) => (
            <div
              key={row.Id}
              className="grid grid-cols-1 gap-3 border-t border-slate-100 bg-white p-4 text-sm sm:grid-cols-[160px_160px_1fr_104px] sm:items-center"
            >
              <span className="font-medium text-slate-900">
                {formatDate(row.date)}
              </span>
              <span className="font-bold text-slate-900">
                {formatAmount(row.amount)}
              </span>
              <span className="text-slate-600">{row.note || "-"}</span>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(row)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50"
                  title="Edit charge"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(row)}
                  disabled={isDeleting}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  title="Delete charge"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChargeSettingsManager;
