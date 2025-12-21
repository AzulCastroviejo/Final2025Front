import { useState, useEffect } from 'react';
import { ShoppingCart, X, ChevronRight, Trash2, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import OrderSuccessModal from '../components/OrderSuccessModal';
import api from '../api';
import { Link } from "react-router-dom";

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
    client_name: '',
    client_email: '',
    client_phone: '',
    shipping_address: '',
    payment_method: 'card',
    delivery_method: 'home_delivery', // Valor por defecto
  });
  const [categories, setCategories] = useState([]);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderInfo, setOrderInfo] = useState({
    orderNumber: null,
    total: 0
  });

  const categoryMap = Object.fromEntries(
    categories.map(cat => [cat.id_key, cat.name])
  );
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categories/").then(res => setCategories(res.data));
    loadCart();
  }, []);

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
  const shipping = orderData.delivery_method === 'home_delivery' && subtotal < 1000 ? 50 : 0; // Costo de envío
  const total = subtotal + tax + shipping;

  async function handleCreateOrder(e) {
    e.preventDefault();
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    setLoading(true);

    try {
      // PASO 1: Crear o encontrar el cliente
      console.log('PASO 1: Creando cliente...');
      const nameParts = orderData.client_name.trim().split(' ');
      const clientPayload = {
        name: nameParts[0],
        lastname: nameParts.slice(1).join(' ') || nameParts[0],
        email: orderData.client_email,
        telephone: orderData.client_phone,
      };
      const clientResponse = await api.post('/clients', clientPayload);
      const clientId = clientResponse.data.id_key;
      console.log(`✅ Cliente creado con ID: ${clientId}`);

      // PASO 2: Crear la dirección (si es envío a domicilio)
      if (orderData.delivery_method === 'home_delivery') {
        console.log('PASO 2: Creando dirección...');
        const addressPayload = {
          description: orderData.shipping_address,
          client_id: clientId
        };
        await api.post('/addresses', addressPayload);
        console.log('✅ Dirección creada');
      }

      // PASO 3: Crear la factura (Bill)
      console.log('PASO 3: Creando factura...');
      const billPayload = {
        total: total,
        client_id: clientId,
      };
      const billResponse = await api.post('/bills', billPayload);
      const billId = billResponse.data.id_key;
      console.log(`✅ Factura creada con ID: ${billId}`);

      // PASO 4: Crear la orden "padre"
      console.log('PASO 4: Creando la orden...');
      const orderPayload = {
        client_id: clientId,
        bill_id: billId,
        delivery_method: orderData.delivery_method,
        status: 'PENDING'
      };
      const orderResponse = await api.post('/orders', orderPayload);
      const orderId = orderResponse.data.id_key;
      console.log(`✅ Orden creada con ID: ${orderId}`);

      // PASO 5: Crear los detalles de la orden (productos)
      console.log('PASO 5: Añadiendo productos a la orden...');
      const orderDetailPromises = cart.map(item => {
        const detailPayload = {
          order_id: orderId,
          product_id: item.id_key,
          quantity: item.quantity,
          price: item.price
        };
        return api.post('/order_details', detailPayload);
      });
      
      await Promise.all(orderDetailPromises);
      console.log('✅ Todos los productos fueron añadidos a la orden.');

      // FINALIZACIÓN EXITOSA
      setOrderInfo({
        orderNumber: orderId,
        total: total,
      });
      
      saveCart([]);
      setShowSuccessModal(true);

    } catch (err) {
      console.error('❌ Error en el proceso de creación de orden:', err);
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           'Ocurrió un error al procesar el pedido. Por favor intenta de nuevo.';
      alert(`Error: ${errorMessage}`);
    } finally {
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
            <div className="text-center py-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
              <ShoppingCart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-400 mb-6">
                Agrega productos para comenzar tu compra
              </p>
              <Link 
                to="/products/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-semibold transition-all"
              >
                Ver Productos
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                {!showCheckout ? (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 animate-fade-in">
                         {/* ... (código de item sin cambios) ... */}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Checkout Form */
                  <form onSubmit={handleCreateOrder} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Información de Contacto y Entrega
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Nombre Completo *</label>
                        <input type="text" name="client_name" value={orderData.client_name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" placeholder="Juan Pérez" />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Email *</label>
                        <input type="email" name="client_email" value={orderData.client_email} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" placeholder="juan@ejemplo.com" />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Teléfono *</label>
                        <input type="tel" name="client_phone" value={orderData.client_phone} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" placeholder="+54 9 11 1234-5678" />
                      </div>

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
                     <div className="flex items-center justify-between text-gray-300">
                      <span>Envío</span>
                      <span className="font-semibold">${shipping.toFixed(2)}</span>
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
                    <button onClick={() => setShowCheckout(true)} className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                      Proceder al Pago
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : null}

                   <p className="text-xs text-gray-500 text-center mt-4">
                    Costo de envío $50 en compras menores a $1000
                  </p>
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
