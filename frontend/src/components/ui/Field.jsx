import { useId } from "react";

const CONTROL_BASE =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-base text-ink placeholder:text-muted/70 transition focus:border-brand focus:outline-none disabled:opacity-60";

/**
 * `text-base` on inputs is deliberate: anything under 16px makes iOS Safari
 * zoom the viewport when a field receives focus.
 */
export function Field({ label, hint, error, children, htmlFor, required }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({ label, hint, error, className = "", id, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId} required={props.required}>
      <input
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        className={`${CONTROL_BASE} ${error ? "border-danger" : ""} ${className}`}
        {...props}
      />
    </Field>
  );
}

export function TextArea({ label, hint, error, className = "", id, rows = 4, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId} required={props.required}>
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? "true" : undefined}
        className={`${CONTROL_BASE} resize-y ${error ? "border-danger" : ""} ${className}`}
        {...props}
      />
    </Field>
  );
}

export function Toggle({ label, description, checked, onChange, disabled }) {
  return (
    <label
      className={`flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3 ${
        disabled ? "opacity-60" : "cursor-pointer"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
      <span className="relative shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="block h-6 w-11 rounded-full bg-line transition peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
