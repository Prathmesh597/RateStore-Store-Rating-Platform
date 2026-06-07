import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

function StoreOwnerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await API.get("/store-owner/dashboard");
      setDashboard(response.data);
      console.log("Dashboard:", response.data);
    } catch (err) {
      setError("Failed to load dashboard");
    }
  };

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!dashboard) return <p>Loading...</p>;

  return (
    <div>
      <div>
        <h2>Store Owner Dashboard</h2>
        <div>
          <span>Welcome, {user?.name}</span>
          <button onClick={() => setShowPasswordForm(!showPasswordForm)}>
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Average Rating */}
      <div>
        <h3>Store Average Rating</h3>
        <p>{parseFloat(dashboard.avgRating).toFixed(1)} / 5</p>
      </div>

      {/* Change Password Form */}
      {showPasswordForm && (
        <div>
          <h3>Change Password</h3>
          {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
          {passwordSuccess && <p style={{ color: "green" }}>{passwordSuccess}</p>}
          <form onSubmit={handlePasswordUpdate}>
            <input
              type="password"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />
            <button type="submit">Update Password</button>
          </form>
        </div>
      )}

      {/* Raters Table */}
      <div>
        <h3>Users Who Rated Your Store</h3>
        {dashboard.raters.length === 0 ? (
          <p>No ratings yet</p>
        ) : (
          <table border="1">
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
                  <td>{rater.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StoreOwnerDashboard;