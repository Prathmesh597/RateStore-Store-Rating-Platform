import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function UserStores() {

  //1. Initialize states for managing the store list, search filters, error messages, user ratings, and password updates
  const [stores, setStores] = useState([]);
  
  const [filters, setFilters] = useState({ name: "", address: "" });
  
  const [sortBy, setSortBy] = useState("name");
  
  const [order, setOrder] = useState("asc");
  
  const [error, setError] = useState("");
  
  const [ratingInputs, setRatingInputs] = useState({});
  
  const [ratingMessages, setRatingMessages] = useState({});
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  
  const [passwordError, setPasswordError] = useState("");
  
  const [passwordSuccess, setPasswordSuccess] = useState("");

  //2. Retrieve user context and initialize the navigation hook
  const { user } = useAuth();
  
  const navigate = useNavigate();

  //3. Define the navigation links to be passed to the Navbar component
  const navLinks = [];

  //4. Fetch the stores from the API using the current filters, sorting field, and order
  const fetchStores = async () => {
    try {
      const response = await API.get("/user/stores", {
        params: { ...filters, sortBy, order },
      });
      setStores(response.data);
    } catch {
      setError("Failed to load stores");
    }
  };

  //5. Automatically trigger the store fetch whenever the component mounts or the filter/sort parameters change
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await API.get("/user/stores", {
          params: { ...filters, sortBy, order },
        });
        setStores(response.data);
      } catch {
        setError("Failed to load stores");
      }
    };
    fetch();
  }, [filters, sortBy, order]);

  //6. Update the respective filter state dynamically as the user types in the search inputs
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  //7. Submit a new rating or update an existing one for a specific store, then refresh the list
  const handleRatingSubmit = async (storeId, isUpdate) => {
    const rating = ratingInputs[storeId];
    if (!rating) return;

    try {
      if (isUpdate) {
        await API.put("/user/ratings", { store_id: storeId, rating: parseInt(rating) });
      } else {
        await API.post("/user/ratings", { store_id: storeId, rating: parseInt(rating) });
      }
      setRatingMessages({ ...ratingMessages, [storeId]: isUpdate ? "Rating updated!" : "Rating submitted!" });
      fetchStores();
    } catch (err) {
      setRatingMessages({ ...ratingMessages, [storeId]: err.response?.data?.message || "Failed" });
    }
  };

  //8. Handle the submission of the password change form and display the appropriate success or error message
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await API.put("/user/password", passwordData);
      setPasswordSuccess("Password updated successfully");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    }
  };

  //9. Render the user interface including the account settings toggle, search filters, and the stores data table
  return (
    <>
      
      <Navbar links={navLinks} />
      
      <div className="page-container">
        
        <div className="page-header">
          <h2>Stores</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

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

        {/* Filters */}
        <div className="card">
          <div className="filters-bar">
            <input className="form-control" style={{ maxWidth: 200 }} name="name" placeholder="Search by name" value={filters.name} onChange={handleFilterChange} />
            <input className="form-control" style={{ maxWidth: 200 }} name="address" placeholder="Search by address" value={filters.address} onChange={handleFilterChange} />
            <select className="form-control" style={{ maxWidth: 160 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="address">Sort by Address</option>
              <option value="avgRating">Sort by Rating</option>
            </select>
            <select className="form-control" style={{ maxWidth: 130 }} value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Stores Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Address</th>
                <th>Overall Rating</th>
                <th>Your Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.address}</td>
                  <td><span className="rating-badge">{parseFloat(store.avgRating).toFixed(1)} ★</span></td>
                  <td>{store.userRating ? <span className="rating-badge">{store.userRating} ★</span> : "Not rated"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <select
                        className="form-control"
                        style={{ maxWidth: 80 }}
                        value={ratingInputs[store.id] || ""}
                        onChange={(e) => setRatingInputs({ ...ratingInputs, [store.id]: e.target.value })}
                      >
                        <option value="">★</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleRatingSubmit(store.id, store.userRating !== null)}
                      >
                        {store.userRating !== null ? "Update" : "Submit"}
                      </button>
                      {ratingMessages[store.id] && (
                        <span style={{ color: "green", fontSize: 13 }}>{ratingMessages[store.id]}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
      
    </>
  );
}

export default UserStores;  