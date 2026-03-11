import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPass from "./pages/forgotPass";
import ResetPass from "./pages/resetPass";
import Dashboard from "./pages/dashBoard";
import Profile from "./pages/profile";
import Layout from "./components/Layout"; // ✅ NEW

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // ✅ Listen for login/logout changes
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("authChanged", checkAuth);
    checkAuth();

    return () =>
      window.removeEventListener("authChanged", checkAuth);
  }, []);

  return (
    <Routes>

      {/* Default Redirect */}
      <Route
        path="/"
        element={
          isLoggedIn
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route
        path="/login"
        element={
          isLoggedIn
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      <Route
        path="/register"
        element={
          isLoggedIn
            ? <Navigate to="/dashboard" replace />
            : <Register />
        }
      />

      <Route path="/forgot-password" element={<ForgotPass />} />
      <Route path="/reset-password" element={<ResetPass />} />

      {/* ---------- PROTECTED LAYOUT ROUTES ---------- */}
      <Route
        element={
          isLoggedIn
            ? <Layout />
            : <Navigate to="/login" replace />
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}