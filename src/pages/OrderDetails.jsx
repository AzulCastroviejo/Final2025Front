import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Package } from 'lucide-react';
import Navigation from '../components/Navigation';
import api from '../api';

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then(res => setOrder(res.data))
      .catch(() => setError('No se pudo cargar el pedido'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Cargando pedido...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-400">
        <p>{error}</p>
        <Link to="/" className="mt-4 text-indigo-400 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-black pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <ChevronLeft className="text-white" />
            </Link>

            <h1 className="text-3xl font-bold text-white">
              Detalles del Pedido #{order.id_key}
            </h1>
          </div>

          {/* Info general */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Información del Pedido
              </h2>
              <p className="text-gray-300">Estado: <span className="text-indigo-400">{order.status}</span></p>
              <p className="text-gray-300">Entrega: {order.delivery_method}</p>
              <p className="text-gray-300">
                Fecha: {new Date(order.date).toLocaleDateString('es-AR')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Pago
              </h2>
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                ${order.total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Package /> Productos Comprados
            </h2>

            {order.order_details?.length > 0 ? (
              <div className="space-y-4">
                {order.order_details.map(item => (
                  <div
                    key={item.id_key}
                    className="flex justify-between items-center bg-gray-800 rounded-lg p-4 border border-gray-700"
                  >
                    <div>
                      <p className="text-white font-semibold">
                        {item.product?.name || 'Producto'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Cantidad: {item.quantity}
                      </p>
                    </div>

                    <p className="text-indigo-400 font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">
                No se encontraron productos en este pedido.
              </p>
            )}
          </div>

        </div>
      </div>
    </>
  );
}