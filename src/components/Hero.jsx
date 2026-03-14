import React from 'react';
import { Link } from 'react-router-dom';
const productHero = 'https://obsvdzlsbbqmhpsxksnd.supabase.co/storage/v1/object/public/assets/product_hero.png';

const Hero = () => {
    return (
        <section className="hero botanical-bg" style={{
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            padding: '4rem 0',
            position: 'relative'
        }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                alignItems: 'center'
            }}>
                <div className="hero-content salmon-box" style={{
                    boxShadow: '30px 30px 60px rgba(0,0,0,0.1)',
                    zIndex: 10
                }}>
                    <span className="font-serif" style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.75rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }}>
                        Sabana de Bogotá • Colombia
                    </span>
                    <h1 className="hero-text" style={{ margin: '1.5rem 0', fontSize: '5rem', color: '#fff', lineHeight: '1' }}>
                        Zeticas
                    </h1>
                    <p style={{ maxWidth: '400px', marginBottom: '3rem', color: '#fff', fontSize: '1.2rem', fontWeight: '300', lineHeight: '1.6' }}>
                        Conservas premium y consultoría con propósito. Redescubriendo el valor de nuestra tierra y sus productores.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Link to="/tienda" className="btn" style={{ background: '#fff', color: 'var(--color-primary)', padding: '0.8rem 1.5rem', fontWeight: 'bold', textDecoration: 'none', borderRadius: '8px', fontSize: '0.9rem' }}>Nuestra Tienda</Link>
                        <Link to="/consultoria" className="btn" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #fff', color: '#fff', padding: '0.8rem 1.5rem', fontWeight: 'bold', textDecoration: 'none', borderRadius: '8px', fontSize: '0.9rem' }}>Consultoría</Link>
                        <Link to="/recurrentes" className="btn" style={{ background: '#D6BD98', color: '#1A3636', padding: '0.8rem 1.5rem', fontWeight: 'bold', textDecoration: 'none', borderRadius: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontSize: '0.9rem' }}>Clientes Recurrentes</Link>
                    </div>
                    <Link to="/nosotros" className="btn" style={{ borderBottom: '1px solid #fff', padding: '1rem 0', color: '#fff', borderRadius: 0, textDecoration: 'none', fontSize: '0.8rem', display: 'inline-block', marginTop: '1.5rem', opacity: 0.8 }}>Nuestra Historia</Link>
                </div>
                <div className="hero-image" style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                }}>
                    <img
                        src="https://obsvdzlsbbqmhpsxksnd.supabase.co/storage/v1/object/public/products/display2.png"
                        alt="Zeticas Trio: Silvia, Toscana, Fresa"
                        style={{
                            width: '80%',
                            height: 'auto',
                            display: 'block',
                            objectFit: 'contain',
                            mixBlendMode: 'multiply',
                            clipPath: 'inset(2% 2% 2% 2%)',
                            transform: 'scale(1.1)',
                            filter: 'drop-shadow(15px 15px 30px rgba(0,0,0,0.1))'
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;
