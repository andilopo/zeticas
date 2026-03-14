import React from 'react';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';

const CateringBanner = () => {
    return (
        <section className="catering-banner" style={{
            padding: '6rem 0',
            background: 'var(--color-sage)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative background element reversed */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-5%',
                width: '40%',
                height: '120%',
                background: 'url(https://obsvdzlsbbqmhpsxksnd.supabase.co/storage/v1/object/public/products/hojas3-scaled.png) no-repeat center left',
                backgroundSize: 'contain',
                opacity: 0.15,
                zIndex: 1,
                transform: 'scaleX(-1)'
            }}></div>

            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2
            }}>
                <div style={{ position: 'relative' }}>
                    <img
                        src="https://obsvdzlsbbqmhpsxksnd.supabase.co/storage/v1/object/public/products/WhatsApp-Image-2025-08-01-at-9.58.08-AM-2.jpeg"
                        alt="ZETAmóvil Catering"
                        style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: '4px',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                            transform: 'rotate(2deg)'
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: '-20px',
                        left: '-20px',
                        background: 'var(--color-secondary)',
                        padding: '1.5rem',
                        borderRadius: '50%',
                        color: '#fff',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }}>
                        <Truck size={32} />
                    </div>
                </div>

                <div className="catering-content">
                    <span style={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.3em',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: 'var(--color-primary)',
                        display: 'block',
                        marginBottom: '1rem'
                    }}>
                        Experiencias sobre Ruedas
                    </span>
                    <h2 className="font-serif" style={{
                        fontSize: '3.5rem',
                        color: 'var(--color-primary)',
                        marginBottom: '1.5rem',
                        lineHeight: '1.1'
                    }}>
                        Nuestro <br /> Catering & ZETAmóvil
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#444',
                        marginBottom: '3rem',
                        lineHeight: '1.8',
                        maxWidth: '500px'
                    }}>
                        Llevamos la esencia de Zeticas a tus eventos. Preparaciones frescas,
                        sándwiches gourmet y granolas artesanales servidas directamente desde nuestro icónico tuk-tuk.
                    </p>
                    <Link
                        to="/catering"
                        className="btn"
                        style={{
                            background: 'var(--color-primary)',
                            color: '#fff',
                            padding: '1.2rem 3rem',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            display: 'inline-block'
                        }}
                    >
                        Conoce más
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CateringBanner;
