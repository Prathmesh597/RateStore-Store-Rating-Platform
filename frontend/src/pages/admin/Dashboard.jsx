import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function AdminDashboard() {

  //1. Initialize state variables to store dashboard statistics and potential errors
  const [stats, setStats] = useState(null);
  
  const [error, setError] = useState("");
  
  const { user } = useAuth();

  //2. Define the navigation links specific to the admin dashboard for the Navbar component
  const navLinks = [
    { label: "Users", path: "/admin/users" },
    { label: "Stores", path: "/admin/stores" },
  ];

  //3. Fetch the dashboard statistics from the API when the component first mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get("/admin/dashboard");
        setStats(response.data);
      } catch {
        setError("Failed to load dashboard");
      }
    };
    fetchStats();
  }, []);

  //4. Display a loading message while the statistics are being fetched from the server
  if (!stats) return <p className="loading">Loading...</p>;

  //5. Render the admin dashboard layout, including the Navbar, statistical cards, and quick navigation links
  return (
    <>
      
      <Navbar links={navLinks} />
      
      <div className="page-container">
        
        <div className="page-header">
          <h2>Dashboard</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid">
          
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          
          <div className="stat-card">
            <h3>Total Stores</h3>
            <p>{stats.totalStores}</p>
          </div>
          
          <div className="stat-card">
            <h3>Total Ratings</h3>
            <p>{stats.totalRatings}</p>
          </div>
          
        </div>

        <div className="quick-nav">
          <a href="/admin/users" className="btn btn-primary">Manage Users</a>
          <a href="/admin/stores" className="btn btn-primary">Manage Stores</a>
        </div>
        
      </div>
      
    </>
  );
}

export default AdminDashboard;