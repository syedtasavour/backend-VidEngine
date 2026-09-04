import { Link } from "react-router-dom";
import { Spinner } from "./Spinner.jsx";

const VARIANTS = {
  primary: "bg-brand text-on-brand hover:brightness-110 active:brightness-95",
  secondary: "bg-surface-2 text-ink border border-line hover:bg-line/40",
  ghost: "text-muted hover:bg-surface-2 hover:text-ink",
  danger: "bg-danger text-white hover:brightness-110",
  outline: "border border-brand text-brand hover:bg-brand-soft",
};

// `min-h` keeps every control at or above the 44px touch target on phones.
const SIZES = {
  sm: "min-h-9 px-3 text-sm gap-1.5",
  md: "min-h-11 px-4 text-sm gap-2",
  lg: "min-h-12 px-5 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  as,
  to,
  children,
  disabled,
  ...props
}) {
  const classes = [
    "inline-flex items-center justify-center rounded-xl font-medium transition",
    "disabled:cursor-not-allowed disabled:opacity-55",
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading && <Spinner className="size-4" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  const Component = as ?? "button";
  return (
    <Component
      className={classes}
      disabled={disabled || loading}
      type={Component === "button" ? props.type ?? "button" : undefined}
      {...props}
    >
      {content}
    </Component>
  );
}

/** Square icon-only button; the label is exposed to assistive tech only. */
export function IconButton({ label, className = "", size = "md", ...props }) {
  const box = size === "sm" ? "size-9" : "size-11";
  return (
    <Button
      aria-label={label}
      title={label}
      className={`${box} !px-0 shrink-0 ${className}`}
      {...props}
    />
  );
}
