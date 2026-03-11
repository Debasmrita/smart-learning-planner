import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

// ✅ Toastify
import { toast } from "react-toastify";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto load verified email from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("resetEmail");
    if (saved) setEmail(saved);
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) return toast.error("Email is required");
    if (!newPassword) return toast.error("New password is required");
    if (newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Reset failed ❌");
        return;
      }

      // ✅ Clear resetEmail
      localStorage.removeItem("resetEmail");

      toast.success("Password reset successful ✅ Now login!");
      navigate("/login");
    } catch (err) {
      console.log(err);
      toast.error("Backend not running on port 5000 ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <h1>📚 StudyBuddy</h1>
        <h2>Reset Password</h2>

        <form onSubmit={handleReset}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit" className="authBtn" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="authLinks">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
