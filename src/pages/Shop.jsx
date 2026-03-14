import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { Search } from 'lucide-react';

const Shop = () => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('Todos');

    const handleAddToCart = (product) => {
        addToCart(product);
        navigate('/carrito');
    };

    const handleProductClick = (id) => {
        navigate(`/producto/${id}`);
    };

    const filteredProducts = filter === 'Todos'
        ? products
        : products.filter(p => p.categoria === filter);

    return (
        <div className="shop-page botanical-bg" style={{ minHeight: '100vh', padding: '6rem 0' }}>
            <div className="container">
                <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="font-serif" style={{ color: 'var(--color-primary)', fontSize: '4.5rem', marginBottom: '1rem' }}>Nuestra Tienda</h1>
                    <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                        Selección exclusiva de conservas artesanales premium de la Sabana de Bogotá.
                    </p>

                    {/* Filter Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
                        {['Todos', 'Dulce', 'Sal'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                style={{
                                    padding: '0.6rem 2rem',
                                    borderRadius: '2px',
                                    border: `1px solid ${filter === cat ? 'var(--color-primary)' : '#ddd'}`,
                                    background: filter === cat ? 'var(--color-primary)' : '#fff',
                                    color: filter === cat ? '#fff' : '#666',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    textTransform: 'uppercase',
                                    fontSize: '0.8rem',
                                    letterSpacing: '0.1em'
                                }}
                            >
                                {cat === 'Dulce' ? 'Zeticas Dulce' : cat === 'Sal' ? 'Zeticas Sal' : cat}
                            </button>
                        ))}
                    </div>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="product-card" style={{
                            background: '#fff',
                            padding: '1.5rem',
                            borderRadius: '4px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s ease',
                            cursor: 'default'
                        }}>
                            <div
                                onClick={() => handleProductClick(product.id)}
                                style={{
                                    overflow: 'hidden',
                                    borderRadius: '2px',
                                    marginBottom: '1.5rem',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                className="product-image-container"
                            >
                                <img
                                    src={product.imagen_url}
                                    alt={product.nombre}
                                    style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.5s ease' }}
                                />
                                <div className="magnifier-overlay" style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: 'rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease'
                                }}>
                                    <Search color="#fff" size={32} />
                                </div>
                            </div>
                            <span style={{
                                textTransform: 'uppercase',
                                fontSize: '0.7rem',
                                letterSpacing: '0.1em',
                                color: 'var(--color-sage)',
                                fontWeight: 'bold',
                                marginBottom: '0.5rem'
                            }}>
                                Zeticas: {product.categoria}
                            </span>
                            <h3
                                onClick={() => handleProductClick(product.id)}
                                className="font-serif"
                                style={{
                                    fontSize: '1.4rem',
                                    marginBottom: '0.5rem',
                                    color: 'var(--color-primary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {product.nombre}
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: '#777', marginBottom: '1.5rem', flexGrow: 1, lineHeight: '1.5' }}>
                                {product.descripcion}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                                    ${product.precio.toLocaleString('es-CO')}
                                </span>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="btn"
                                    style={{
                                        background: 'var(--color-secondary)',
                                        color: '#fff',
                                        padding: '0.6rem 1.2rem',
                                        fontSize: '0.8rem',
                                        borderRadius: '2px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Añadir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .product-image-container:hover img {
                    transform: scale(1.05);
                }
                .product-image-container:hover .magnifier-overlay {
                    opacity: 1;
                }
                .product-card:hover {
                    transform: translateY(-5px);
                }
            `}} />
        </div>
    );
};

export default Shop;
