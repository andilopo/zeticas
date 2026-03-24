import React, { useState, useEffect } from 'react';
import { Save, Layout, Type, MessageSquare, CheckCircle, Globe, Truck, Users, Briefcase, Bookmark } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

const CMSField = ({ label, type, section, fieldKey, initialValue, onSave }) => {
    const [localValue, setLocalValue] = useState(initialValue || '');
    const [hasChanged, setHasChanged] = useState(false);

    useEffect(() => {
        setLocalValue(initialValue || '');
    }, [initialValue]);

    const handleChange = (val) => {
        setLocalValue(val);
        setHasChanged(val !== initialValue);
    };

    const handleBlur = () => {
        if (hasChanged) {
            onSave(fieldKey, localValue);
            setHasChanged(false);
        }
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: '800', color: '#1e293b', marginBottom: '0.8rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
                {type === 'textarea' ? (
                    <textarea
                        value={localValue}
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        style={{
                            flex: 1, padding: '1.2rem', borderRadius: '16px', border: '1px solid #e2e8f0',
                            background: '#f8fafc', fontSize: '1rem', color: '#334155', fontWeight: '600',
                            fontFamily: 'inherit', minHeight: '120px', resize: 'vertical', outline: 'none', transition: 'all 0.3s'
                        }}
                    />
                ) : (
                    <input
                        type="text"
                        value={localValue}
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        style={{
                            flex: 1, padding: '1.2rem', borderRadius: '16px', border: '1px solid #e2e8f0',
                            background: '#f8fafc', fontSize: '1rem', color: '#334155', fontWeight: '600',
                            outline: 'none', transition: 'all 0.3s'
                        }}
                    />
                )}
            </div>
        </div>
    );
};

