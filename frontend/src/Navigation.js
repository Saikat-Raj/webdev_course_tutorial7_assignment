import React from 'react';
import { styles } from './styles.js';

const Navigation = ({ currentPage, setCurrentPage, user, onLogout, requireAuth }) => {
    const handleNavClick = (page) => {
        if (page === 'addProduct' || page === 'listProducts') {
            requireAuth(() => setCurrentPage(page));
        } else {
            setCurrentPage(page);
        }
    };

    const getNavItems = () => {
        const baseItems = [
            { key: 'home', label: 'Home' },
            { key: 'listProducts', label: 'Products' },
            { key: 'aboutUs', label: 'Contact' }
        ];

        if (user) {
            baseItems.splice(2, 0, { key: 'addProduct', label: 'Add Product' });
            return baseItems;
        } else {
            return baseItems;
        }
    };

    return (
        <nav style={{
            ...styles.navbar,
            backgroundColor: 'white',
            borderBottom: '1px solid #ddd',
            padding: '15px 50px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#333'
            }}>
                ProdManager
            </div>
            
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                {getNavItems().map(item => (
                    <button
                        key={item.key}
                        onClick={() => handleNavClick(item.key)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            fontSize: '16px',
                            cursor: 'pointer',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            transition: 'color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.color = '#333'}
                        onMouseOut={(e) => e.target.style.color = '#666'}
                    >
                        {item.label}
                    </button>
                ))}
                
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ color: '#666' }}>
                            Welcome, {user.name} ({user.role})
                        </span>
                        <button
                            onClick={onLogout}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setCurrentPage('login')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navigation;