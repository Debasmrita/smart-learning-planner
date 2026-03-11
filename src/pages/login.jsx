import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) return toast.error("Email is required");
    if (!password) return toast.error("Password is required");

    try {
      setLoading(true);

      const res = await fetch("https://smart-learning-planner-mbui.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed ❌");
        return;
      }

      // ✅ Save token
      localStorage.setItem("token", data.token);

      // ✅ Save student info
      localStorage.setItem("student", JSON.stringify(data.student));

      // ✅ Notify app auth changed
      window.dispatchEvent(new Event("authChanged"));

      toast.success("Login successful ✅");

      // go to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      toast.error("Backend not running on port 5000 ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">

        <h1>📚 StudyBuddy</h1>
        <h2>Student Login</h2>

        <form onSubmit={handleLogin}>

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="authBtn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="authLinks">
          <Link to="/forgot-password">Forgot Password?</Link>
          <Link to="/register">Create New Account</Link>
        </div>

      </div>
    </div>
  );
}