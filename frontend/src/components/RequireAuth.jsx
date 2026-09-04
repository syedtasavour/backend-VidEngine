import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LoadingBlock } from "./ui/Spinner.jsx";

export function RequireAuth() {
  const { isAuthenticated, initialising } = useAuth();
  const location = useLocation();

  // Wait for the stored session to be confirmed before deciding, otherwise a
  // reload on a protected page flashes the login screen.
  if (initialising) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <LoadingBlock label="Restoring your session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RedirectIfAuthed() {
  const { isAuthenticated, initialising } = useAuth();
  if (initialising) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <LoadingBlock label="Loading" />
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
