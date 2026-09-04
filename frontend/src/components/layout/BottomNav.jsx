import { NavLink } from "react-router-dom";
import { Icon } from "../ui/Icon.jsx";
import { PRIMARY_NAV } from "./navItems.js";

/**
 * Phone navigation. Fixed to the bottom so the targets sit under the thumb,
 * and padded for the home indicator on gesture-driven devices.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-lg pb-safe md:hidden"
    >
      <ul className="grid grid-cols-5">
        {PRIMARY_NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[11px] font-medium transition ${
                  isActive ? "text-brand" : "text-muted"
                }`
              }
            >
              {item.accent ? (
                <>
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand text-on-brand">
                    <Icon name={item.icon} className="size-5" />
                  </span>
                  <span className="sr-only">{item.label}</span>
                </>
              ) : (
                <>
                  <Icon name={item.icon} className="size-5" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
