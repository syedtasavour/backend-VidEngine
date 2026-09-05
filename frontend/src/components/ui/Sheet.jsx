import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon.jsx";
import { Button, IconButton } from "./Button.jsx";

/**
 * One component, two presentations: a bottom sheet on phones (thumb-reachable,
 * with a drag handle) and a centred dialog from `sm` upward.
 */
export function Sheet({ open, onClose, title, description, children, footer }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Stop the page behind the sheet from scrolling on touch devices.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative flex max-h-[90dvh] w-full flex-col rounded-t-3xl border border-line bg-surface shadow-2xl focus:outline-none sm:max-w-lg sm:rounded-3xl"
      >
        <span className="mx-auto mt-2 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden="true" />

        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          <IconButton label="Close" variant="ghost" size="sm" onClick={onClose}>
            <Icon name="close" />
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>

        {footer && <footer className="border-t border-line px-5 pt-4 [padding-bottom:calc(1rem+env(safe-area-inset-bottom))]">
            {footer}
          </footer>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  loading = false,
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            fullWidth
            className="sm:w-auto"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={tone}
            fullWidth
            className="sm:w-auto"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted">{message}</p>
    </Sheet>
  );
}
