import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "./TopBar.jsx";
import { BottomNav } from "./BottomNav.jsx";
import { SideNav } from "./SideNav.jsx";
import { Toaster } from "../ui/Toaster.jsx";

/**
 * Mobile-first frame: a single scrolling column with a bottom tab bar. At `md`
 * the sidebar becomes a permanent rail and the tab bar disappears.
 */
export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  // A route change should never leave the drawer hanging open behind the page.
  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh">
      <TopBar onOpenMenu={() => setDrawerOpen(true)} />

      <div className="mx-auto flex w-full max-w-7xl px-safe">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 border-r border-line md:block">
          <SideNav />
        </aside>

        <main
          id="main"
          className="min-w-0 flex-1 px-4 pb-24 pt-4 sm:px-5 md:pb-10 lg:px-8"
        >
          <Outlet />
        </main>
      </div>

      <BottomNav />
      <Toaster />

      {/* Mobile drawer: the sidebar contents slid in from the left. */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative h-full w-72 max-w-[85%] border-r border-line bg-surface pt-safe">
            <SideNav onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
