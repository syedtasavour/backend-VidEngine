import { Icon } from "./Icon.jsx";
import { Button } from "./Button.jsx";

export function EmptyState({ icon = "film", title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted">
        <Icon name={icon} className="size-6" />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {message && <p className="max-w-sm text-sm text-muted">{message}</p>}
      {action && (
        <Button className="mt-2" to={action.to} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger/15 text-danger">
        <Icon name="alert" className="size-6" />
      </span>
      <h3 className="text-base font-semibold text-ink">Something went wrong</h3>
      <p className="max-w-sm text-sm text-muted">
        {error?.message || "The request could not be completed."}
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
