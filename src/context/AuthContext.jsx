import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Añadimos un estado de carga

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/clients/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  // No renderizamos nada hasta que la carga inicial del usuario haya terminado
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personalizado con validación
export function useAuth() {
  const context = useContext(AuthContext);
  
  // ¡AQUÍ ESTÁ LA MEJORA!
  if (context === null) {
    throw new Error('useAuth() debe ser usado dentro de un <AuthProvider>. Revisa tu App.js o main.jsx.');
  }
  
  return context;
}