const CMSContents = () => {
    const { siteContent, updateSiteContent } = useBusiness();
    const [activeTab, setActiveTab] = useState('hero');
    const [isSaving, setIsSaving] = useState(false);
    const [lastStatus, setLastStatus] = useState('saved'); // 'saved', 'saving', 'error'

    const sections = [
        { id: 'hero', label: 'Hero / Inicio', icon: <Layout size={18} /> },
        { id: 'philosophy', label: 'Filosofía', icon: <Type size={18} /> },
        { id: 'support', label: 'Apoyo & Soporte', icon: <MessageSquare size={18} /> },
        { id: 'catering', label: 'Catering ZETAmóvil', icon: <Truck size={18} /> },
        { id: 'consulting', label: 'Consultoría CZ', icon: <Briefcase size={18} /> },
        { id: 'knowledge', label: 'Conocimiento', icon: <CheckCircle size={18} /> },
        { id: 'impact', label: 'Impacto Comunitario', icon: <Globe size={18} /> },
        { id: 'allies', label: 'Aliados / Ubicaciones', icon: <Users size={18} /> },
        { id: 'extra', label: 'Citas y Frases', icon: <Bookmark size={18} /> },
    ];

    const handleSave = async (key, value) => {
        setIsSaving(true);
        setLastStatus('saving');
        const result = await updateSiteContent(activeTab, key, value);
        
        if (result.success) {
            setLastStatus('saved');
        } else {
            setLastStatus('error');
            alert(`Error al guardar: ${result.error}. Asegúrate de que las políticas de BD (RLS) lo permitan.`);
        }
        setIsSaving(false);
    };

    const sectionFields = {
        hero: [
            { key: 'top_text', label: 'Texto Superior (Provincia)', type: 'text' },
            { key: 'title', label: 'Título Principal Zeticas', type: 'text' },
            { key: 'description', label: 'Descripción / Slogan', type: 'textarea' },
            { key: 'cta_text', label: 'Texto Botón Acción', type: 'text' },
        ],
        philosophy: [
            { key: 'title', label: 'Título Sección', type: 'text' },
            { key: 'subtitle', label: 'Subtítulo Destacado', type: 'text' },
        ],
        support: [
            { key: 'title', label: 'Título Sección', type: 'text' },
            { key: 'subtitle', label: 'Sinergias de Vida', type: 'text' },
            { key: 'description', label: 'Descripción Ecosistema', type: 'textarea' },
        ],
        catering: [
            { key: 'top_text', label: 'Cintillo Superior', type: 'text' },
            { key: 'title', label: 'Título del Banner', type: 'text' },
            { key: 'description', label: 'Cuerpo del Mensaje (Párrafo)', type: 'textarea' },
            { key: 'cta_text', label: 'Texto Botón Catering', type: 'text' },
        ],
        consulting: [
            { key: 'title', label: 'Título Consultoría', type: 'text' },
            { key: 'description', label: 'Descripción General', type: 'textarea' },
        ],
        knowledge: [
            { key: 'title', label: 'Título Sección', type: 'text' },
        ],
        impact: [
            { key: 'title', label: 'Título Sección', type: 'text' },
            { key: 'subtitle', label: 'Alcance / Subtítulo', type: 'text' },
        ],
        allies: [
            { key: 'title', label: 'Título Sección', type: 'text' },
            { key: 'description', label: 'Subtítulo / Intro Aliados', type: 'textarea' },
        ],
        extra: [
            { key: 'hero_quote', label: 'Cita Inicial (Hero)', type: 'textarea' },
            { key: 'hero_desc', label: 'Intro Zeticas (Hero)', type: 'textarea' },
            { key: 'quote_yarumo', label: 'Cita Yarumo (Pensamiento)', type: 'textarea' },
            { key: 'quote_tronco', label: 'Cita Tronco (Nutrición)', type: 'textarea' },
            { key: 'quote_colab', label: 'Cita Colaboración (Gris)', type: 'textarea' },
        ]
    };

    const content = siteContent[activeTab] || {};

    return (
        <div style={{ padding: '2.5rem', animation: 'fadeIn 0.5s ease', background: '#fbfcfd', minHeight: 'calc(100vh - 100px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#004B50', margin: 0, letterSpacing: '-1px' }}>Editor Global de Textos</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '600', marginTop: '5px' }}>Modifica toda la narrativa de la landing page sin código.</p>
                </div>
                
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    background: '#fff', 
                    padding: '0.8rem 1.5rem', 
                    borderRadius: '20px', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                    color: lastStatus === 'saving' ? '#fbbf24' : lastStatus === 'error' ? '#ef4444' : '#10b981', 
                    fontWeight: '700', 
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                }}>
                    {lastStatus === 'saving' && <div className="spinner-small" />}
                    {lastStatus === 'saved' && <Save size={18} />}
                    {lastStatus === 'error' && <Layout size={18} />} {/* Error icon equivalent */}
                    {lastStatus === 'saving' ? 'Sincronizando...' : lastStatus === 'error' ? 'Error al Guardar' : 'Cambios Sincronizados'}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '3rem' }}>
                {/* Sidebar Navigation */}
                <div style={{ height: 'fit-content' }}>
                    <div style={{ background: '#fff', borderRadius: '32px', padding: '1.2rem', boxShadow: '0 15px 40px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                        <div style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Zonas del Sitio</div>
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '1.2rem', width: '100%',
                                    padding: '1.2rem 1.5rem', border: 'none', background: activeTab === section.id ? '#004B50' : 'transparent',
                                    color: activeTab === section.id ? '#fff' : '#64748b', borderRadius: '22px', cursor: 'pointer',
                                    fontSize: '0.95rem', fontWeight: '800', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    marginBottom: '0.5rem', textAlign: 'left', boxShadow: activeTab === section.id ? '0 10px 25px rgba(0,75,80,0.2)' : 'none',
                                    transform: activeTab === section.id ? 'translateX(5px)' : 'none'
                                }}
                            >
                                <span style={{ opacity: activeTab === section.id ? 1 : 0.5 }}>{section.icon}</span>
                                {section.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Surface */}
                <div style={{ background: '#fff', borderRadius: '48px', padding: '4.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                    <div style={{ marginBottom: '4rem', borderBottom: '1px solid #f8fafc', paddingBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#004B50', marginBottom: '0.5rem' }}>
                            {sections.find(s => s.id === activeTab)?.icon}
                            <span style={{ fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Personalización en Vivo</span>
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>
                            {sections.find(s => s.id === activeTab)?.label}
                        </h3>
                    </div>

                    <div style={{ maxWidth: '800px' }}>
                        {sectionFields[activeTab]?.map(field => (
                            <CMSField
                                key={`${activeTab}-${field.key}`}
                                {...field}
                                initialValue={content[field.key]}
                                onSave={handleSave}
                                section={activeTab}
                                fieldKey={field.key}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .spinner-small { width: 14px; height: 14px; border: 2px solid rgba(251, 191, 36, 0.2); border-top: 2px solid #fbbf24; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default CMSContents;
