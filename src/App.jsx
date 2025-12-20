import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';

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
    <Router>
      <Routes>
        {/* Ruta principal - Home con categorías y productos destacados */}
        <Route path="/" element={<Home />} />
        
        {/* Todos los productos */}
        <Route path="/products" element={<Products />} />
        
        {/* Vista de productos por categoría */}
        <Route path="/categories/:categoryId" element={<CategoryPage />} />
      
        {/* Detalle de producto */}
        <Route path="/products/:id" element={<ProductDetail />} />
        
        {/* Carrito de compras */}
        <Route path="/cart" element={<Cart />} />
        
        {/* Redireccionar dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redireccionar cualquier ruta no encontrada al home */}
        {<Route path="*" element={<Navigate to="/" replace />} />}

        
      </Routes>
    </Router>

  );
}

export default App;
