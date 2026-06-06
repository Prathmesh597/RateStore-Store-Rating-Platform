import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  // 4. One state object holding all form fields (name, email, password, address)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });
  const [error, setError] = useState("");      // 5. Stores error message
  const [success, setSuccess] = useState("");  // 6. Stores success message
  const [loading, setLoading] = useState(false); // 7. Disables button while sending request

  const navigate = useNavigate();               // 8. Get navigate function for redirect

  // 9. Runs whenever user types in any input field (updates formData)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 10. Runs when user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault();        // Stop browser refresh
    setError("");              // Clear old error
    setSuccess("");            // Clear old success message
    setLoading(true);          // Show "Registering..." on button

    try {
      // 11. Send all form data to backend endpoint "/auth/register"
      await API.post("/auth/register", formData);
      // 12. If success, show green message and redirect to login after 2 seconds
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      // 13. If fails, show error from server (or default message)
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);       // Re-enable button (hide "Registering...")
    }
  };

  // 14. Render the registration form
  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            minLength={20}     
            maxLength={60}    
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength={8}      // Password at least 8 chars, max 16
            maxLength={16}
            required
          />
        </div>
        <div>
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            maxLength={400}    // Address max 400 characters
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
}

export default Register;  // 15. Make Register component available to other files