
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../api/axios";

const AuthContext = createContext(null);

const TOKEN_KEY = "campus_iq_token";
const USER_KEY = "campus_iq_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true); // true until initial session check

  // ── Persist helpers ─────────────────────────────────────────────────────────
  const persistSession = useCallback((userData, authToken) => {
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // ── Restore session on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (!savedToken) {
        setLoading(false);
        return;
      }

      // Optimistically restore from localStorage
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          clearSession();
          setLoading(false);
          return;
        }
      }

      // Validate token with the server
      try {
        const { data } = await authAPI.getMe();
        if (data.success) {
          setUser(data.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
        } else {
          clearSession();
        }
      } catch {
        // Token is invalid or expired
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listen for global auth expiry events (from axios interceptor) ───────────
  useEffect(() => {
    const handleExpiry = () => clearSession();
    window.addEventListener("auth:expired", handleExpiry);
    return () => window.removeEventListener("auth:expired", handleExpiry);
  }, [clearSession]);

  // ── Public auth actions ──────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    if (data.success) {
      persistSession(data.data.user, data.data.token);
    }
    return data;
  }, [persistSession]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    if (data.success) {
      persistSession(data.data.user, data.data.token);
    }
    return data;
  }, [persistSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────────
  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth — convenience hook. Throws if used outside AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export default AuthContext;
