import { Outlet } from "react-router-dom";
import { Icon } from "../components/ui/Icon.jsx";
import { Toaster } from "../components/ui/Toaster.jsx";

/**
 * Single-column form on phones. From `lg` a brand panel appears alongside it,
 * which is decorative only and hidden from assistive tech.
 */
export function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden bg-brand p-12 text-on-brand lg:flex lg:flex-col lg:justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-on-brand/15">
            <Icon name="play" filled className="size-5" />
          </span>
          <span className="text-lg font-semibold">VidEngine</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">
            Upload once. Watch anywhere.
          </h2>
          <p className="mt-3 text-on-brand/80">
            Videos, playlists, comments and short posts — one account across every
            screen you own.
          </p>
        </div>
        <div className="h-8" />
      </aside>

      <main className="flex flex-col justify-center px-5 [padding-block:calc(2.5rem+env(safe-area-inset-top))_calc(2.5rem+env(safe-area-inset-bottom))] sm:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-on-brand">
              <Icon name="play" filled className="size-5" />
            </span>
            <span className="text-lg font-semibold text-ink">VidEngine</span>
          </div>
          <Outlet />
        </div>
      </main>

      <Toaster />
    </div>
  );
}
