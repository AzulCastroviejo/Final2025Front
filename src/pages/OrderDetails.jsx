import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderDetails = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setOrder(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!order) {
        return <div>No order found.</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Order Details</h1>
            <p><strong>Order ID:</strong> {order.id_key}</p>
            <p><strong>Order Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Delivery Method:</strong> {order.delivery_method}</p>

            <h2>Products</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Product</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Quantity</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {order.order_details && order.order_details.map(detail => (
                        <tr key={detail.id_key}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{detail.product.name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{detail.quantity}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>${detail.price.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Link to="/" style={{ marginTop: '20px', display: 'inline-block' }}>Back to Home</Link>
        </div>
    );
};

export default OrderDetails;
