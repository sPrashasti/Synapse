import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const t = localStorage.getItem("synapse_token");
    const u = localStorage.getItem("synapse_user");
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  const saveSession = (token, user) => {
    localStorage.setItem("synapse_token", token);
    localStorage.setItem("synapse_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post(`${API_URL}/api/auth/register`, {
      name, email, password,
    });
    saveSession(data.token, data.user);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/api/auth/login`, {
      email, password,
    });
    saveSession(data.token, data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("synapse_token");
    localStorage.removeItem("synapse_user");
    setToken(null);
    setUser(null);
  };

  // Axios helper with auth header
  const authAxios = (config = {}) =>
    axios({ ...config, headers: { ...config.headers, Authorization: `Bearer ${token}` } });

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
