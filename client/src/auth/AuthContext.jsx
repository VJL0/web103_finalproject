import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { fetchMe, logoutRequest, API_BASE_URL } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null: no user, object: logged in
  const [loading, setLoading] = useState(true); // initial load from /auth/me
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMe(); // { user: null | { ... } }
      setUser(data.user);
    } catch (err) {
      console.error("Failed to fetch /auth/me", err);
      setError(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const loginWithGitHub = useCallback(() => {
    // This will start the OAuth flow on the backend
    window.location.href = `${API_BASE_URL}/auth/github`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      // regardless of error, clear local state
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    reloadUser: loadUser,
    loginWithGitHub,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
