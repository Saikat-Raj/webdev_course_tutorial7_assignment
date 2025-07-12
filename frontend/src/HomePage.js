import React from 'react';

const HomePage = ({ onExploreProducts }) => {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: '20px',
            textAlign: 'center'
        }}>
            <div style={{
                width: '100%'
            }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    lineHeight: '1.2'
                }}>
                    Welcome to ProdManager
                </h1>
                <p style={{
                    fontSize: '1.2rem',
                    marginBottom: '30px',
                    lineHeight: '1.6',
                    opacity: '0.9'
                }}>
                    Effortlessly manage your products with our all-in-one tool. Create, view,
                    edit, and delete products — fast, simple, and reliable.
                </p>
                <button
                    onClick={onExploreProducts}
                    style={{
                        padding: '15px 30px',
                        fontSize: '1.1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: '2px solid white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#667eea';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.color = 'white';
                    }}
                >
                    Explore Products
                </button>
            </div>
        </div>
    );
};

export default HomePage;