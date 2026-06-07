import { useState, useEffect } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function AdminStores() {

  //1. Initialize states for the store list, search filters, sorting options, UI toggles, and new store data
  const [stores, setStores] = useState([]);
  
  const [filters, setFilters] = useState({ name: "", email: "", address: "" });
  
  const [sortBy, setSortBy] = useState("name");
  
  const [order, setOrder] = useState("asc");
  
  const [error, setError] = useState("");
  
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newStore, setNewStore] = useState({ name: "", email: "", address: "", owner_id: "" });
  
  const [formError, setFormError] = useState("");
  
  const [formSuccess, setFormSuccess] = useState("");
  
  const [storeOwners, setStoreOwners] = useState([]);

  //2. Define the navigation links to be displayed in the top Navbar
  const navLinks = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Users", path: "/admin/users" },
  ];

  //3. Fetch the list of stores from the API whenever the search filters or sorting parameters change
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await API.get("/admin/stores", {
          params: { ...filters, sortBy, order },
        });
        setStores(response.data);
      } catch {
        setError("Failed to load stores");
      }
    };
    fetchStores();
  }, [filters, sortBy, order]);

  //4. Fetch the list of users with the 'store_owner' role to populate the owner assignment dropdown
  useEffect(() => {
    const fetchStoreOwners = async () => {
      try {
        const response = await API.get("/admin/users", {
          params: { role: "store_owner" },
        });
        setStoreOwners(response.data);
      } catch {
        console.error("Failed to load store owners");
      }
    };
    fetchStoreOwners();
  }, []);

  //5. Update the respective filter state dynamically as the admin types in the search fields
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  //6. Handle the submission of the new store form, parse the owner ID, and send the data to the API
  const handleAddStore = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    try {
      await API.post("/admin/stores", {
        ...newStore,
        owner_id: newStore.owner_id ? parseInt(newStore.owner_id) : null,
      });
      setFormSuccess("Store created successfully");
      setNewStore({ name: "", email: "", address: "", owner_id: "" });
      setFilters({ ...filters });
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create store");
    }
  };

  //7. Render the store management interface including the filter bar, data table, and creation form
  return (
    <>
      
      <Navbar links={navLinks} />
      
      <div className="page-container">
        
        <div className="page-header">
          <h2>Manage Stores</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Filters */}
        <div className="card">
          <div className="filters-bar">
            <input className="form-control" style={{ maxWidth: 180 }} name="name" placeholder="Filter by name" value={filters.name} onChange={handleFilterChange} />
            <input className="form-control" style={{ maxWidth: 180 }} name="email" placeholder="Filter by email" value={filters.email} onChange={handleFilterChange} />
            <input className="form-control" style={{ maxWidth: 180 }} name="address" placeholder="Filter by address" value={filters.address} onChange={handleFilterChange} />
            <select className="form-control" style={{ maxWidth: 160 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
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
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Average Rating</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.email}</td>
                  <td>{store.address}</td>
                  <td><span className="rating-badge">{parseFloat(store.avgRating).toFixed(1)} ★</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Store */}
        <div className="section-header">
          <h3>Add New Store</h3>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add New Store"}
          </button>
        </div>

        {showAddForm && (
          <div className="card">
            {formError && <div className="alert alert-error">{formError}</div>}
            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
            <form onSubmit={handleAddStore}>
              <div className="form-group">
                <label>Store Name</label>
                <input className="form-control" placeholder="Min 20 characters" value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Store Email</label>
                <input className="form-control" type="email" value={newStore.email}
                  onChange={(e) => setNewStore({ ...newStore, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Store Address</label>
                <textarea className="form-control" rows={3} value={newStore.address}
                  onChange={(e) => setNewStore({ ...newStore, address: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Assign Owner</label>
                <select className="form-control" value={newStore.owner_id}
                  onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}>
                  <option value="">No Owner (assign later)</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>{owner.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Create Store</button>
            </form>
          </div>
        )}
        
      </div>
      
    </>
  );
}

export default AdminStores;