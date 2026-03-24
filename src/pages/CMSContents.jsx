import React, { useState } from 'react';
import { Save, Layout, Type, MessageSquare, CheckCircle, Globe } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

const CMSContents = () => {
    const { siteContent, updateSiteContent } = useBusiness();
    const [activeTab, setActiveTab] = useState('hero');
    const [isSaving, setIsSaving] = useState(false);

    const sections = [
        { id: 'hero', label: 'Hero / Inicio', icon: <Layout size={18} /> },
        { id: 'philosophy', label: 'Filosofía', icon: <Type size={18} /> },
        { id: 'support', label: 'Apoyo & Soporte', icon: <MessageSquare size={18} /> },
        { id: 'knowledge', label: 'Conocimiento', icon: <CheckCircle size={18} /> },
        { id: 'impact', label: 'Impacto', icon: <Globe size={18} /> },
    ];

    const handleSave = async (key, value) => {
        setIsSaving(true);
        try {
            await updateSiteContent(activeTab, key, value);
        } catch (err) {
            console.error("Error saving content:", err);
            alert("Error al guardar el contenido. Verifica la conexión.");
        }
        setIsSaving(false);
    };

    const renderFields = () => {
        const content = siteContent[activeTab] || {};
        
        // Define fields based on section
        const fields = {
            hero: [
                { key: 'top_text', label: 'Texto Superior (Provincia/Ubicación)', type: 'text' },
                { key: 'title', label: 'Título Principal (H1)', type: 'text' },
                { key: 'description', label: 'Descripción / Slogan (Párrafo Hero)', type: 'textarea' },
                { key: 'cta_text', label: 'Texto Botón Acción', type: 'text' },
            ],
            philosophy: [
                { key: 'title', label: 'Título Sección', type: 'text' },
                { key: 'subtitle', label: 'Subtítulo (SER para HACER)', type: 'text' },
            ],
            support: [
                { key: 'title', label: 'Título Sección', type: 'text' },
                { key: 'subtitle', label: 'Sinergias (Título Inferior)', type: 'text' },
                { key: 'description', label: 'Descripción Sinergias', type: 'textarea' },
            ],
            knowledge: [
                { key: 'title', label: 'Título Sección', type: 'text' },
            ],
            impact: [
                { key: 'title', label: 'Título Sección', type: 'text' },
                { key: 'subtitle', label: 'Subtítulo / Alcance', type: 'text' },
            ]
        };

        return (fields[activeTab] || []).map(field => (
            <div key={field.key} style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: '800', color: '#1e293b', marginBottom: '0.8rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {field.label}
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {field.type === 'textarea' ? (
                        <textarea
                            defaultValue={content[field.key] || ''}
                            onBlur={(e) => {
                                if (content[field.key] !== e.target.value) {
                                    handleSave(field.key, e.target.value);
                                }
                            }}
                            style={{
                                flex: 1,
                                padding: '1.2rem',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                fontSize: '1rem',
                                color: '#334155',
                                fontWeight: '600',
                                fontFamily: 'inherit',
                                minHeight: '120px',
                                resize: 'vertical',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                        />
                    ) : (
                        <input
                            type="text"
                            defaultValue={content[field.key] || ''}
                            onBlur={(e) => {
                                if (content[field.key] !== e.target.value) {
                                    handleSave(field.key, e.target.value);
                                }
                            }}
                            style={{
                                flex: 1,
                                padding: '1.2rem',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                fontSize: '1rem',
                                color: '#334155',
                                fontWeight: '600',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                        />
                    )}
                </div>
            </div>
        ));
    };

    return (
        <div style={{ padding: '2.5rem', animation: 'fadeIn 0.5s ease', background: '#fbfcfd', minHeight: 'calc(100vh - 100px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#004B50', margin: 0, letterSpacing: '-1px' }}>Editor de Contenidos</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '600', marginTop: '5px' }}>Control de narrativa y copy de la Landing Page.</p>
                </div>
                {isSaving ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '0.8rem 1.5rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', color: '#10b981', fontWeight: '700', fontSize: '0.9rem' }}>
                        <div className="spinner-small" /> Sincronizando...
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '0.8rem 1.5rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', color: '#94a3b8', fontWeight: '700', fontSize: '0.9rem' }}>
                        <Save size={18} /> Cambios guardados
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem' }}>
                {/* Sidebar Navigation */}
                <div style={{ height: 'fit-content' }}>
                    <div style={{ background: '#fff', borderRadius: '32px', padding: '1.2rem', boxShadow: '0 15px 40px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                        <div style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Secciones Web</div>
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.2rem',
                                    width: '100%',
                                    padding: '1.2rem 1.5rem',
                                    border: 'none',
                                    background: activeTab === section.id ? '#004B50' : 'transparent',
                                    color: activeTab === section.id ? '#fff' : '#64748b',
                                    borderRadius: '22px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '800',
                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    marginBottom: '0.5rem',
                                    textAlign: 'left',
                                    boxShadow: activeTab === section.id ? '0 10px 25px rgba(0,75,80,0.2)' : 'none',
                                    transform: activeTab === section.id ? 'translateX(5px)' : 'none'
                                }}
                            >
                                <span style={{ opacity: activeTab === section.id ? 1 : 0.5 }}>{section.icon}</span>
                                {section.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #004B50, #025357)', borderRadius: '32px', color: '#fff' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900' }}>Consejo Editorial</h4>
                        <p style={{ margin: '1rem 0 0', fontSize: '0.85rem', lineHeight: '1.5', opacity: 0.8, fontWeight: '500' }}>
                            Mantén los títulos cortos y directos. Los cambios realizados aquí se reflejan de inmediato para todos los visitantes del sitio.
                        </p>
                    </div>
                </div>

                {/* Editor Surface */}
                <div style={{ background: '#fff', borderRadius: '48px', padding: '4.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                    <div style={{ marginBottom: '4rem', borderBottom: '1px solid #f8fafc', paddingBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#004B50', marginBottom: '0.5rem' }}>
                            {sections.find(s => s.id === activeTab)?.icon}
                            <span style={{ fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Personalización</span>
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>
                            {sections.find(s => s.id === activeTab)?.label}
                        </h3>
                    </div>

                    <div style={{ maxWidth: '800px' }}>
                        {renderFields()}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .spinner-small { width: 14px; height: 14px; border: 2px solid #10b98120; border-top: 2px solid #10b981; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default CMSContents;
