import { createContext, useState, useContext } from "react"; // 1. Import React hooks for context, state, and consuming context

const AuthContext = createContext(); // 2. Create a Context object to hold authentication data

// 3. AuthProvider component that wraps parts of the app needing auth info
export const AuthProvider = ({ children }) => {
  // 4. 'user' state: read from localStorage or default to null
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // 5. login function: saves token & user to localStorage, updates state
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // 6. logout function: removes token & user from localStorage, clears state
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // 7. Provide the context value (user, login, logout) to all children
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 8. Custom hook for easy access to auth context from any component
export const useAuth = () => useContext(AuthContext);