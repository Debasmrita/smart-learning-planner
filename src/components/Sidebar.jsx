import "../styles/sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar({ isOpen, toggle }) {
  const navigate = useNavigate();

  /* ---------------- DARK MODE ---------------- */
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  return (
    <>
      {/* ✅ Hamburger (always visible) */}
      <button className="menuToggle" onClick={toggle}>
        ☰
      </button>

      {/* ✅ Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>

        {/* HEADER */}
        <div className="sidebarHeader">
          <h2 className="logo">StudyBuddy</h2>
        </div>

        {/* NAVIGATION */}
        <nav className="navLinks">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "navItem active" : "navItem"
            }
          >
            <span className="icon">🏠</span>
            <span className="label">Dashboard</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "navItem active" : "navItem"
            }
          >
            <span className="icon">👤</span>
            <span className="label">Profile</span>
          </NavLink>
        </nav>

        {/* BOTTOM SECTION */}
        <div className="sidebarBottom">
          <button className="darkBtn" onClick={toggleDarkMode}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <button className="logoutBtn" onClick={logout}>
            Logout
          </button>
        </div>

      </aside>
    </>
  );
}