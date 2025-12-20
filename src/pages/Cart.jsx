// src/pages/Cart.jsx - VERSIÓN CON MODAL DE CONFIRMACIÓN
import React, { useState, useEffect } from 'react';
import OrderSuccessModal from '../components/OrderSuccessModal';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [clientData, setClientData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    shipping_address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryMethod, setDeliveryMethod] = useState(3); // 1=DRIVE_THRU, 2=ON_HAND, 3=HOME_DELIVERY
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para el modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderInfo, setOrderInfo] = useState({
    orderNumber: null,
    total: 0
  });

  // URL del backend - CAMBIA ESTO POR TU URL DE RENDER
  const API_URL = 'https://final2025python-main.render.com';

  // Cargar carrito del localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  // Calcular totales
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.16; // 16% de impuestos
  const shipping_cost = deliveryMethod === 3 ? 0 : 0; // Envío gratis por ahora
  const total = subtotal + tax + shipping_cost;

  // Generar número de orden aleatorio
  const generateOrderNumber = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Construir el objeto de la orden según el schema del backend
    const orderData = {
      client_name: clientData.client_name,
      client_email: clientData.client_email,
      client_phone: clientData.client_phone,
      shipping_address: clientData.shipping_address,
      payment_method: paymentMethod,
      delivery_method: deliveryMethod,
      items: cart.map(item => ({
        product_id: item.id_key || item.product_id,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: subtotal,
      tax: tax,
      shipping_cost: shipping_cost,
      total: total,
      status: 'pending'
    };

    console.log('📦 Enviando orden:', orderData);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.detail || 'Error al crear la orden');
      }

      const result = await response.json();
      console.log('✅ Orden creada exitosamente:', result);
      
      // Configurar información para el modal
      setOrderInfo({
        orderNumber: result.id_key || generateOrderNumber(),
        total: total
      });

      // Limpiar carrito
      localStorage.removeItem('cart');
      setCart([]);
      
      // Mostrar modal de éxito
      setShowSuccessModal(true);

    } catch (error) {
      console.error('❌ Error:', error);
      alert(`Hubo un error al procesar tu orden: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">🛒 Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Productos</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">Tu carrito está vacío</p>
                <button
                  onClick={() => window.location.href = '/products'}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Ir a Productos
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600">${item.price.toLocaleString('es-AR')}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Controles de cantidad */}
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-x">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal del producto */}
                      <p className="font-bold w-24 text-right">
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </p>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulario de checkout */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Datos de Envío</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Nombre completo *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={clientData.client_name}
                  onChange={(e) => setClientData({...clientData, client_name: e.target.value})}
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={clientData.client_email}
                  onChange={(e) => setClientData({...clientData, client_email: e.target.value})}
                  placeholder="juan@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Teléfono *</label>
                <input
                  type="tel"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={clientData.client_phone}
                  onChange={(e) => setClientData({...clientData, client_phone: e.target.value})}
                  placeholder="2612077095"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Dirección de envío *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={clientData.shipping_address}
                  onChange={(e) => setClientData({...clientData, shipping_address: e.target.value})}
                  placeholder="Calle Falsa 123"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Método de entrega</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(Number(e.target.value))}
                >
                  <option value={1}>🚗 Drive-thru (Retiro en auto)</option>
                  <option value={2}>🏪 Retiro en tienda</option>
                  <option value={3}>🚚 Envío a domicilio</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Método de pago</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="card">💳 Tarjeta</option>
                  <option value="cash">💵 Efectivo</option>
                </select>
              </div>
            </div>

            {/* Resumen de la orden */}
            <div className="border-t pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Impuestos (16%):</span>
                <span>${tax.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío:</span>
                <span>${shipping_cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-2 border-t">
                <span>Total:</span>
                <span className="text-green-600">${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={cart.length === 0 || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                '🎉 Finalizar Compra'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Tu información está segura y protegida
            </p>
          </form>
        </div>
      </div>

      {/* Modal de éxito */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderNumber={orderInfo.orderNumber}
        orderTotal={orderInfo.total}
      />
    </div>
  );
};

export default Cart;
