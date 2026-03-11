import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

// ✅ Toastify
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) return toast.error("Name is required");
    if (!cleanEmail) return toast.error("Email is required");
    if (!password) return toast.error("Password is required");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed ❌");
        return;
      }

      toast.success("Account created successfully ✅ Now login!");
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
        <h2>Student Register</h2>

        <form onSubmit={handleRegister}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="authBtn" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="authLinks">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}
