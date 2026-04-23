import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

const ConfirmDialog = ({
  isOpen,
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  tone = "danger",
  onConfirm,
  onCancel,
}) => {
  const confirmClasses =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-600"
      : "bg-indigo-600 hover:bg-indigo-700 focus-visible:outline-indigo-600";

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? undefined : onCancel}
      title={title}
      maxWidth="max-w-md"
      showCloseButton={!isLoading}
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle size={22} />
          </div>
          <p className="pt-1 text-sm leading-6 text-slate-600">{message}</p>
        </div>

        <div className="sticky bottom-0 -mx-4 -mb-4 flex justify-end gap-3 border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex h-11 min-w-[112px] items-center justify-center rounded-xl px-4 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70 ${confirmClasses}`}
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
