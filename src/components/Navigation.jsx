import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search, ChevronDown, LogIn, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext'; // 1. IMPORTAMOS NUESTRO HOOK DE AUTENTICACIÓN

export default function Navigation({ cartCount = 0 }) {
  // --- ESTADO LOCAL DEL COMPONENTE ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Estado para el nuevo menú de usuario
  const [categories, setCategories] = useState([]);
  
  // --- USAMOS EL CONTEXTO DE AUTENTICACIÓN ---
  const { isAuthenticated, user, logout } = useAuth(); // 2. OBTENEMOS EL ESTADO Y LAS FUNCIONES
  
  useEffect(() => {
    api.get('/categories/').then(res => setCategories(res.data)).catch(err => console.error(err));
  }, []);

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsCategoriesOpen(false);
    setIsUserMenuOpen(false);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={closeAllMenus}>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
              TechStore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
             <Link to="/" className="text-gray-300 hover:text-white transition-colors">Inicio</Link>
             <Link to="/products/" className="text-gray-300 hover:text-white transition-colors">Productos</Link>
            
            {/* Categories Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
              >
                Categorías <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                  {categories.map(cat => (
                    <Link key={cat.id_key} to={`/categories/${cat.id_key}`} onClick={closeAllMenus} className="block px-4 py-2 text-gray-300 hover:bg-gray-800">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Icons & User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-300 hover:text-white rounded-lg"><Search className="w-5 h-5" /></button>
            <Link to="/cart/" className="p-2 text-gray-300 hover:text-white rounded-lg relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-indigo-500 text-xs w-5 h-5 flex items-center justify-center rounded-full">{cartCount}</span>}
            </Link>

            {/* --- 3. MENÚ DE USUARIO DINÁMICO (DESKTOP) --- */}
            <div className="relative">
              {isAuthenticated ? (
                // --- SI ESTÁ LOGUEADO ---
                <>
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-800">
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
                      {user.name.charAt(0)}
                    </div>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1">
                      <Link to="/clients/me" onClick={closeAllMenus} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"><LayoutDashboard size={16}/>Mi Perfil</Link>
                      <button onClick={() => { logout(); closeAllMenus(); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-800"><LogOut size={16}/>Cerrar Sesión</button>
                    </div>
                  )}
                </>
              ) : (
                // --- SI NO ESTÁ LOGUEADO ---
                <Link to="/login" className="p-2 text-gray-300 hover:text-white rounded-lg flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X/> : <Menu/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 py-4 space-y-2">
            <Link to="/" onClick={closeAllMenus} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">Inicio</Link>
            <Link to="/products" onClick={closeAllMenus} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">Productos</Link>
            <Link to="/cart" onClick={closeAllMenus} className="flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">
              <span>Carrito</span>
              {cartCount > 0 && <span className="bg-indigo-500 text-xs px-2 py-1 rounded-full">{cartCount}</span>}
            </Link>
            
            {/* --- 4. MENÚ DE USUARIO DINÁMICO (MÓVIL) --- */}
            <div className="border-t border-gray-700 pt-4 mt-4">
              {isAuthenticated ? (
                  <>
                    <div className="flex items-center px-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white mr-3">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-base font-medium text-white">{user.name}</div>
                        <div className="text-sm font-medium text-gray-400">{user.email}</div>
                      </div>
                    </div>
                    <Link to="/clients/me" onClick={closeAllMenus} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">Mi Perfil</Link>
                    <button onClick={() => { logout(); closeAllMenus(); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/20">Cerrar Sesión</button>
                  </>
              ) : (
                  <Link to="/login" onClick={closeAllMenus} className="block px-3 py-2 rounded-md text-base font-medium text-indigo-400 hover:text-white hover:bg-gray-800">Iniciar Sesión</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
