import React, { useState, useEffect, useCallback } from 'react';
import { styles } from './styles.js';
import { API_BASE_URL } from './config.js';

const ProductList = ({ setCurrentPage, setEditingProduct }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/listproducts`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/deleteproduct/${productId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                if (!response.ok) throw new Error('Failed to delete product');
                fetchProducts(); // Refresh the list
                alert('Product deleted successfully!');
            } catch (err) {
                alert('Error deleting product: ' + err.message);
            }
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setCurrentPage('editProduct');
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (loading) return <div style={styles.pageContent}>Loading...</div>;
    if (error) return <div style={styles.pageContent}>Error: {error}</div>;

    return (
        <div style={styles.pageContent}>
            <h2 style={styles.pageContentH2}>Product Overview</h2>

            <div style={styles.buttonGroup}>
                <button onClick={() => setCurrentPage('addProduct')} style={styles.button}>
                    Add Product
                </button>
                <button onClick={() => setCurrentPage('home')} style={styles.buttonSecondary}>
                    Back to Home
                </button>
            </div>

            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <strong>My Products</strong>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Description</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                                No products found. Click "Add Product" to create your first product!
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product._id}>
                                <td style={styles.td}>{product._id}</td>
                                <td style={styles.td}>{product.name}</td>
                                <td style={styles.td}>{product.description}</td>
                                <td style={styles.td}>${product.price}</td>
                                <td style={styles.td}>
                                    <button onClick={() => handleEdit(product)} style={styles.buttonSuccess}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(product._id)} style={styles.buttonDanger}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;