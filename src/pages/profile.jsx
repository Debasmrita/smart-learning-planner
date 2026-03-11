import { useEffect, useState } from "react";
import "../styles/profile.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /* ===============================
      LOGOUT
  =============================== */
  const logout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("authChanged"));
    toast.info("Logged out 👋");
    navigate("/login", { replace: true });
  };

  /* ===============================
      LOAD PROFILE
  =============================== */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();
        setStudent(data);
        setName(data.name || "");
      } catch {
        toast.error("Failed to load profile ❌");
      }
    };

    loadProfile();
  }, [token]);

  /* ===============================
      UPDATE NAME
  =============================== */
  const updateProfile = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Update failed");
        return;
      }

      toast.success("Profile updated ✅");

      // update UI instantly
      setStudent((prev) => ({ ...prev, name }));
    } catch {
      toast.error("Error updating profile ❌");
    }
  };

  /* ===============================
      UPDATE PASSWORD
  =============================== */
  const updatePassword = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/update-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Password update failed");
        return;
      }

      toast.success("Password updated ✅");

      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error("Error updating password ❌");
    }
  };

  /* ===============================
      LOADING STATE
  =============================== */
  if (!student)
    return (
      <div className="profileWrapper">
        <div className="loading">Loading profile...</div>
      </div>
    );

  /* ===============================
      UI
  =============================== */
  return (
    <div className="profileWrapper">
      <div className="profileContainer">

        {/* LEFT PANEL */}
        <aside className="profileSidebar">
          <h2>My Profile</h2>

          <button
            className={activeTab === "basic" ? "activeTab" : ""}
            onClick={() => setActiveTab("basic")}
          >
            Basic Info
          </button>

          <button
            className={activeTab === "password" ? "activeTab" : ""}
            onClick={() => setActiveTab("password")}
          >
            Change Password
          </button>

          <button
            className="logoutBtnProfile"
            onClick={logout}
          >
            Logout
          </button>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="profileContent">

          {/* BASIC INFO */}
          {activeTab === "basic" && (
            <div className="glassCard">
              <h3>Basic Information</h3>

              <div className="formGroup">
                <label>Email</label>
                <input value={student.email} disabled />
              </div>

              <div className="formGroup">
                <label>Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <button
                className="primaryBtn"
                onClick={updateProfile}
              >
                Update Name
              </button>
            </div>
          )}

          {/* PASSWORD */}
          {activeTab === "password" && (
            <div className="glassCard">
              <h3>Change Password</h3>

              <div className="formGroup">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                />
              </div>

              <div className="formGroup">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                />
              </div>

              <button
                className="dangerBtn"
                onClick={updatePassword}
              >
                Update Password
              </button>
            </div>
          )}

        </section>
      </div>
    </div>
  );
}