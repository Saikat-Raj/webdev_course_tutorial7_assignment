import React, { useState, useEffect } from 'react';
import { styles } from './styles.js';
import { API_BASE_URL } from './config.js';
import Navigation from './Navigation.js';
import HomePage from './HomePage.js';
import AboutUsPage from './AboutUsPage.js';
import ProductForm from './ProductForm.js';
import ProductList from './ProductList.js';
import RegistrationForm from './RegistrationForm.js';
import Login from './Login.js';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [editingProduct, setEditingProduct] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
  };

  const requireAuth = (callback) => {
    if (!user) {
      setCurrentPage('login');
      return;
    }
    callback();
  };

  const handleExploreProducts = () => {
    requireAuth(() => setCurrentPage('listProducts'));
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleAddProduct = async (productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/addproduct`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      if (!response.ok) throw new Error('Failed to add product');

      alert('Product added successfully!');
      setCurrentPage('listProducts');
    } catch (err) {
      alert('Error adding product: ' + err.message);
    }
  };

  const handleEditProduct = async (productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/editproduct/${editingProduct._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      if (!response.ok) throw new Error('Failed to update product');

      alert('Product updated successfully!');
      setCurrentPage('listProducts');
      setEditingProduct(null);
    } catch (err) {
      alert('Error updating product: ' + err.message);
    }
  };

  const renderCurrentPage = () => {
    if (!user && (currentPage === 'addProduct' || currentPage === 'listProducts' || currentPage === 'editProduct')) {
      setCurrentPage('login');
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onExploreProducts={handleExploreProducts} />;
      case 'aboutUs':
        return <AboutUsPage />;
      case 'addProduct':
        if (!user) return renderLogin();
        return (
          <ProductForm
            onSubmit={handleAddProduct}
            onCancel={() => setCurrentPage('home')}
            onListProducts={() => setCurrentPage('listProducts')}
          />
        );
      case 'editProduct':
        if (!user) return renderLogin();
        return (
          <ProductForm
            product={editingProduct}
            onSubmit={handleEditProduct}
            onCancel={() => {
              setCurrentPage('listProducts');
              setEditingProduct(null);
            }}
            onListProducts={() => setCurrentPage('listProducts')}
            isEditing={true}
          />
        );
      case 'listProducts':
        if (!user) return renderLogin();
        return (
          <ProductList
            setCurrentPage={setCurrentPage}
            setEditingProduct={setEditingProduct}
          />
        );
      case 'register':
        return <RegistrationForm />;
      case 'login':
        return renderLogin();
      default:
        return <HomePage onExploreProducts={handleExploreProducts} />;
    }
  };

  const renderLogin = () => {
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setCurrentPage('register')}
      />
    );
  };

  return (
    <div style={styles.appContainer}>
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
        requireAuth={requireAuth}
      />

      <main style={styles.mainContent}>
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default App;