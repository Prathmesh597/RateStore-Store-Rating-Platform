import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import logo from "../assets/star_logo.png";

function Register() {

  //1. Initialize states for form data, error messages, success messages, and loading status
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  //2. Initialize the navigate hook for programmatic routing to other pages
  const navigate = useNavigate();

  //3. Dynamically update the corresponding state field when the user types in any input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //4. Handle the form submission, prevent the default page reload, and clear previous status messages
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {

      //5. Send a POST request to the registration API endpoint with the collected form data
      await API.post("/auth/register", formData);
      setSuccess("Registration successful! Redirecting to login...");

      //6. Redirect the user to the login page after a 2-second delay
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {

      //7. Catch any API errors and display the error message from the server or a fallback message
      setError(err.response?.data?.message || "Registration failed");

    } finally {

      //8. Reset the loading state back to false regardless of API success or failure
      setLoading(false);

    }
  };

  //9. Render the registration form UI components, conditionally showing error/success alerts
  return (
    <div className="auth-page">

      <div className="form-container">

        <div className="auth-logo">
          <img src={logo} alt="Logo" />
          <span>RateStore</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              minLength={20}
              maxLength={60}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              maxLength={16}
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              maxLength={400}
              rows={3}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <div className="form-footer">
          Already have an account? <a href="/login">Login</a>
        </div>

      </div>

    </div>
  );
}

export default Register;