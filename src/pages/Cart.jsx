import { useState, useEffect } from 'react';
import { ShoppingCart, X, ChevronRight, Trash2, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import OrderSuccessModal from '../components/OrderSuccessModal';
import api from '../api';

const deliveryMethods = {
  home_delivery: 'Envío a Domicilio',
  drive_thru: 'Retiro en Drive-Thru',
  on_hand: 'Retiro en Tienda',
};

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState({
    shipping_address: '',
    payment_method: 'card',
    delivery_method: 'home_delivery',
  });

  const [categories, setCategories] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderInfo, setOrderInfo] = useState({ orderNumber: null, total: 0 });

  // --- State para Autenticación ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Cargar categorías y carrito
    api.get("/categories/").then(res => setCategories(res.data));
    loadCart();

    // --- Verificación de Autenticación ---
    const token = localStorage.getItem('token');
    if (token) {
      // Configurar el header de autorización para futuras llamadas
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Obtener datos del usuario
      api.get('/clients/me')
        .then(res => {
          setCurrentUser(res.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token inválido o expirado
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        });
    }
  }, []);

  const categoryMap = Object.fromEntries(
    categories.map(cat => [cat.id_key, cat.name])
  );

  function loadCart() {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }

  function saveCart(newCart) {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  }

  function removeItem(index) {
    const newCart = cart.filter((_, i) => i !== index);
    saveCart(newCart);
  }
  
  function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) return;
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    saveCart(newCart);
  }

  function clearCart() {
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      saveCart([]);
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.16; // 16% IVA
  const shipping = orderData.delivery_method === 'home_delivery' && subtotal < 1000 ? 50 : 0;
  const total = subtotal + tax + shipping;

  function handleCheckout() {
    if (isAuthenticated) {
      setShowCheckout(true);
    } else {
      // Guardar el carrito y redirigir a login
      alert('Debes iniciar sesión para continuar con la compra.');
      navigate('/login');
    }
  }

  async function handleCreateOrder(e) {
    e.preventDefault();
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    setLoading(true);

    try {
      // YA NO SE CREA EL CLIENTE. SE USA EL USUARIO AUTENTICADO.
      const clientId = currentUser.id_key;

      // PASO 1: Crear la dirección (si aplica)
      if (orderData.delivery_method === 'home_delivery') {
        const addressPayload = { description: orderData.shipping_address, client_id_key: clientId };
        await api.post('/addresses', addressPayload);
      }

      // PASO 2: Crear la factura (Bill)
      const paymentTypeMapping = {
        card: 'card',
        transfer: 'bank_transfer',
        cash: 'cash',
      };
      const billPayload = {
        total: total,
        payment_type: paymentTypeMapping[orderData.payment_method],
        client_id_key: clientId,
      };
      const billResponse = await api.post('/bills', billPayload);
      const billId = billResponse.data.id_key;
      
      // PASO 3: Crear la orden
      // El backend asociará la orden con el usuario a través del token.
      const orderPayload = {
        bill_id_key: billId,
        delivery_method: orderData.delivery_method,
        status: 'PENDING',
        total: total,
        // Los campos `date` y `client_id_key` son gestionados por el backend.
      };
      const orderResponse = await api.post('/orders/', orderPayload);
      const orderId = orderResponse.data.id_key;

      // PASO 4: Añadir productos a la orden
      const orderDetailPromises = cart.map(item => api.post('/order_details', {
        order_id_key: orderId,
        product_id_key: item.id_key,
        quantity: item.quantity,
        price: item.price
      }));
      await Promise.all(orderDetailPromises);

      // FINAL: Éxito
      setOrderInfo({ orderNumber: orderId, total: total });
      saveCart([]);
      setShowSuccessModal(true);

    } catch (err) {
      console.error('❌ Error en el proceso de creación de orden:', err.response || err);
      let errorMessage = 'Ocurrió un error inesperado.';
      if (err.response && err.response.data && err.response.data.detail) {
          const detail = err.response.data.detail;
          if (Array.isArray(detail)) {
            errorMessage = detail.map(e => `${e.loc.join('.')} - ${e.msg}`).join('\n');
          } else if (typeof detail === 'string') {
            errorMessage = detail;
          } else {
            errorMessage = JSON.stringify(detail);
          }
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(`Error al crear la orden:\n\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  }

  // --- RENDERIZADO ---
  return (
    <>
      <Navigation cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
      <div className="min-h-screen bg-black pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Carrito de Compras</h1>
                {cart.length > 0 && (
                <button onClick={clearCart} className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Vaciar Carrito
                </button>
                )}
            </div>

            {cart.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
                    <ShoppingCart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
                    <h2 className="text-2xl font-semibold text-white mb-2">Tu carrito está vacío</h2>
                    <p className="text-gray-400 mb-6">Agrega productos para comenzar tu compra</p>
                    <Link to="/products/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-semibold transition-all">
                        Ver Productos <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {/* --- Vista del Carrito o Checkout --- */}
                        {!showCheckout ? (
                        <div className="space-y-4">
                            {cart.map((item, index) => (
                            <div key={index} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 animate-fade-in">
                                <div className="flex flex-col sm:flex-row gap-6">
                                <img src={item.image || `https://via.placeholder.com/150x150/1f2937/6366f1?text=${encodeURIComponent(item.name)}`} alt={item.name} className="w-full sm:w-32 h-32 object-cover rounded-lg" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                                    {/* ... resto de la info del item ... */}
                                    <div className="flex items-center justify-between mt-4">
                                      <div className="text-indigo-400 font-semibold text-lg">${item.price}</div>
                                      <div className="flex items-center gap-3">
                                          <span className="text-gray-400 text-sm">Cantidad:</span>
                                          <div className="flex items-center gap-2 bg-gray-800 rounded-lg">
                                          <button onClick={() => updateQuantity(index, item.quantity - 1)} className="px-3 py-2 text-white hover:bg-gray-700 rounded-l-lg transition-colors">-</button>
                                          <span className="px-4 text-white font-semibold">{item.quantity}</span>
                                          <button onClick={() => updateQuantity(index, item.quantity + 1)} className="px-3 py-2 text-white hover:bg-gray-700 rounded-r-lg transition-colors">+</button>
                                          </div>
                                      </div>
                                      <div className="text-white font-bold text-xl">${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            ))}
                        </div>
                        ) : (
                        // --- Formulario de Checkout Simplificado ---
                        <form onSubmit={handleCreateOrder} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-6">Información de Entrega</h2>
                            {currentUser && <p className="text-gray-300 mb-4">Hola, <span className="font-bold">{currentUser.name}</span>. Confirma los detalles de tu orden.</p>}
                            <div className="space-y-4">
                                <p className="text-sm text-gray-400">Email de contacto: <span className="font-medium text-white">{currentUser?.email}</span></p>
                                <div>
                                    <label className="block text-gray-300 mb-2">Método de Entrega *</label>
                                    <select name="delivery_method" value={orderData.delivery_method} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                                    {Object.entries(deliveryMethods).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                    </select>
                                </div>
                                {orderData.delivery_method === 'home_delivery' && (
                                    <div>
                                    <label className="block text-gray-300 mb-2">Dirección de Envío *</label>
                                    <textarea name="shipping_address" value={orderData.shipping_address} onChange={handleInputChange} required rows="3" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" placeholder="Calle Falsa 123, Piso 4, Depto B, Mendoza" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-gray-300 mb-2">Método de Pago *</label>
                                    <select name="payment_method" value={orderData.payment_method} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                                    <option value="card">Tarjeta de Crédito/Débito</option>
                                    <option value="transfer">Transferencia Bancaria</option>
                                    <option value="cash">Efectivo (Contra Entrega)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                              <button type="button" onClick={() => setShowCheckout(false)} className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all">Volver</button>
                              <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50">
                                  {loading ? 'Procesando...' : 'Confirmar Pedido'}
                              </button>
                            </div>
                        </form>
                        )}
                    </div>

                    {/* --- Resumen del Pedido --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-indigo-500/30 sticky top-24">
                          <h2 className="text-xl font-bold text-white mb-6">Resumen del Pedido</h2>
                          <div className="space-y-4 mb-6">
                              <div className="flex items-center justify-between text-gray-300"><span>Subtotal</span><span className="font-semibold">${subtotal.toFixed(2)}</span></div>
                              <div className="flex items-center justify-between text-gray-300"><span>IVA (16%)</span><span className="font-semibold">${tax.toFixed(2)}</span></div>
                              <div className="flex items-center justify-between text-gray-300"><span>Envío</span><span className="font-semibold">${shipping.toFixed(2)}</span></div>
                              <div className="border-t border-gray-700 pt-4">
                                <div className="flex items-center justify-between"><span className="text-xl text-gray-300">Total</span><span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">${total.toFixed(2)}</span></div>
                              </div>
                          </div>
                          {!showCheckout ? (
                              <button onClick={handleCheckout} className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                                {isAuthenticated ? 'Proceder al Pago' : 'Iniciar Sesión para Pagar'}
                                {isAuthenticated ? <ChevronRight className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                              </button>
                          ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
      <OrderSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} orderNumber={orderInfo.orderNumber} orderTotal={orderInfo.total} />
    </>
  );
}
