import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminStores from "./pages/admin/Stores";
import UserStores from "./pages/user/Stores";
import StoreOwnerDashboard from "./pages/storeOwner/Dashboard";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/stores" element={<AdminStores />} />
      <Route path="/user/stores" element={<UserStores />} />
      <Route path="/store-owner/dashboard" element={<StoreOwnerDashboard />} />
    </Routes>
  );
}

export default App;