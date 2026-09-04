import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Icon } from "../ui/Icon.jsx";
import { IconButton } from "../ui/Button.jsx";
import { Avatar } from "../ui/Avatar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

export function TopBar({ onOpenMenu }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-lg pt-safe">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:px-4">
        <IconButton
          label="Open menu"
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onOpenMenu}
        >
          <Icon name="menu" />
        </IconButton>

        <Link to="/" className="flex items-center gap-2 rounded-lg px-1 py-1">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-on-brand">
            <Icon name="play" filled className="size-4" />
          </span>
          <span className="text-base font-semibold tracking-tight text-ink">VidEngine</span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <IconButton
            label="Search channels"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/search")}
          >
            <Icon name="search" />
          </IconButton>

          <IconButton
            label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </IconButton>

          {user && (
            <Link
              to={`/channel/${user.username}`}
              aria-label="Your channel"
              className="ml-1 rounded-full"
            >
              <Avatar src={user.avatar} name={user.fullName} id={user._id} size="sm" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
