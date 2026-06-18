"use client";

interface FormActionsProps {
  loading: boolean;
  disabled?: boolean;
  onCancel: () => void;
  submitLabel?: string;
  loadingLabel?: string;
}

export default function FormActions({
  loading,
  disabled = false,
  onCancel,
  submitLabel = "Create Class",
  loadingLabel = "Creating...",
}: FormActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer flex items-center justify-center gap-2"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading || disabled}
        className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <span>{loading ? loadingLabel : submitLabel}</span>
      </button>
    </div>
  );
}