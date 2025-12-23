import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import api from '../api';

const DISPLAY_LIMIT = 10; // Límite de items a mostrar por defecto
const ORDER_STATUSES = ['PENDING', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED']; // Estados de la orden

export default function Dashboard() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // --- ESTADOS ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  // Estado para el formulario de producto
  const [productForm, setProductForm] = useState({
    name: '', price: '', stock: '', description: '', image: '', category_id: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estado para expandir detalles y listas
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllBills, setShowAllBills] = useState(false);

  // --- EFECTOS (CARGA DE DATOS) ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    api.get('/products').then(res => setProducts(res.data));
    api.get('/categories').then(res => setCategories(res.data));
    api.get('/orders').then(res => setOrders(res.data.sort((a, b) => b.id_key - a.id_key))); // Ordenar por ID descendente
    api.get('/bills').then(res => setBills(res.data.sort((a, b) => b.id_key - a.id_key))); // Ordenar por ID descendente
  };

  // --- MANEJADORES DE EVENTOS (PRODUCTOS) ---
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      category_id: Number(productForm.category_id)
    };

    try {
      if (isEditing) {
        await api.put(`/products/${editingId}`, payload);
        alert('Producto actualizado con éxito');
      } else {
        await api.post('/products', payload);
        alert('Producto creado con éxito');
      }
      resetProductForm();
      fetchData();
    } catch (err) {
      console.error(err);
      alert(`Error al ${isEditing ? 'actualizar' : 'crear'} el producto`);
    }
  };

  const handleEditProduct = (product) => {
    setIsEditing(true);
    setEditingId(product.id_key);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
      image: product.image || '',
      category_id: product.category_id
    });
    window.scrollTo(0, 0);
  };
  
  const resetProductForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setProductForm({
      name: '', price: '', stock: '', description: '', image: '', category_id: ''
    });
  };

  // --- MANEJADORES DE EVENTOS (ÓRDENES) ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      // Actualizamos el estado localmente para reflejar el cambio inmediatamente
      setOrders(prevOrders => prevOrders.map(order => 
        order.id_key === orderId ? { ...order, status: newStatus } : order
      ));
      alert(`El estado de la orden #${orderId} ha sido actualizado a ${newStatus}.`);
    } catch (error) {
      console.error('Error al actualizar el estado de la orden:', error);
      alert('Hubo un error al actualizar el estado de la orden.');
      // Opcional: revertir el cambio si la API falla
      fetchData(); 
    }
  };

  // --- MANEJADORES DE EVENTOS (CATEGORÍAS) ---
  async function handleCreateCategory(e) {
    e.preventDefault();
    try {
      const res = await api.post('/categories', newCategory);
      alert('Categoría creada');
      setCategories([...categories, res.data]);
      setNewCategory({ name: '', description: '' });
    } catch (err) {
      console.error(err);
      alert('Error al crear categoría');
    }
  }
  
  // --- VISTA ---
  return (
    <>
      <Navigation cartCount={cartCount} />
      <div className="min-h-screen bg-black pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-white">
        <h1 className="text-3xl font-bold mb-8">Dashboard de Administración</h1>

        {/* --- FORMULARIO DE PRODUCTOS --- */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl mb-4">{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            {/* ... (código del formulario de producto sin cambios) ... */}
          </form>
        </div>
        
        {/* --- TABLA DE PRODUCTOS --- */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8 overflow-x-auto">
            <h2 className="text-2xl mb-4">Lista de Productos</h2>
            <table className="w-full text-left">
              {/* ... (código de la tabla de productos sin cambios) ... */}
            </table>
        </div>

        {/* --- TABLA DE ÓRDENES --- */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl">Órdenes Recientes</h2>
            {orders.length > DISPLAY_LIMIT && (
              <button onClick={() => setShowAllOrders(!showAllOrders)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-bold">
                {showAllOrders ? 'Mostrar menos' : `Ver todas (${orders.length})`}
              </button>
            )}
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-2">ID</th><th className="p-2">Cliente</th><th className="p-2">Email</th><th className="p-2">Total</th><th className="p-2">Estado</th><th className="p-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {(showAllOrders ? orders : orders.slice(0, DISPLAY_LIMIT)).map(order => (
                <React.Fragment key={order.id_key}>
                  <tr className="border-b border-gray-600">
                    <td className="p-2">{order.id_key}</td>
                    <td className="p-2">{order.client?.name || 'N/A'} {order.client?.lastname || ''}</td>
                    <td className="p-2">{order.client?.email || 'N/A'}</td>
                    <td className="p-2">${order.total?.toFixed(2)}</td>
                    <td className="p-2">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id_key, e.target.value)}
                        className="p-1 rounded bg-gray-700 border border-gray-600 text-white"
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <button onClick={() => setExpandedOrderId(expandedOrderId === order.id_key ? null : order.id_key)} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm">
                        {expandedOrderId === order.id_key ? 'Ocultar' : 'Ver Detalles'}
                      </button>
                    </td>
                  </tr>
                  {expandedOrderId === order.id_key && (
                    <tr className="bg-gray-700">
                      <td colSpan="6" className="p-4">
                        <h4 className="font-bold mb-2">Detalles del Pedido:</h4>
                        {order.order_details && order.order_details.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {order.order_details.map(detail => (
                              <li key={detail.id_key}>
                                {detail.quantity}x {detail.product?.name || 'Producto no disponible'} - ${detail.price?.toFixed(2)} c/u
                              </li>
                            ))}
                          </ul>
                        ) : <p>No hay detalles para esta orden.</p>}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- TABLA DE FACTURAS --- */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8 overflow-x-auto">
          {/* ... (código de la tabla de facturas sin cambios) ... */}
        </div>

        {/* --- FORMULARIO CREAR CATEGORÍA --- */}
        <div className="bg-gray-800 p-6 rounded-lg">
          {/* ... (código del formulario de categoría sin cambios) ... */}
        </div>

      </div>
    </>
  );
}
