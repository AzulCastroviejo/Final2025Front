import React, { useEffect, useState } from 'react';
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

  const subtotal = order.order_details?.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  ) || 0;

  const iva = subtotal * 0.16;

  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-black pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <ChevronLeft className="text-white" />
            </Link>

            <h1 className="text-3xl font-bold text-white">
              Pedido #{order.id_key}
            </h1>
          </div>

          {/* Info */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">
                Estado
              </h2>
              <p className="text-indigo-400 font-semibold capitalize">
                {order.status}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">
                Entrega
              </h2>
              <p className="text-gray-300">
                {order.delivery_method}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {new Date(order.date).toLocaleDateString('es-AR')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">
                Total
              </h2>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                ${order.total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Package /> Productos
            </h2>

            {order.order_details?.length > 0 ? (
                <div className="space-y-4">
                    {order.order_details.map(item => {
                    const product = productMap[item.product_id];

                    return (
                        <div
                        key={item.id_key}
                        className="flex gap-4 items-center bg-gray-800 rounded-xl p-4 border border-gray-700"
                        >
                        <img
                            src={
                            product?.image ||
                            `https://via.placeholder.com/120x120/1f2937/6366f1?text=${encodeURIComponent(product?.name || 'Producto')}`
                            }
                            alt={product?.name}
                            className="w-20 h-20 rounded-lg object-cover"
                        />

                        <div className="flex-1">
                            <p className="text-white font-semibold">
                            {product?.name || 'Producto'}
                            </p>
                            <p className="text-gray-400 text-sm">
                            Cantidad: {item.quantity}
                            </p>
                            <p className="text-gray-500 text-sm">
                            Precio unitario: ${item.price}
                            </p>
                        </div>

                        <p className="text-indigo-400 font-bold text-lg">
                            ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        </div>
                    );
                    })}
                </div>
                ) : (
                <p className="text-gray-400">
                    No se encontraron productos para este pedido.
                </p>
                )}
          </div>

          {/* Resumen */}
          <div className="max-w-md ml-auto bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Resumen
            </h3>

            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%)</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between font-semibold text-white">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
