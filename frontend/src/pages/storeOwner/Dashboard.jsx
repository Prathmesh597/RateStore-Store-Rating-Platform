import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function StoreOwnerDashboard() {

  //1. Initialize state variables to store dashboard data, error messages, and manage the password change form
  const [dashboard, setDashboard] = useState(null);
  
  const [error, setError] = useState("");
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  
  const [passwordError, setPasswordError] = useState("");
  
  const [passwordSuccess, setPasswordSuccess] = useState("");

  //2. Retrieve the authenticated user context and define any required navigation links
  const { user } = useAuth();

  const navLinks = [];

  //3. Fetch the store owner's dashboard data from the API when the component first mounts
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await API.get("/store-owner/dashboard");
        setDashboard(response.data);
      } catch {
        setError("Failed to load dashboard");
      }
    };
    fetchDashboard();
  }, []);

  //4. Process the password update request, send the new credentials to the server, and handle the response
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await API.put("/store-owner/password", passwordData);
      setPasswordSuccess("Password updated successfully");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    }
  };

  //5. Display a loading indicator while the dashboard data is being fetched
  if (!dashboard) return <p className="loading">Loading...</p>;

  //6. Render the dashboard layout including the store's average rating, account settings, and a list of users who rated the store
  return (
    <>
      
      <Navbar links={navLinks} />
      
      <div className="page-container">
        
        <div className="page-header">
          <h2>Store Dashboard</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Average Rating */}
        <div className="stats-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="stat-card">
            <h3>Store Average Rating</h3>
            <p>{parseFloat(dashboard.avgRating).toFixed(1)} ★</p>
          </div>
        </div>

        {/* Change Password */}
        <div className="section-header">
          <h3>Your Account</h3>
          <button className="btn btn-primary" onClick={() => setShowPasswordForm(!showPasswordForm)}>
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showPasswordForm && (
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Change Password</h3>
            {passwordError && <div className="alert alert-error">{passwordError}</div>}
            {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" className="form-control" value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-control" value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary">Update Password</button>
            </form>
          </div>
        )}

        {/* Raters Table */}
        <div className="section-header" style={{ marginTop: 24 }}>
          <h3>Users Who Rated Your Store</h3>
        </div>

        <div className="table-container">
          {dashboard.raters.length === 0 ? (
            <p style={{ padding: 24, color: "var(--gray-500)", textAlign: "center" }}>No ratings yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.raters.map((rater) => (
                  <tr key={rater.id}>
                    <td>{rater.name}</td>
                    <td>{rater.email}</td>
                    <td><span className="rating-badge">{rater.rating} ★</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
      </div>
      
    </>
  );
}

export default StoreOwnerDashboard;