import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

// ✅ Toastify
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return toast.error("Please enter your email");

    try {
      setLoading(true);

      const res = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: cleanEmail }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Email not found ❌");
        return;
      }

      // ✅ Save verified email for reset page
      localStorage.setItem("resetEmail", cleanEmail);

      toast.success("Email verified ✅ Now reset password!");
      navigate("/reset-password");
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
        <h2>Forgot Password</h2>

        <form onSubmit={handleForgot}>
          <label>Enter Registered Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="authBtn" disabled={loading}>
            {loading ? "Checking..." : "Verify Email"}
          </button>
        </form>

        <div className="authLinks">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
