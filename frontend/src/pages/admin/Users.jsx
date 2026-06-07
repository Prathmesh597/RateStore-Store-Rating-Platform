import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function AdminUsers() {

  //1. Initialize states for the user list, search filters, sorting options, UI toggles, and new user form data
  const [users, setUsers] = useState([]);
  
  const [filters, setFilters] = useState({ name: "", email: "", address: "", role: "" });
  
  const [sortBy, setSortBy] = useState("name");
  
  const [order, setOrder] = useState("asc");
  
  const [error, setError] = useState("");
  
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", address: "", role: "user" });
  
  const [formError, setFormError] = useState("");
  
  const [formSuccess, setFormSuccess] = useState("");

  //2. Initialize the navigation hook to route between different admin pages
  const navigate = useNavigate();

  //3. Define the navigation links to be displayed in the top Navbar
  const navLinks = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Stores", path: "/admin/stores" },
  ];

  //4. Fetch the list of users from the API whenever the filters, sorting attribute, or order change
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get("/admin/users", {
          params: { ...filters, sortBy, order },
        });
        setUsers(response.data);
      } catch {
        setError("Failed to load users");
      }
    };
    fetchUsers();
  }, [filters, sortBy, order]);

  //5. Fetch detailed information for a specific user when their view button is clicked
  const fetchUserById = async (id) => {
    try {
      const response = await API.get(`/admin/users/${id}`);
      setSelectedUser(response.data);
    } catch {
      setError("Failed to load user details");
    }
  };

  //6. Update the respective filter state dynamically as the admin types in the search fields
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  //7. Handle the submission of the new user form, send data to the API, and refresh the list on success
  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    try {
      await API.post("/admin/users", newUser);
      setFormSuccess("User created successfully");
      setNewUser({ name: "", email: "", password: "", address: "", role: "user" });
      setFilters({ ...filters });
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create user");
    }
  };

  //8. Render the user management interface including the filter bar, data table, detail view, and creation form
  return (
    <>
      
      <Navbar links={navLinks} />
      
      <div className="page-container">
        
        <div className="page-header">
          <h2>Manage Users</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Filters */}
        <div className="card">
          <div className="filters-bar">
            <input className="form-control" style={{ maxWidth: 180 }} name="name" placeholder="Filter by name" value={filters.name} onChange={handleFilterChange} />
            <input className="form-control" style={{ maxWidth: 180 }} name="email" placeholder="Filter by email" value={filters.email} onChange={handleFilterChange} />
            <input className="form-control" style={{ maxWidth: 180 }} name="address" placeholder="Filter by address" value={filters.address} onChange={handleFilterChange} />
            <select className="form-control" style={{ maxWidth: 150 }} name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
            </select>
            <select className="form-control" style={{ maxWidth: 160 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="address">Sort by Address</option>
              <option value="role">Sort by Role</option>
            </select>
            <select className="form-control" style={{ maxWidth: 130 }} value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td><span className="rating-badge">{user.role}</span></td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => fetchUserById(user.id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Detail */}
        {selectedUser && (
          <div className="detail-card">
            <div className="section-header">
              <h3>User Details</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Address:</strong> {selectedUser.address}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            {selectedUser.avgRating !== undefined && (
              <p><strong>Average Rating:</strong> {parseFloat(selectedUser.avgRating).toFixed(1)}</p>
            )}
          </div>
        )}

        {/* Add User */}
        <div className="section-header">
          <h3>Add New User</h3>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add New User"}
          </button>
        </div>

        {showAddForm && (
          <div className="card">
            {formError && <div className="alert alert-error">{formError}</div>}
            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" placeholder="Min 20 characters" value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" type="email" value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="form-control" type="password" value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea className="form-control" rows={3} value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-control" value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="user">User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Create User</button>
            </form>
          </div>
        )}
        
      </div>
      
    </>
  );
}

export default AdminUsers;