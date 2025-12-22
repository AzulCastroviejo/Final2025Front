import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api'; // Importar la instancia de API configurada

const OrderDetails = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                // Usar la instancia 'api' para llamar al backend
                const response = await api.get(`/orders/${orderId}`);
                
                // Con axios (api), los datos están en response.data
                setOrder(response.data);

            } catch (err) {
                console.error("Error fetching order details:", err);
                if (err.response && err.response.status === 404) {
                    setError('El pedido no fue encontrado.');
                } else {
                    setError('Ocurrió un error al cargar el pedido.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>;
    }

    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                <h1>Error</h1>
                <p>{error}</p>
                <Link to="/" style={{ marginTop: '20px', display: 'inline-block' }}>Volver al Inicio</Link>
            </div>
        );
    }

    if (!order) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>No se encontró el pedido.</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Detalles del Pedido</h1>
            <p><strong>ID del Pedido:</strong> {order.id_key}</p>
            <p><strong>Fecha:</strong> {new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
            <p><strong>Estado:</strong> {order.status}</p>
            <p><strong>Método de Entrega:</strong> {order.delivery_method}</p>

            <h2 style={{ marginTop: '30px' }}>Productos</h2>
            {order.order_details && order.order_details.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Producto</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Cantidad</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.order_details.map(detail => (
                            <tr key={detail.id_key}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{detail.product?.name || 'Nombre no disponible'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{detail.quantity}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>${detail.price.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No se encontraron detalles de productos para este pedido.</p>
            )}

            <Link to="/products" style={{ marginTop: '20px', display: 'inline-block' }}>Seguir Comprando</Link>
        </div>
    );
};

export default OrderDetails;
