import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    console.log('Token on refresh:', token);
    if (token) {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Refreshed user:', response.data.user);
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to refresh user:', error.response?.status, error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('token'); 
          setUser(null);
        }
      }
    } else {
      console.log('No token found for refresh');
      setUser(null);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      console.log('Token on load:', token);
      if (token) {
        try {
          const response = await axios.get('http://localhost:3000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Fetched user:', response.data.user);
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to fetch user:', error.response?.status, error.message);
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
          }
          setUser(null);
        }
      } else {
        console.log('No token found');
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}