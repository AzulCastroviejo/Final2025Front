import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';

// Protected Route Component
/*function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}*/

function App() {

  
  return (
    <Routes>
      {/* Ruta principal - Mostrar productos directamente (HOME) */}
      <Route path="/" element={<Products />} />
      
      {/* Detalle de producto */}
      <Route path="/products/:id" element={<ProductDetail />} />
      
      {/* Carrito de compras */}
      <Route path="/cart" element={<Cart />} />
      
      {/* Redireccionar cualquier ruta no encontrada al home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
