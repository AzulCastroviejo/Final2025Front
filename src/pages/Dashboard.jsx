import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import api from '../api';

export default function Dashboard() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // --- ESTADOS ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  // Estado para el formulario de producto (crear y editar)
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    image: '',
    category_id: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estado para expandir detalles de la orden
  const [expandedOrderId, setExpandedOrderId] = useState(null);


  // --- EFECTOS (CARGA DE DATOS) ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    // Se asume que los endpoints pueden devolver datos detallados
    // para clientes y detalles de orden/factura.
    api.get('/products').then(res => setProducts(res.data));
    api.get('/categories').then(res => setCategories(res.data));
    api.get('/orders').then(res => setOrders(res.data)); // Idealmente: /orders?include=client,details
    api.get('/bills').then(res => setBills(res.data));   // Idealmente: /bills?include=client
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
        // Actualizar producto
        await api.put(`/products/${editingId}`, payload);
        alert('Producto actualizado con éxito');
      } else {
        // Crear producto
        await api.post('/products', payload);
        alert('Producto creado con éxito');
      }
      resetProductForm();
      fetchData(); // Recargar todos los datos
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
    window.scrollTo(0, 0); // Scroll al principio de la página
  };
  
  const resetProductForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setProductForm({
      name: '', price: '', stock: '', description: '', image: '', category_id: ''
    });
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

        {/* --- FORMULARIO DE PRODUCTOS (CREAR/EDITAR) --- */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl mb-4">{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required name="name" type="text" placeholder="Nombre del Producto" value={productForm.name} onChange={handleProductFormChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600"/>
              <input required name="price" type="number" placeholder="Precio" value={productForm.price} onChange={handleProductFormChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600"/>
              <input required name="stock" type="number" placeholder="Stock" value={productForm.stock} onChange={handleProductFormChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600"/>
              <select required name="category_id" value={productForm.category_id} onChange={handleProductFormChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600">
                <option value="">Seleccionar Categoría</option>
                {categories.map(cat => <option key={cat.id_key} value={cat.id_key}>{cat.name}</option>)}
              </select>
            </div>
            <textarea name="description" placeholder="Descripción" value={productForm.description} onChange={handleProductFormChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
            <input name="image" type="text" placeholder="URL de la Imagen" value={productForm.image} onChange={handleProductFormChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
            <div className="flex gap-4">
              <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-bold">
                {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetProductForm} className="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded font-bold">
                  Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* --- TABLA DE PRODUCTOS --- */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8 overflow-x-auto">
            <h2 className="text-2xl mb-4">Lista de Productos</h2>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-700">
                        <th className="p-2">Nombre</th>
                        <th className="p-2">Precio</th>
                        <th className="p-2">Stock</th>
                        <th className="p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id_key} className="border-b border-gray-600">
                            <td className="p-2">{product.name}</td>
                            <td className="p-2">${product.price.toFixed(2)}</td>
                            <td className="p-2">{product.stock}</td>
                            <td className="p-2">
                                <button onClick={() => handleEditProduct(product)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">Editar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* --- TABLA DE ÓRDENES --- */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8 overflow-x-auto">
          <h2 className="text-2xl mb-4">Órdenes Recientes</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-2">ID</th>
                <th className="p-2">Cliente</th>
                <th className="p-2">Email</th>
                <th className="p-2">Total</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <React.Fragment key={order.id_key}>
                  <tr className="border-b border-gray-600">
                    <td className="p-2">{order.id_key}</td>
                    <td className="p-2">{order.client?.name || 'N/A'} {order.client?.lastname || ''}</td>
                    <td className="p-2">{order.client?.email || 'N/A'}</td>
                    <td className="p-2">${order.total?.toFixed(2)}</td>
                    <td className="p-2">{order.status}</td>
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
          <h2 className="text-2xl mb-4">Facturas</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-2">ID</th>
                <th className="p-2">Nº Factura</th>
                <th className="p-2">Cliente</th>
                <th className="p-2">Monto</th>
                <th className="p-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id_key} className="border-b border-gray-600">
                  <td className="p-2">{bill.id_key}</td>
                  <td className="p-2">{bill.bill_number}</td>
                  <td className="p-2">{bill.client?.name || 'N/A'} {bill.client?.lastname || ''}</td>
                  <td className="p-2">${bill.total?.toFixed(2)}</td>
                  <td className="p-2">{new Date(bill.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- FORMULARIO CREAR CATEGORÍA (EXISTENTE) --- */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Crear Nueva Categoría</h2>
          <form onSubmit={handleCreateCategory} className="flex items-center gap-4">
            <input type="text" placeholder="Nombre" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} className="p-2 rounded bg-gray-700 flex-grow" />
            <input type="text" placeholder="Descripción" value={newCategory.description} onChange={e => setNewCategory({ ...newCategory, description: e.target.value })} className="p-2 rounded bg-gray-700 flex-grow" />
            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">Crear Categoría</button>
          </form>
        </div>

      </div>
    </>
  );
}
