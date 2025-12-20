import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search, ChevronDown } from 'lucide-react';
import api from '../api';
import { Link } from "react-router-dom";

export default function Navigation({ cartCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
 // const user = JSON.parse(localStorage.getItem('user') || 'null');
//  const isLoggedIn = !!user;

 /* const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };*/

    useEffect(() => {
      loadCategories();
    }, []);

    async function loadCategories() {
      try {
        const res = await api.get('/categories/');
        setCategories(res.data);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
  }
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
              TechStore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
             <Link 
              to="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Inicio
            </Link>
            <Link 
              to="/products/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Productos
            </Link>
            

            {/* Categories Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                onMouseEnter={() => setIsCategoriesOpen(true)}
                className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
              >
                Categorías
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCategoriesOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl animate-fade-in"
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                >
                  <div className="py-2">
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <Link
                          key={cat.id_key}
                          to={`/categories/${cat.id_key}`}
                          onClick={() => setIsCategoriesOpen(false)}
                          className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        No hay categorías disponibles
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
              <Search className="w-5 h-5" />
            </button>
            
            <Link 
              to="/cart/"
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
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
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
            >
              Productos
            </Link>
            
            <div className="border-t border-gray-700 pt-3">
              <div className="px-4 py-2 text-gray-400 text-sm font-semibold">
                Categorías
              </div>
              {categories.map(cat => (
                <Link
                  key={cat.id_key}
                  to={`/categories/${cat.id_key}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <Link 
              to="/cart/"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg flex items-center justify-between"
            >
              <span>Carrito</span>
              {cartCount > 0 && (
                <span className="bg-indigo-500 text-white px-2 py-1 rounded-full text-xs">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
