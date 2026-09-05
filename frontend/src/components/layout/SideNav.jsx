import { NavLink } from "react-router-dom";
import { Icon } from "../ui/Icon.jsx";
import { Avatar } from "../ui/Avatar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { LIBRARY_NAV, PRIMARY_NAV } from "./navItems.js";

function NavRow({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
          isActive ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-2 hover:text-ink"
        }`
      }
    >
      <Icon name={item.icon} className="size-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

/**
 * Rendered inline as a sticky rail from `md` up, and inside the mobile drawer
 * on small screens — hence `onNavigate`, which lets the drawer close itself.
 */
export function SideNav({ onNavigate }) {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-3">
      <nav aria-label="Sections" className="space-y-1">
        {PRIMARY_NAV.filter((item) => item.to !== "/library").map((item) => (
          <NavRow key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="space-y-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Library
        </p>
        {LIBRARY_NAV.map((item) => (
          <NavRow key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </div>

      {user && (
        <div className="mt-auto space-y-1">
          <NavLink
            to={`/channel/${user.username}`}
            onClick={onNavigate}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <Avatar src={user.avatar} name={user.fullName} id={user._id} size="xs" />
            <span className="truncate">Your channel</span>
          </NavLink>
          <NavRow item={{ to: "/settings", label: "Settings", icon: "settings" }} onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
}
