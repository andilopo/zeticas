import React from 'react';
import { Truck, Utensils, Zap, Users, MessageSquare } from 'lucide-react';

const Catering = () => {
    return (
        <div className="catering-page botanical-bg" style={{ minHeight: '100vh', padding: '6rem 0' }}>
            <div className="container">
                {/* Hero section with ZETAmóvil */}
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4rem',
                    alignItems: 'stretch',
                    marginBottom: '10rem'
                }}>
                    <div className="salmon-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h1 className="font-serif" style={{ color: '#fff', fontSize: '3.5rem', marginBottom: '2rem' }}>Servicio de Catering</h1>
                        <p style={{ color: '#fff', fontSize: '1.2rem', lineHeight: '1.8', opacity: 0.9 }}>
                            Llevamos la frescura de Zeticas directamente a tus eventos con el **ZETAmóvil**.
                            Una propuesta de alimentación saludable y consciente que destaca lo mejor de la Sabana de Bogotá.
                        </p>
                    </div>
                    <div style={{ height: '100%', minHeight: '500px' }}>
                        <img
                            src="https://obsvdzlsbbqmhpsxksnd.supabase.co/storage/v1/object/public/products/WhatsApp-Image-2025-08-01-at-9.58.08-AM.jpeg"
                            alt="ZETAmóvil Zeticas"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'left center',
                                borderRadius: '4px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                            }}
                        />
                    </div>
                </section>

                {/* What we offer */}
                <section style={{ marginBottom: '10rem' }}>
                    <h2 className="font-serif" style={{ textAlign: 'center', color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '4rem' }}>Nuestra Propuesta</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
                        {[
                            { icon: <Zap />, title: 'ZETAmóvil', text: 'Nuestro tuk-tuk móvil nos permite preparar sándwiches y granolas al instante en cualquier ubicación.' },
                            { icon: <Utensils />, title: 'Versatilidad', text: 'Menús basados en nuestras conservas dulces y saladas, ideales para cualquier momento del día.' },
                            { icon: <Users />, title: 'Inclusivo', text: 'Opciones cuidadosamente diseñadas para clientes Veganos, Vegetarianos y Omnívoros.' }
                        ].map((item, i) => (
                            <div key={i} style={{ background: '#fff', padding: '3rem', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                <div style={{ color: 'var(--color-secondary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                    {React.cloneElement(item.icon, { size: 40 })}
                                </div>
                                <h3 className="font-serif" style={{ color: 'var(--color-primary)', fontSize: '1.5rem', marginBottom: '1rem' }}>{item.title}</h3>
                                <p style={{ color: '#666', fontSize: '0.95rem' }}>{item.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Partnerships */}
                <section style={{ marginBottom: '10rem', padding: '4rem', background: '#f8f9f8', borderRadius: '4px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 className="font-serif" style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>Ecosistema Local</h2>
                        <p style={{ color: '#666' }}>Trabajamos de la mano con emprendedores destacados para ofrecer variedad y calidad.</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.6, filter: 'grayscale(1)' }}>
                        {['Castilac', 'Patico', 'Masa Madre', 'Clementina', 'Holandés'].map(p => (
                            <span key={p} style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{p}</span>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    <div className="salmon-box" style={{ padding: '4rem' }}>
                        <h2 className="font-serif" style={{ color: '#fff', fontSize: '2.2rem', marginBottom: '1.5rem' }}>Reserva tu Fecha</h2>
                        <p style={{ color: '#fff', marginBottom: '3rem', opacity: 0.9 }}>
                            ¿Tienes un evento corporativo, feria o celebración privada?
                            Hagámoslo especial con sabores auténticos.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                            <a href="https://wa.me/3144336525" target="_blank" rel="noreferrer" style={{ background: '#fff', color: 'var(--color-primary)', padding: '1rem 2rem', textDecoration: 'none', fontWeight: 'bold', borderRadius: '2px' }}>
                                WhatsApp
                            </a>
                            <a href="mailto:admin@zeticas.com" style={{ border: '1px solid #fff', color: '#fff', padding: '1rem 2rem', textDecoration: 'none', fontWeight: 'bold', borderRadius: '2px' }}>
                                Email
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Catering;
