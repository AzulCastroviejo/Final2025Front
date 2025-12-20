import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import api from '../api';

export default function Dashboard() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Estados
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    image: '',
    category_id: ''
  });
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);

  // Cargar categorías, órdenes y facturas
  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));
    api.get('/orders').then(res => setOrders(res.data));
    api.get('/bills').then(res => setBills(res.data));
  }, []);

  // Crear categoría
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

  // Crear producto
  async function handleCreateProduct(e) {
    e.preventDefault();
    try {
      const payload = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock)
      };
      const res = await api.post('/products', payload);
      alert('Producto creado');
      setNewProduct({
        name: '',
        price: '',
        stock: '',
        description: '',
        image: '',
        category_id: ''
      });
    } catch (err) {
      console.error(err);
      alert('Error al crear producto');
    }
  }

  return (
    <>
      <Navigation cartCount={cartCount} />
      <div className="min-h-screen bg-black pt-20 pb-12 px-6">
        <h1 className="text-3xl text-white mb-6">Dashboard</h1>

        {/* Formulario Categoría */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl text-white mb-4">Crear Categoría</h2>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre"
              value={newCategory.name}
              onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full p-2 rounded"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={newCategory.description}
              onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
              className="w-full p-2 rounded"
            />
            <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded">
              Crear Categoría
            </button>
          </form>
        </div>

        {/* Formulario Producto */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl text-white mb-4">Crear Producto</h2>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <input type="text" placeholder="Nombre" value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full p-2 rounded" />
            <input type="number" placeholder="Precio" value={newProduct.price}
              onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full p-2 rounded" />
            <input type="number" placeholder="Stock" value={newProduct.stock}
              onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} className="w-full p-2 rounded" />
            <textarea placeholder="Descripción" value={newProduct.description}
              onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full p-2 rounded" />
            <input type="text" placeholder="URL Imagen" value={newProduct.image}
              onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} className="w-full p-2 rounded" />
            <select value={newProduct.category_id}
              onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}
              className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-indigo-500">
              <option value="">Seleccionar Categoría</option>
              {categories.map(cat => (
                <option key={cat.id_key} value={cat.id_key}>{cat.name}</option>
              ))}
            </select>
            <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded">
              Crear Producto
            </button>
          </form>
        </div>

        {/* Tabla Orders */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl text-white mb-4">Órdenes</h2>
          <table className="w-full text-white">
            <thead>
              <tr>
                <th>ID</th><th>Cliente</th><th>Total</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.client_name}</td>
                  <td>${order.total}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabla Bills */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl text-white mb-4">Facturas</h2>
          <table className="w-full text-white">
            <thead>
              <tr>
                <th>ID</th><th>Orden</th><th>Monto</th><th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td>{bill.id}</td>
                  <td>{bill.order_id}</td>
                  <td>${bill.amount}</td>
                  <td>{bill.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}