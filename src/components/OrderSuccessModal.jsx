// src/components/OrderSuccessModal.jsx
import React from 'react';
import { CheckCircle, ShoppingBag, X } from 'lucide-react';

const OrderSuccessModal = ({ isOpen, onClose, orderNumber, orderTotal }) => {
  if (!isOpen) return null;

  const handleContinueShopping = () => {
    onClose();
    window.location.href = '/products'; // O la ruta de tu catálogo
  };

  const handleViewOrder = () => {
    onClose();
    window.location.href = `/orders/${orderNumber}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>

          {/* Contenido */}
          <div className="text-center">
            {/* Ícono de éxito con animación */}
            <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="text-green-600" size={48} />
            </div>

            {/* Título */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Compra Exitosa!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Tu pedido ha sido procesado correctamente
            </p>

            {/* Información del pedido */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">
                    Número de Orden
                  </p>
                  <p className="text-2xl font-bold text-gray-900 font-mono">
                    #{orderNumber}
                  </p>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-500">Total Pagado</p>
                  <p className="text-xl font-bold text-green-600">
                    ${orderTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  📧 Recibirás un email de confirmación con los detalles de tu pedido
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={handleContinueShopping}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingBag size={20} />
                Seguir Comprando
              </button>

              <button
                onClick={handleViewOrder}
                className="w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition border-2 border-blue-600"
              >
                Ver Detalles del Pedido
              </button>
            </div>

            {/* Mensaje adicional */}
            <p className="mt-6 text-xs text-gray-500">
              ¿Necesitas ayuda? Contáctanos al 261-207-7095
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;