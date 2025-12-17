import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {ShoppingCart, ChevronRight, Tag, Sparkles } from "lucide-react";
import api from "../api";
import Navigation from "../components/Navigation";

// Componente de tarjeta de categoría destacada
function FeaturedCategoryCard({ category, productCount }) {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(`/categories/${category.id_key}`)}
      className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="p-4 bg-indigo-500/10 rounded-xl">
            <Tag className="w-8 h-8 text-indigo-400" />
          </div>
          <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
          {category.name}
        </h3>
        
        {category.description && (
          <p className="text-gray-400 mb-4 line-clamp-2">
            {category.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{productCount} productos</span>
          <span className="text-indigo-400 font-semibold group-hover:underline">
            Ver todos →
          </span>
        </div>
      </div>
    </div>
  );
}

// Componente de producto destacado (versión simplificada)
function ProductCard({ product }) {
  const navigate = useNavigate();
  
  const handleAddToCart = (e) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(item => item.id_key === product.id_key);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} agregado al carrito`);
  };
  
  return (
    <div 
      onClick={() => navigate(`/products/${product.id_key}`)}
      className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer"
    >
      <div className="relative overflow-hidden">
        <img 
          src={product.image || `https://via.placeholder.com/400x300/1f2937/6366f1?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          ${product.price}
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Agotado
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="text-xs text-indigo-400 mb-2">
          {product.category?.name || 'Sin categoría'}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span>Stock: {product.stock || 0}</span>
        </div>
        
        <button 
          onClick={handleAddToCart}
          disabled={!product.stock || product.stock === 0}
          className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" />
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadHomeData();
  }, []);

  async function loadHomeData() {
    setLoading(true);
    setError("");
    
    try {
      // Cargar categorías y productos en paralelo
      const [categoriesRes, productsRes] = await Promise.all([
        api.get("/categories/"),
        api.get("/products/")
      ]);
      
      setCategories(categoriesRes.data);
      
      // Tomar los primeros 8 productos para destacados
      setFeaturedProducts(productsRes.data.slice(0, 8));
      
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("No se pudieron cargar los datos. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // Contar productos por categoría
  function getProductCountByCategory(categoryId) {
    return featuredProducts.filter(p => p.category?.id_key === categoryId).length;
  }

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (loading) {
    return (
      <>
        <Navigation cartCount={cartCount} />
        <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-400">Cargando...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation cartCount={cartCount} />
      
      <div className="min-h-screen bg-black pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-sm mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Bienvenido a TechStore
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Tecnología de
              <span className="block bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                Última Generación
              </span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-8 animate-fade-in">
              Descubre los mejores productos tech con las mejores ofertas del mercado
            </p>
            <button
              onClick={() => navigate('/products/')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-500/25 animate-fade-in"
            >
              Ver Todos los Productos
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Promotional Banner */}
          <div className="mb-16 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-pink-500/20 rounded-2xl p-8 md:p-12 border border-indigo-500/30 text-center animate-fade-in">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Gran Promoción de Temporada
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Descuentos especiales en todas las categorías - ¡Aprovecha ahora!
            </p>
            <div className="inline-flex items-center gap-2 text-indigo-400 font-semibold">
              <span>Envío gratis en compras mayores a $1000</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Categories Section */}
          {categories.length > 0 && (
            <div className="mb-16 animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Explora por Categoría
                  </h2>
                  <p className="text-gray-400">
                    Encuentra exactamente lo que buscas
                  </p>
                </div>
                <button
                  onClick={() => navigate('/products/')}
                  className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Ver Todas
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.slice(0, 4).map(cat => (
                  <FeaturedCategoryCard
                    key={cat.id_key}
                    category={cat}
                    productCount={getProductCountByCategory(cat.id_key)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Featured Products Section */}
          {featuredProducts.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Productos Destacados
                  </h2>
                  <p className="text-gray-400">
                    Los más populares de la semana
                  </p>
                </div>
                <button
                  onClick={() => navigate('/products/')}
                  className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Ver Todos
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id_key} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && categories.length === 0 && featuredProducts.length === 0 && (
            <div className="text-center py-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                No hay productos disponibles
              </h2>
              <p className="text-gray-400">
                Estamos trabajando para agregar más productos pronto
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}