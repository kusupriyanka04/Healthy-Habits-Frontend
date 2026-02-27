import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('hh-token')) fetchMe();
    else setLoading(false);
  }, []);

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } 
    catch (err){
      const status = err.response?.status;
      if(status === 401){
        localStorage.removeItem('hh-token');
        setUser(null);
      }
    }
    // catch {
    //   localStorage.removeItem('hh-token');
    //   setUser(null);
    // }
    // catch (err) {
    //   const token = localStorage.getItem('hh-token');
    //   if(!token){
    //     setUser(null);
    //   }
    //   console.warn('fetchMe failed:', err.response?.status);
    // }
     finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('hh-token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  };

  const setUserAndToken = (userData) => {
    setUser(userData);
  }

  const updateProfile = async (name, email) => {
    const { data } = await api.put('/auth/profile', {name, email});
    localStorage.setItem('hh-token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } finally {
      localStorage.removeItem('hh-token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUserAndToken, updateProfile, }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

