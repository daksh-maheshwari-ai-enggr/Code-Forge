import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setLoading(false);
      return;
    }

    const restoreSession = async () => {
      try {
        const response = await getCurrentUser(token);
        const currentUser = response.data.user;

        setUser(currentUser);
        localStorage.setItem("authUser", JSON.stringify(currentUser));
      } catch {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const register = (registeredUser) => {
    setUser(registeredUser);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}