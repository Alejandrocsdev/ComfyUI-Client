// Libraries
import { createContext, useContext, useEffect, useState } from 'react';
// API
import { api, axiosPrivate } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    api(axiosPrivate.get('/api/auth/me'), {
      onSuccess: (data) => setUser(data),
      onError: () => setUser(null),
    });
  }, []);

  const logout = async () => {
    await api(axiosPrivate.post('/api/auth/logout'), {
      onFinally: () => setUser(null),
    });
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
