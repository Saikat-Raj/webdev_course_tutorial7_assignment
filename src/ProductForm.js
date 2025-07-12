import React, { useState } from 'react';
import { styles } from './styles.js';

const ProductForm = ({ product, onSubmit, onCancel, onListProducts, isEditing = false }) => {
    const [formData, setFormData] = useState({
        id: product?.id || '',
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = () => {
        if (!formData.id || !formData.name || !formData.description || !formData.price) {
            alert('Please fill in all fields');
            return;
        }
        onSubmit(formData);
    };

    return (
        <div style={styles.formContainer}>
            <h2 style={styles.pageContentH2}>
                {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>

            <div style={styles.buttonGroup}>
                <button onClick={onCancel} style={styles.buttonSecondary}>
                    Cancel
                </button>
                <button onClick={onListProducts} style={styles.button}>
                    List Products
                </button>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Product ID</label>
                <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter product ID"
                    disabled={isEditing}
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Product Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter product name"
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter product description"
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Price</label>
                <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter product price"
                />
            </div>

            <div style={styles.buttonGroup}>
                <button onClick={handleSubmit} style={styles.button}>
                    {isEditing ? 'Update Product' : 'Add Product'}
                </button>
            </div>
        </div>
    );
};

export default ProductForm;