import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axiosInstance from "../Assests/api/axiosInstance";

// shape of auth payload returned by your backend
// expected login/register response: { token, user }
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // keep axios Authorization header in sync
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  }, [token]);

  // setup 401 interceptor (redirect to /auth when unauthorized)
  useEffect(() => {
    const id = axiosInstance.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err?.response?.status;
        // Only kick user out on 401 if the request is not the auth endpoints
        const url = err?.config?.url || "";
        const isAuthEndpoint = url.startsWith("/auth/");
        if (status === 401 && !isAuthEndpoint) {
          // clear local auth & go to login
          logout(false);
          navigate("/auth", { replace: true });
        }
        return Promise.reject(err);
      }
    );
    return () => axiosInstance.interceptors.response.eject(id);
  }, [navigate]);

  // API: login/register/logout
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/login", { email, password, rememberMe });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e?.response?.data?.message || e.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ firstName, lastName, email, password }) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/register", {
        firstName, lastName, email, password,
      });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e?.response?.data?.message || e.message || "Register failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = (goLogin = true) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    if (goLogin) navigate("/auth", { replace: true });
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      loading,
      // actions
      login,
      register,
      logout,
      setUser, // optional
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/** Guard for protected pages */
export function ProtectedRoute({ children, redirect = "/auth" }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to={redirect} replace />;
  return children;
}
