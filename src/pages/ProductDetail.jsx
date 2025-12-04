import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Tag } from 'lucide-react';
import api from '../api';
import Navigation from '../components/Navigation';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    setLoading(true);
    setError('');
    
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      setError('No se pudo cargar el producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(item => item.id_key === product.id_key);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} agregado al carrito (${quantity} unidades)`);
  }

  // Obtener cantidad de items en carrito
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (loading) {
    return (
      <>
        <Navigation cartCount={cartCount} />
        <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-400">Cargando producto...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navigation cartCount={cartCount} />
        <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {error || 'Producto no encontrado'}
            </h2>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-semibold transition-all"
            >
              Volver a Productos
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
            onClick={() => navigate('/products')}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a productos
          </button>

          {/* Product Detail */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
                <img
                  src={product.image || `https://via.placeholder.com/800x600/1f2937/6366f1?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="w-full h-[500px] object-cover rounded-xl"
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-sm">
                <Tag className="w-4 h-4" />
                {product.category?.name || 'Sin categoría'}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  {product.name}
                </h1>
                <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                  ${product.price}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Descripción
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Stock Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-indigo-400" />
                    <span className="text-gray-400 text-sm">Stock</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {product.stock} unidades
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingCart className="w-5 h-5 text-indigo-400" />
                    <span className="text-gray-400 text-sm">Disponibilidad</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {product.stock > 0 ? (
                      <span className="text-green-400">En Stock</span>
                    ) : (
                      <span className="text-red-400">Agotado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <label className="block text-gray-300 mb-3 font-semibold">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-3 text-white hover:bg-gray-700 rounded-l-lg transition-colors font-semibold"
                      >
                        -
                      </button>
                      <span className="px-6 text-white font-bold text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-3 text-white hover:bg-gray-700 rounded-r-lg transition-colors font-semibold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-gray-400 text-sm">
                      (Máximo: {product.stock})
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock === 0}
                className="w-full px-8 py-5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-6 h-6" />
                {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
              </button>

              {/* Additional Info */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Información Adicional
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Envío gratuito en compras mayores a $1000
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Garantía de 30 días
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Soporte técnico incluido
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}