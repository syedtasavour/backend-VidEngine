import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setAuthFailureHandler, tokenStore } from "../api/client.js";
import * as authApi from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `initialising` gates the first render so guarded routes do not flash the
  // login screen while we are still confirming a stored session.
  const [initialising, setInitialising] = useState(true);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setAuthFailureHandler(clearSession);
    return () => setAuthFailureHandler(null);
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!tokenStore.access && !tokenStore.refresh) {
        setInitialising(false);
        return;
      }
      try {
        const current = await authApi.getCurrentUser();
        if (!cancelled) setUser(current);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setInitialising(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const loggedIn = await authApi.login(credentials);
    // login() returns the user without the aggregate fields, so re-read it.
    const current = loggedIn ?? (await authApi.getCurrentUser());
    setUser(current);
    return current;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      initialising,
      isAuthenticated: Boolean(user),
      login,
      logout,
      register: authApi.register,
    }),
    [user, initialising, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
