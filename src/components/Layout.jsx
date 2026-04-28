import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/layout.css";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="layout">

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Page */}
      <div className={`pageContent ${sidebarOpen ? "" : "full"}`}>
        <Outlet />
      </div>

    </div>
  );
}