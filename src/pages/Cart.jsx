import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import api from '../api';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    shipping_address: '',
    payment_method: 'card'
  });
  const navigate = useNavigate();
  // Cargar carrito desde localStorage
  useEffect(() => {
    loadCart();
  }, []);

  function loadCart() {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }

  // Guardar carrito en localStorage
  function saveCart(newCart) {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  }

  // Eliminar item del carrito
  function removeItem(index) {
    const newCart = cart.filter((_, i) => i !== index);
    saveCart(newCart);
  }

  // Actualizar cantidad
  function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) return;
    
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    saveCart(newCart);
  }

  // Vaciar carrito
  function clearCart() {
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      saveCart([]);
    }
  }

  // Calcular totales
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.16; // 16% IVA
  const shipping = subtotal > 1000 ? 0 : 150;
  const total = subtotal + tax;

  // Finalizar compra
  async function handleCreateOrder(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setLoading(true);

    try {
      // Aquí integrarías con tu API de pedidos
      // Ejemplo:
      // const user = JSON.parse(localStorage.getItem('user'));
      // const orderData = {
      //   client_id: user.id,
      //   items: cart.map(item => ({
      //     product_id: item.id_key,
      //     quantity: item.quantity,
      //     price: item.price
      //   })),
      //   total: total
      // };
      // await api.post('/orders', orderData);
       const orderItems = cart.map(item => ({
        product_id: item.id_key,
        quantity: item.quantity,
        price: item.price
      }));

      // Crear la orden
      const orderPayload = {
        client_name: orderData.client_name,
        client_email: orderData.client_email,
        client_phone: orderData.client_phone,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
        items: orderItems,
        subtotal: subtotal,
        tax: tax,
        shipping_cost: shipping,
        total: total,
        status: 'pending' // pending, confirmed, shipped, delivered, cancelled
      };

      // Enviar al backend
      const response = await api.post('/orders', orderPayload);
      
      console.log('Orden creada:', response.data);
      
      // Limpiar carrito
      saveCart([]);
      
      // Mostrar mensaje de éxito
      setOrderSuccess(true);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
      // saveCart([]);
    } catch (err) {
          console.error('Error al crear orden:', err);
      
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Error al procesar el pedido. Por favor intenta de nuevo.';
      

      setLoading(false);
    }
  }
  function handleInputChange(e) {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  if (orderSuccess) {
    return (
      <>
        <Navigation cartCount={0} />
        <div className="min-h-screen bg-black pt-20 pb-12 flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-green-500/30">
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                ¡Orden Creada con Éxito!
              </h2>
              <p className="text-gray-300 mb-6">
                Tu pedido ha sido procesado correctamente. Recibirás un correo de confirmación pronto.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-semibold transition-all"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <Navigation cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
      
      <div className="min-h-screen bg-black pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">
              Carrito de Compras
            </h1>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Vaciar Carrito
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
              <ShoppingCart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-400 mb-6">
                Agrega productos para comenzar tu compra
              </p>
              <a
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-semibold transition-all"
              >
                Ver Productos
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
               <div className="lg:col-span-2">
                {!showCheckout ? (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 animate-fade-in"
                      >
                        <div className="flex flex-col sm:flex-row gap-6">
                          <img
                            src={item.image || `https://via.placeholder.com/150x150/1f2937/6366f1?text=${encodeURIComponent(item.name)}`}
                            alt={item.name}
                            className="w-full sm:w-32 h-32 object-cover rounded-lg"
                          />

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-1">
                                  {item.name}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  {item.category?.name || 'Sin categoría'}
                                </p>
                              </div>
                              <button
                                onClick={() => removeItem(index)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="text-indigo-400 font-semibold text-lg">
                                ${item.price}
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-sm">Cantidad:</span>
                                <div className="flex items-center gap-2 bg-gray-800 rounded-lg">
                                  <button
                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                    className="px-3 py-2 text-white hover:bg-gray-700 rounded-l-lg transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="px-4 text-white font-semibold">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                    className="px-3 py-2 text-white hover:bg-gray-700 rounded-r-lg transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="text-white font-bold text-xl">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Checkout Form */
                  <form onSubmit={handleCreateOrder} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Información de Envío
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Nombre Completo *</label>
                        <input
                          type="text"
                          name="client_name"
                          value={orderData.client_name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                          placeholder="Juan Pérez"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Email *</label>
                        <input
                          type="email"
                          name="client_email"
                          value={orderData.client_email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                          placeholder="juan@ejemplo.com"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Teléfono *</label>
                        <input
                          type="tel"
                          name="client_phone"
                          value={orderData.client_phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                          placeholder="+54 9 11 1234-5678"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Dirección de Envío *</label>
                        <textarea
                          name="shipping_address"
                          value={orderData.shipping_address}
                          onChange={handleInputChange}
                          required
                          rows="3"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                          placeholder="Calle Falsa 123, Piso 4, Depto B, Mendoza"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Método de Pago *</label>
                        <select
                          name="payment_method"
                          value={orderData.payment_method}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="card">Tarjeta de Crédito/Débito</option>
                          <option value="transfer">Transferencia Bancaria</option>
                          <option value="cash">Efectivo (Contra Entrega)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowCheckout(false)}
                        className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                      >
                        Volver
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                      >
                        {loading ? 'Procesando...' : 'Confirmar Pedido'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-indigo-500/30 sticky top-24">
                  <h2 className="text-xl font-bold text-white mb-6">
                    Resumen del Pedido
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Subtotal ({cart.length} items)</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-300">
                      <span>IVA (16%)</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xl text-gray-300">Total</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!showCheckout ? (
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      Proceder al Pago
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : null}

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Envío gratuito en compras mayores a $1000
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}