// src/components/OrderSuccessModal.jsx - TEMA OSCURO
import React from 'react';
import { CheckCircle, ShoppingBag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const OrderSuccessModal = ({ isOpen, onClose, orderNumber, orderTotal }) => {
  
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleContinueShopping = () => {
    onClose();
    window.location.href = '/products/'; // Redirige a tu catálogo
  };

  const handleViewOrder = () => {
    onClose();
    navigate(`/orders/${orderNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-80 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all border border-indigo-500/30">
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>

          {/* Contenido */}
          <div className="text-center">
            {/* Ícono de éxito con animación */}
            <div className="mx-auto mb-6 w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-bounce border border-green-500/50">
              <CheckCircle className="text-green-400" size={48} />
            </div>

            {/* Título */}
            <h2 className="text-3xl font-bold text-white mb-2">
              ¡Compra Exitosa!
            </h2>
            
            <p className="text-gray-400 mb-6">
              Tu pedido ha sido procesado correctamente
            </p>

            {/* Información del pedido */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">
                    Número de Orden
                  </p>
                  <p className="text-2xl font-bold text-white font-mono">
                    #{orderNumber}
                  </p>
                </div>
                
                <div className="border-t border-gray-700 pt-3">
                  <p className="text-sm text-gray-400">Total Pagado</p>
                  <p className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    ${orderTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                <p className="text-sm text-indigo-300">
                  📧 Recibirás un email de confirmación con los detalles de tu pedido
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={handleContinueShopping}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingBag size={20} />
                Seguir Comprando
              </button>

              <button
                onClick={handleViewOrder}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all border border-gray-600"
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
