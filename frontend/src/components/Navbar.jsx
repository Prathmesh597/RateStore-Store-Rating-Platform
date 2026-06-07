import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/star_logo.png";

function Navbar({ links = [] }) {

  //1. Extract user details and the logout function from the authentication context
  const { user, logout } = useAuth();
  
  //2. Initialize the navigation hook to allow programmatic routing between pages
  const navigate = useNavigate();

  //3. Handle the logout process by clearing the user session and redirecting to the login page
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  //4. Render the navigation bar with the brand logo, user greeting, dynamic links, and logout button
  return (
    <nav className="navbar">
      
      <div className="navbar-brand">
        <img src={logo} alt="Logo" className="navbar-logo" />
        <span className="navbar-title">RateStore</span>
      </div>
      
      <div className="navbar-nav">
        
        <span className="navbar-welcome">Welcome, {user?.name}</span>
        
        {links.map((link) => (
          <button
            key={link.label}
            className="btn btn-outline"
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </button>
        ))}
        
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
        
      </div>
      
    </nav>
  );
}

export default Navbar;