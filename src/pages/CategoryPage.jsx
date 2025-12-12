import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import api from '../api';
import Navigation from '../components/Navigation';

function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  
  return (
    <div className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 animate-fade-in">
      <div className="relative overflow-hidden cursor-pointer" onClick={() => navigate(`/products/${product.id_key}`)}>
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
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors cursor-pointer"
            onClick={() => navigate(`/products/${product.id_key}`)}>
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Package className="w-4 h-4" />
          <span>Stock: {product.stock || 0}</span>
        </div>
        
        {product.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/products/${product.id_key}`)}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Ver Detalles
          </button>
          <button 
            onClick={() => onAddToCart(product)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!product.stock || product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategoryData();
  }, [categoryId]);

  async function loadCategoryData() {
    setLoading(true);
    setError('');
    
    try {
      // Cargar información de la categoría
      const categoryRes = await api.get(`/categories/${categoryId}`);
      setCategory(categoryRes.data);

      // Cargar productos de esta categoría
      // Opción 1: Si tu backend tiene un endpoint específico
      try {
        const productsRes = await api.get(`/categories/${categoryId}/products`);
        setProducts(productsRes.data);
      } catch (err) {
        // Opción 2: Filtrar desde todos los productos
        const allProductsRes = await api.get('/products');
        const filtered = allProductsRes.data.filter(
          p => p.category?.id_key === categoryId
        );
        setProducts(filtered);
      }
    } catch (err) {
      setError('No se pudo cargar la categoría');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(item => item.id_key === product.id_key);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} agregado al carrito`);
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
            <p className="text-gray-400">Cargando categoría...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !category) {
    return (
      <>
        <Navigation cartCount={cartCount} />
        <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {error || 'Categoría no encontrada'}
            </h2>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-semibold transition-all"
            >
              Volver al Inicio
            </button>
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
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </button>

          {/* Category Header */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-indigo-500/30">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-300 text-lg max-w-3xl">
                  {category.description}
                </p>
              )}
              <div className="mt-6 flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-400" />
                  <span>{products.length} productos disponibles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id_key}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
              <Package className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                No hay productos en esta categoría
              </h2>
              <p className="text-gray-400 mb-6">
                Estamos trabajando para agregar más productos pronto
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-semibold transition-all"
              >
                Ver Todos los Productos
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}