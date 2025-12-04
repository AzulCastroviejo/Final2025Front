import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, LogOut } from 'lucide-react';

export default function Navigation({ cartCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!user;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/products" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
              TechStore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/products"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Products
            </Link>
            <button className="text-gray-300 hover:text-white transition-colors">
              Categories
            </button>
            {isLoggedIn && (
              <Link 
                to="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
              <Search className="w-5 h-5" />
            </button>
            
            {isLoggedIn ? (
              <>
                <Link 
                  to="/cart"
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-300 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link 
                to="/"
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg transition-all"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <Link 
              to="/products"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
            >
              Products
            </Link>
            <button className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
              Categories
            </button>
            {isLoggedIn && (
              <>
                <Link 
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                >
                  Cart ({cartCount})
                </Link>
                <button 
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}