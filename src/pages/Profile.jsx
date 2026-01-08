import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        setUser(userData);
      } else {
        // Si no hay datos de usuario, redirigir al login
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al cargar o procesar datos del usuario:', error);
      // Si hay cualquier error (ej. JSON mal formado), tratar como si no estuviera logueado
      navigate('/login');
    } finally {
        setLoading(false); // Finalizar la carga después de la comprobación
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };
  
  // Muestra un mensaje de carga mientras se verifican los datos del usuario
  if (loading) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            Cargando...
        </div>
    );
  }
  
  // Si después de cargar no hay usuario, no renderizar nada más (ya se ha redirigido)
  if (!user) {
      return null;
  }

  // Acceder a las propiedades del usuario de forma segura
  const displayName = user?.name || user?.user?.name || 'Usuario Desconocido';
  const displayEmail = user?.email || user?.user?.email;

  // Si, por alguna razón, el email sigue sin estar disponible, muestra un error
  if (!displayEmail) {
      console.error("Objeto de usuario encontrado pero falta el email:", user);
      return (
          <div className="min-h-screen bg-black flex items-center justify-center text-white">
              Error: No se pudo encontrar el correo electrónico en los datos del perfil.
          </div>
      )
  }

  return (
    <>
      {/* El error podría estar en Navigation si intenta acceder al usuario sin verificar */}
      <Navigation />
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8 shadow-lg">
            
            <div className="text-center mb-8">
                <div className="inline-block p-4 bg-indigo-500/10 rounded-full mb-4">
                    <User className="w-16 h-16 text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold">Mi Perfil</h1>
                <p className="text-gray-400">Gestiona tu información personal.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gray-800/50 rounded-lg">
                <User className="w-6 h-6 mr-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Nombre</p>
                  <p className="text-lg font-semibold">{displayName}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-800/50 rounded-lg">
                <Mail className="w-6 h-6 mr-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Correo Electrónico</p>
                  <p className="text-lg font-semibold">{displayEmail}</p>
                </div>
              </div>
             <h2 className="text-2xl font-semibold text-white mb-4">Mis Órdenes</h2>

                    {loading ? (
                        <p className="text-gray-400">Cargando órdenes...</p>
                    ) : orders.length === 0 ? (
                        <p className="text-gray-400">No tenés órdenes aún.</p>
                    ) : (
                        <div className="space-y-4">
                        {orders.map(order => (
                            <div
                            key={order.id_key}
                            onClick={() => navigate(`/orders/${order.id_key}`)}
                            className="cursor-pointer bg-gray-900 border border-gray-700 rounded-xl p-5 hover:bg-gray-800 transition"
                            >
                            <div className="flex justify-between items-center">
                                <div>
                                <p className="text-white font-semibold">
                                    Orden #{order.id_key}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {new Date(order.date).toLocaleDateString()}
                                </p>
                                </div>

                                <div className="text-right">
                                <p className="text-indigo-400 font-bold">
                                    ${order.total}
                                </p>
                                <p className="text-sm text-gray-400 capitalize">
                                    {order.status}
                                </p>
                                </div>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}








            </div>

            <div className="mt-10 text-center">
                <button 
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/20"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}