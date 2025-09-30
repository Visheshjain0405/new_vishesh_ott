// src/admin/AdminProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  const loc = useLocation();
  if (!token) return <Navigate to="/admin/login" replace state={{ from: loc }} />;
  return children;
}
