import { useToast } from "../../context/ToastContext.jsx";

const TONE_STYLES = {
  info: "border-line bg-surface-2 text-ink",
  success: "border-success/40 bg-success/15 text-ink",
  error: "border-danger/40 bg-danger/15 text-ink",
};

/**
 * Toasts sit above the bottom tab bar on phones and drop to the bottom-right
 * on desktop, so they never cover the primary navigation.
 */
export function Toaster() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6 md:left-auto md:right-6 md:items-end md:px-0"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismiss(toast.id)}
          className={`pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3 text-left text-sm shadow-lg backdrop-blur transition md:w-auto md:min-w-72 ${
            TONE_STYLES[toast.tone] ?? TONE_STYLES.info
          }`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
