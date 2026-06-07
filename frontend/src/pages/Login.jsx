import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import logo from "../assets/star_logo.png";

function Login() {

  //1. Initialize states to manage user inputs, error messages, and the loading indicator
  const [email, setEmail] = useState("");
  
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  
  const [loading, setLoading] = useState(false);

  //2. Retrieve the login function from context and initialize the navigate hook for routing
  const { login } = useAuth();
  
  const navigate = useNavigate();

  //3. Handle form submission by preventing page reload and resetting initial submission states
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      //4. Send login credentials to the API and update the global authentication state upon success
      const response = await API.post("/auth/login", { email, password });
      login(response.data.user, response.data.token);

      //5. Determine the user's role and route them to their respective designated dashboard
      const role = response.data.user.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "user") navigate("/user/stores");
      else if (role === "store_owner") navigate("/store-owner/dashboard");

    } catch (err) {

      //6. Catch and display any login errors returned by the server or provide a default fallback message
      setError(err.response?.data?.message || "Login failed");

    } finally {

      //7. Ensure the loading state is turned off after the API request finishes, regardless of the outcome
      setLoading(false);

    }
  };

  //8. Render the login form UI, including conditional error alerts, input fields, and the submit button
  return (
    <div className="auth-page">
      
      <div className="form-container">
        
        <div className="auth-logo">
          <img src={logo} alt="Logo" />
          <span>RateStore</span>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          
        </form>
        
        <div className="form-footer">
          Don't have an account? <a href="/register">Register</a>
        </div>
        
      </div>
      
    </div>
  );
}

export default Login;