import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import api from '../api';
import Navigation from '../components/Navigation';

// Componente de tarjeta de producto
function ProductCard({ product, onAddToCart, onViewDetails }) {
  return (
    <div className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 animate-fade-in">
      <div className="relative overflow-hidden">
        <img 
          src={product.image || `https://via.placeholder.com/400x300/1f2937/6366f1?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          ${product.price}
        </div>
      </div>
      
      <div className="p-5">
        <div className="text-xs text-gray-400 mb-2">
          {product.category?.name || 'Sin categoría'}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span>Stock: {product.stock || 0}</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onViewDetails(product)}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Ver
          </button>
          <button 
            onClick={() => onAddToCart(product)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg transition-all"
            disabled={!product.stock || product.stock === 0}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cargar productos y categorías
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    
    try {
      // Cargar productos
      const productsRes = await api.get('/products');
      setProducts(productsRes.data);

      // Cargar categorías
      try {
        const categoriesRes = await api.get('/categories');
        setCategories(categoriesRes.data);
      } catch (err) {
        console.log('No se pudieron cargar categorías');
      }
    } catch (err) {
      setError('No se pudieron cargar los productos. Por favor intenta de nuevo.');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }

  // Agregar al carrito
  function handleAddToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Verificar si ya existe en el carrito
    const existingIndex = cart.findIndex(item => item.id_key === product.id_key);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} agregado al carrito`);
  }

  // Filtrar productos
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           p.category?.name === selectedCategory ||
                           (!p.category && selectedCategory === 'Sin categoría');
    return matchesSearch && matchesCategory;
  });

  // Obtener cantidad de items en carrito para el nav
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <>
      <Navigation cartCount={cartCount} />
      
      <div className="min-h-screen bg-black pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Premium <span className="bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">Tech Products</span>
            </h1>
            <p className="text-gray-400 text-lg">Descubre lo último en tecnología</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id_key}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="text-gray-400 mt-4">Cargando productos...</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id_key}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={setSelectedProduct}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No se encontraron productos</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
}

// Modal de detalles del producto
function ProductDetailModal({ product, onClose, onAddToCart }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Detalles del Producto</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="text-gray-400 text-2xl">×</span>
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img 
                src={product.image || `https://via.placeholder.com/600x400/1f2937/6366f1?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="text-sm text-indigo-400 mb-2">
                  {product.category?.name || 'Sin categoría'}
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{product.name}</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                  ${product.price}
                </div>
              </div>

              <div className="space-y-3 text-gray-300">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span>Stock Disponible</span>
                  <span className="font-semibold text-white">{product.stock} unidades</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span>Categoría</span>
                  <span className="font-semibold text-white">
                    {product.category?.name || 'Sin categoría'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                disabled={!product.stock || product.stock === 0}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}