import React from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';

const Hero = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');

    return (
        <section className="hero botanical-bg" style={{
            '--bg-filter': 'rgba(175, 191, 113, 0.5)', // Sage Green Block 1
            minHeight: isMobile ? 'auto' : '85vh',
            display: 'flex',
            alignItems: 'center',
            padding: isMobile ? '4rem 1rem 6rem' : '4rem 0',
            position: 'relative'
        }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '1.5rem' : '4rem',
                alignItems: 'center'
            }}>
                {/* Block 1: The Salmon Glass Box */}
                <div className="hero-content" style={{
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 1.0)', // Solid White "floor" for absolute color purity
                    borderRadius: '32px',
                    boxShadow: `
                        0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                        0 10px 10px -5px rgba(0, 0, 0, 0.04),
                        0 45px 100px -20px rgba(0, 0, 0, 0.15)
                    `, // Layered Premium Shadow
                    zIndex: 10,
                    padding: 0,
                    textAlign: isMobile ? 'center' : 'left',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    <div style={{
                        padding: isMobile ? '2.5rem 1.5rem' : '4rem',
                        background: 'rgba(243, 124, 121, 0.85)', // Institutional Salmon Glass Density
                        backdropFilter: 'blur(25px)',
                        WebkitBackdropFilter: 'blur(25px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.7)', // Polished Highlight Edge
                        boxShadow: 'inset 0 0 80px rgba(255, 255, 255, 0.15)', // Inner Radiant Glow
                        borderRadius: 'inherit'
                    }}>
                        <span className="font-serif" style={{ 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.25em', 
                            fontSize: isMobile ? '0.65rem' : '0.75rem', 
                            fontWeight: 'bold', 
                            color: 'rgba(255,255,255,0.95)',
                            display: 'block'
                        }}>
                            Sabana de Bogotá • Colombia
                        </span>
                        <h1 className="hero-text" style={{ 
                            margin: '1.2rem 0', 
                            fontSize: isMobile ? '2.8rem' : '5rem', 
                            color: '#fff', 
                            lineHeight: '1',
                            wordBreak: 'break-word'
                        }}>
                            Zeticas
                        </h1>
                        <p style={{ 
                            maxWidth: '430px', 
                            margin: isMobile ? '0 auto 2.5rem' : '0 0 3rem', 
                            color: '#fff', 
                            fontSize: isMobile ? '0.95rem' : '1.2rem', 
                            fontWeight: '400', // Editorial Weight
                            lineHeight: '1.6' 
                        }}>
                            Conservas premium y consultoría con propósito. Redescubriendo el valor de nuestra tierra y sus productores.
                        </p>
                        <div style={{ marginTop: '2.5rem' }}>
                            <Link to="/tienda" className="btn" style={{ 
                                background: 'var(--color-primary)', // Petroleum Blue from Header
                                color: '#fff', // Pure White text
                                padding: isMobile ? '1rem 2rem' : '1.2rem 2.8rem', 
                                fontWeight: '800', 
                                textDecoration: 'none', 
                                borderRadius: '50px', 
                                fontSize: '0.85rem',
                                boxShadow: '0 15px 35px rgba(0,77,77,0.25)',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                display: 'inline-block'
                            }}>Explorar Colección</Link>
                        </div>
                    </div>
                </div>

                {/* Block 2: The Product Image */}
                <div className="hero-image" style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'visible',
                    marginTop: isMobile ? '2rem' : '0'
                }}>
                    <img
                        src="/assets/product-jars.png"
                        alt="Zeticas Trio"
                        style={{
                            width: isMobile ? '70%' : '80%',
                            height: 'auto',
                            display: 'block',
                            objectFit: 'contain',
                            mixBlendMode: 'multiply',
                            transform: isMobile ? 'translateY(-15px)' : 'translateY(50px) scale(1.1)', // Overlapping bottom waves
                            filter: 'drop-shadow(15px 15px 30px rgba(0,0,0,0.08))'
                        }}
                    />
                </div>
            </div>

            {/* Bottom White Invasion Waves (Towards White Section) */}
            <div style={{
                position: 'absolute',
                bottom: -1,
                left: 0,
                width: '100%',
                lineHeight: 0,
                zIndex: 1,
                transform: 'scaleY(-1)'
            }}>
                <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
                    <path fill="#ffffff" fillOpacity="0.2" d="M0,32L60,42.7C120,53,240,75,360,80C480,85,600,75,720,64C840,53,960,43,1080,48C1200,53,1320,75,1380,85.3L1440,96V0H0Z"></path>
                    <path fill="#ffffff" fillOpacity="0.5" d="M0,96L60,85.3C120,75,240,53,360,42.7C480,32,600,32,720,42.7C840,53,960,75,1080,80C1200,85,1320,75,1380,69.3L1440,64V0H0Z"></path>
                    <path fill="#ffffff" d="M0,32L60,26.7C120,21,240,11,360,16C480,21,600,43,720,42.7C840,43,960,21,1080,10.7C1200,0,1320,0,1380,0L1440,0V0H0Z"></path>
                </svg>
            </div>
        </section>
    );
};

export default Hero;
