// src/App.js
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AdminProtectedRoute from "./context/AdminProtectedRoute";

// public
import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./Pages/HomePage";
import AuthPage from "./Pages/AuthPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage";
import MovieSinglePage from "./Pages/MovieSinglePage";
import FavoritesPage from "./Pages/FavoritesPage";
import CategoryPage from "./Pages/CategoryPage";
import MovieIframePage from "./Pages/MovieIframePage";
import SearchPage from "./Pages/SearchPage";

// admin
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import AdminMoviesPage from "./Pages/AdminMoviesPage";

import NotFound from "./Pages/NotFound";
import AdminUsersPage from "./Pages/AdminUsersPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/homepage" replace />} />

        {/* public site with Navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/movie/:movieId" element={<MovieSinglePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/category/:type" element={<CategoryPage />} />
          <Route path="/watch/:movieId" element={<MovieIframePage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>

        {/* user auth */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* admin auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* admin pages (each page renders its own sidebar) */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/movies"
          element={
            <AdminProtectedRoute>
              <AdminMoviesPage />
            </AdminProtectedRoute>
          }
        />
          <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsersPage />
            </AdminProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
