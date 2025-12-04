import React from 'react';
import { User, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Stats de ejemplo
  const stats = [
    {
      title: 'Pedidos Totales',
      value: '12',
      icon: ShoppingBag,
      color: 'from-indigo-500 to-violet-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30'
    },
    {
      title: 'Productos Favoritos',
      value: '8',
      icon: Package,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30'
    },
    {
      title: 'Total Gastado',
      value: '$2,450',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    }
  ];

  return (
    <>
      <Navigation cartCount={cartCount} />
      
      <div className="min-h-screen bg-black pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Bienvenido, <span className="bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                {user.name || 'Usuario'}
              </span>
            </h1>
            <p className="text-gray-400">
              Gestiona tu cuenta y revisa tus pedidos
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-6 animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">
                  {stat.title}
                </div>
              </div>
            ))}
          </div>

          {/* User Info */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-6">
                  Información Personal
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <User className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="text-xs text-gray-400">Nombre</div>
                      <div className="text-white font-semibold">
                        {user.name} {user.lastname}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <div className="text-indigo-400">📧</div>
                    <div>
                      <div className="text-xs text-gray-400">Email</div>
                      <div className="text-white font-semibold">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <div className="text-indigo-400">📱</div>
                    <div>
                      <div className="text-xs text-gray-400">Teléfono</div>
                      <div className="text-white font-semibold">
                        {user.telephone || 'No registrado'}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  Editar Perfil
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-6">
                  Pedidos Recientes
                </h2>
                <div className="space-y-4">
                  {/* Ejemplo de pedido */}
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-semibold">
                          Pedido #12345
                        </div>
                        <div className="text-sm text-gray-400">
                          15 Nov 2025
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">
                        Entregado
                      </div>
                    </div>
                    <div className="text-gray-300">
                      3 productos - Total: $599.99
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-semibold">
                          Pedido #12344
                        </div>
                        <div className="text-sm text-gray-400">
                          10 Nov 2025
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm">
                        En tránsito
                      </div>
                    </div>
                    <div className="text-gray-300">
                      1 producto - Total: $199.99
                    </div>
                  </div>

                  <div className="text-center py-8 text-gray-500">
                    Integra con tu API de pedidos para mostrar datos reales
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}