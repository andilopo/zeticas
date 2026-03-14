import React from 'react';
const savannaImg = 'https://obsvdzlsbbqmhpsxksnd.supabase.co/storage/v1/object/public/assets/savanna.png';

const ConsultingSection = () => {
    return (
        <section className="consulting whitespace-xl">
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                alignItems: 'center'
            }}>
                <div className="consulting-content">
                    <h2 className="font-serif" style={{ fontSize: '3rem', marginBottom: '2rem', lineHeight: '1.2' }}>
                        Asesoría con <br /><span className="text-salmon">Propósito</span>
                    </h2>
                    <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        No solo vendemos productos; impulsamos el crecimiento de la región. Ofrecemos consultoría especializada en sostenibilidad para empresas y apoyo técnico a productores locales de la Sabana de Bogotá.
                    </p>
                    <ul style={{ listStyle: 'none', marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)' }}></span>
                            Impulso a productores campesinos
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)' }}></span>
                            Estrategias de sostenibilidad corporativa
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)' }}></span>
                            Optimización de cadena de valor local
                        </li>
                    </ul>
                    <a href="/consultoria" className="btn btn-primary">Conocer más</a>
                </div>
                <div className="consulting-image">
                    <img
                        src={savannaImg}
                        alt="Sabana de Bogotá Landscape"
                        style={{
                            width: '100%',
                            height: '500px',
                            objectFit: 'cover',
                            borderRadius: '2px'
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

export default ConsultingSection;
