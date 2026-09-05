import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";
import { formatFileSize } from "../../utils/format.js";

/**
 * Tap-anywhere file input with an inline preview.
 *
 * `accept` plus a large hit area is what makes this workable on a phone — the
 * OS picker offers the camera roll directly rather than a file browser.
 */
export function FilePicker({
  label,
  accept = "image/*",
  hint,
  required,
  file,
  onSelect,
  aspect = "aspect-video",
  error,
}) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file || !file.type?.startsWith("image/")) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    // Object URLs leak until revoked, so tie each one to this file's lifetime.
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </span>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative flex w-full ${aspect} items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${
          error ? "border-danger" : "border-line hover:border-brand"
        } bg-surface-2`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : file ? (
          <span className="flex flex-col items-center gap-1 px-4 text-center">
            <Icon name="film" className="size-7 text-brand" />
            <span className="max-w-full truncate text-sm font-medium text-ink">{file.name}</span>
            <span className="text-xs text-muted">{formatFileSize(file.size)}</span>
          </span>
        ) : (
          <span className="flex flex-col items-center gap-1 px-4 text-center text-muted">
            <Icon name="upload" className="size-7" />
            <span className="text-sm font-medium">Tap to choose a file</span>
            {hint && <span className="text-xs">{hint}</span>}
          </span>
        )}

        {file && (
          <span className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2 py-1 text-xs text-white">
            Change
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
      />

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
