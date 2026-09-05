import { Button } from "../components/ui/Button.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-surface-2 text-muted">
        <Icon name="compass" className="size-7" />
      </span>
      <h1 className="text-xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">
        The page you were looking for does not exist or has been moved.
      </p>
      <Button to="/" className="mt-2">
        Back to home
      </Button>
    </div>
  );
}
