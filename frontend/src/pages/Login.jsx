// 1. Import hooks for remembering values (email, password, error, loading state)
import { useState } from "react";
// 2. Import function to change the current page (redirect)
import { useNavigate } from "react-router-dom";
// 3. Import the 'login' function from AuthContext to save user data
import { useAuth } from "../context/AuthContext";
// 4. Import HTTP client to talk to backend server
import API from "../services/api";

function Login() {
  // 5. Variables that change when user types in form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");      // Stores error message to show user
  const [loading, setLoading] = useState(false); // Disables button while sending request

  // 6. Get login function from context and navigate function from router
  const { login } = useAuth();
  const navigate = useNavigate();

  // 7. This function runs when user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault();        // Stop browser from refreshing page
    setError("");              // Clear old error message
    setLoading(true);          // Show "Logging in..." on button

    try {
      // 8. Send email + password to server endpoint "/auth/login"
      const response = await API.post("/auth/login", { email, password });
      // 9. Save user data and token to localStorage via AuthContext
      login(response.data.user, response.data.token);

      // 10. Redirect based on user role
      const role = response.data.user.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "user") navigate("/user/stores");
      else if (role === "store_owner") navigate("/store-owner/dashboard");
    } catch (err) {
      // 11. If request fails, show error message from server (or default)
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);       // Re-enable button (hide "Logging in...")
    }
  };

  // 12. Render the login form
  return (
    <div>
      <h2>Login</h2>
      {/* 13. Show error message in red if exists */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
}

export default Login;  // 14. Make Login component available to other files