import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Tu api.js configurado

// 1. Creamos el contexto
const AuthContext = createContext(null);

// 2. Creamos el "Proveedor" del contexto
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Almacenará datos del usuario si está logueado
  const navigate = useNavigate();

  // 3. Efecto para comprobar el token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Si hay token, podríamos ir a buscar los datos del usuario a /clients/me
      api.get('/clients/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          // Si el token es inválido, lo limpiamos
          localStorage.removeItem('token');
        });
    }
  }, []);

  // 4. Función para iniciar sesión
  const login = (userData) => {
    setUser(userData);
    navigate('/products'); // O a la página que quieras después del login
  };

  // 5. Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user, // Booleano que nos dice si está autenticado
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 6. Hook personalizado para usar el contexto fácilmente
export function useAuth() {
  return useContext(AuthContext);
}
