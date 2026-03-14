import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    Truck,
    Search,
    Plus,
    X,
    Save,
    Phone,
    Mail,
    MapPin,
    Building2,
    User,
    Package,
    ShieldCheck,
    Briefcase,
    ExternalLink,
    Hash,
    CheckCircle2,
    Check
} from 'lucide-react';

const Suppliers = ({ items = [], setItems }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCatalogSupplier, setActiveCatalogSupplier] = useState(null);

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadSuppliers = async () => {
        try {
            const { data, error } = await supabase.from('suppliers').select('*').order('name');
            if (error) throw error;
            // Map the DB structure to frontend structure
            const mapped = data.map(s => ({
                id: s.id, // UUID in DB
                name: s.name,
                nit: s.nit || '000-0',
                email: s.email,
                phone: s.phone || '',
                address: '', // Mock for now, not in DB
                type: 'Jurídica', // Default since not in DB
                subType: 'B2B',
                category: 'Insumos', // Mock default
                location: 'Local',
                status: s.status,
                associatedItems: []
            }));
            setSuppliers(mapped);
        } catch (err) {
            console.error("Error loading suppliers:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadSuppliers();
    }, []);

    const [newSupplier, setNewSupplier] = useState({
        name: '',
        nit: '',
        email: '',
        phone: '',
        address: '',
        type: 'Jurídica',
        location: '',
        category: 'Insumos'
    });

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nit?.includes(searchTerm) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveSupplier = async (e) => {
        e.preventDefault();
        const supplierToAdd = {
            name: newSupplier.name,
            nit: newSupplier.nit,
            email: newSupplier.email,
            phone: newSupplier.phone,
            contact_name: 'Principal', // Mock
            status: 'ACTIVE'
        };

        try {
            const { data, error } = await supabase.from('suppliers').insert([supplierToAdd]).select();
            if (error) throw error;

            // Mapped structure for UI
            const newS = {
                id: data[0].id,
                name: data[0].name,
                nit: data[0].nit,
                email: data[0].email,
                phone: data[0].phone,
                address: newSupplier.address,
                type: newSupplier.type,
                subType: newSupplier.type === 'Jurídica' ? 'B2B' : 'B2C',
                category: newSupplier.category,
                location: newSupplier.location,
                status: data[0].status,
                associatedItems: []
            };

            setSuppliers([newS, ...suppliers]);
            setIsModalOpen(false);
            setNewSupplier({ name: '', nit: '', email: '', phone: '', address: '', type: 'Jurídica', location: '', category: 'Insumos' });
        } catch (err) {
            console.error("Error saving supplier to Supabase:", err);
        }
    };

    const toggleMaterialAssociation = (materialId) => {
        setSuppliers(prev => prev.map(s => {
            if (s.id === activeCatalogSupplier.id) {
                const currentItems = s.associatedItems || [];
                const updatedItems = currentItems.includes(materialId)
                    ? currentItems.filter(id => id !== materialId)
                    : [...currentItems, materialId];

                const updatedSupplier = { ...s, associatedItems: updatedItems };
                // Keep active supplier updated so modal reflects change
                setActiveCatalogSupplier(updatedSupplier);
                return updatedSupplier;
            }
            return s;
        }));
    };

    const rawMaterials = items.filter(i => i.type === 'material');

    return (
        <div className="suppliers-module" style={{ padding: '0 1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Directorio de Proveedores</h2>
                    <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem' }}>Gestión estratégica de la cadena de suministro y aliados.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, NIT o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            background: '#1a3636',
                            color: '#fff',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            boxShadow: '0 4px 12px rgba(26, 54, 54, 0.2)'
                        }}
                    >
                        <Plus size={18} /> + Nuevo Proveedor
                    </button>
                </div>
            </header>

            {/* Suppliers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {filteredSuppliers.map(s => (
                    <div key={s.id} style={{
                        background: '#fff',
                        padding: '1.8rem',
                        borderRadius: '24px',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                        transition: 'all 0.3s ease'
                    }} className="supplier-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                            <div style={{
                                background: s.subType === 'B2B' ? '#f0f9ff' : '#fdf2f8',
                                color: s.subType === 'B2B' ? '#0369a1' : '#be185d',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                            }}>
                                {s.subType === 'B2B' ? <Briefcase size={12} /> : <User size={12} />}
                                {s.subType}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>#{s.id ? s.id.toString().split('-')[0] : 'N/A'}</span>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.4rem' }}>{s.name}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            <span style={{ background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                                {s.category}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                <MapPin size={12} /> {s.location}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                <Package size={12} /> {(s.associatedItems || []).length} Materias
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>NIT / ID</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>{s.nit}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Contacto Principal</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>Directo</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <button
                                onClick={() => setActiveCatalogSupplier(s)}
                                style={{ flex: 1, padding: '0.7rem', fontSize: '0.8rem', fontWeight: '700', color: '#fff', background: '#1a3636', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                            >
                                <ExternalLink size={16} /> Ver Catálogo
                            </button>
                            <a href={`tel:${s.phone}`} style={{ padding: '0.7rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                                <Phone size={16} />
                            </a>
                            <a href={`mailto:${s.email}`} style={{ padding: '0.7rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                                <Mail size={16} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Catalog Association Modal */}
            {activeCatalogSupplier && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2600,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '700px',
                        maxHeight: '80vh',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1a3636' }}>Catálogo: {activeCatalogSupplier.name}</h3>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Selecciona los insumos y materias primas que este proveedor suministra.</p>
                            </div>
                            <button onClick={() => setActiveCatalogSupplier(null)} style={{ border: 'none', background: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><X size={20} color="#64748b" /></button>
                        </div>

                        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {rawMaterials.map(material => {
                                    const isAssociated = (activeCatalogSupplier.associatedItems || []).includes(material.id);
                                    return (
                                        <div
                                            key={material.id}
                                            onClick={() => toggleMaterialAssociation(material.id)}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '16px',
                                                border: isAssociated ? '2px solid var(--color-primary)' : '1px solid #e2e8f0',
                                                background: isAssociated ? '#f0f4f4' : '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: isAssociated ? 'var(--color-primary)' : '#1e293b' }}>{material.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Unidad: {material.unit}</div>
                                            </div>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: '1px solid #cbd5e1',
                                                background: isAssociated ? 'var(--color-primary)' : '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff'
                                            }}>
                                                {isAssociated && <Check size={14} strokeWidth={4} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {rawMaterials.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    No hay materias primas creadas en el inventario.
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1.5rem 2rem', background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setActiveCatalogSupplier(null)}
                                style={{ background: '#1a3636', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Finalizar Gestión
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for New Supplier */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2500,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '550px',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1a3636' }}>Alta de Nuevo Proveedor</h3>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Vincula un nuevo aliado comercial a Zeticas.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><X size={20} color="#64748b" /></button>
                        </div>

                        <form onSubmit={handleSaveSupplier} style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gap: '1.2rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '12px', marginBottom: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setNewSupplier({ ...newSupplier, type: 'Jurídica' })}
                                        style={{
                                            flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer',
                                            background: newSupplier.type === 'Jurídica' ? '#fff' : 'transparent',
                                            color: newSupplier.type === 'Jurídica' ? '#0369a1' : '#64748b',
                                            boxShadow: newSupplier.type === 'Jurídica' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        <Building2 size={14} /> Persona Jurídica (B2B)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewSupplier({ ...newSupplier, type: 'Natural' })}
                                        style={{
                                            flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer',
                                            background: newSupplier.type === 'Natural' ? '#fff' : 'transparent',
                                            color: newSupplier.type === 'Natural' ? '#be185d' : '#64748b',
                                            boxShadow: newSupplier.type === 'Natural' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        <User size={14} /> Persona Natural (B2C)
                                    </button>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>NOMBRE DEL PROVEEDOR / EMPRESA</label>
                                    <input
                                        type="text"
                                        required
                                        value={newSupplier.name}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>NIT / RUT</label>
                                        <input
                                            type="text"
                                            required
                                            value={newSupplier.nit}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, nit: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>CATEGORÍA DE SUMINISTRO</label>
                                        <select
                                            value={newSupplier.category}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                        >
                                            <option value="Materias Primas">Materias Primas</option>
                                            <option value="Insumos">Insumos (Envases/Etiquetas)</option>
                                            <option value="Servicios">Servicios Logísticos</option>
                                            <option value="Maquinaria">Maquinaria / Técnica</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>TELÉFONO COMERCIAL</label>
                                        <input
                                            type="text"
                                            required
                                            value={newSupplier.phone}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>EMAIL DE PEDIDOS</label>
                                        <input
                                            type="email"
                                            required
                                            value={newSupplier.email}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>DIRECCIÓN O UBICACIÓN PLANTA</label>
                                    <input
                                        type="text"
                                        value={newSupplier.address}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '1rem',
                                        background: '#1a3636',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.6rem',
                                        boxShadow: '0 4px 12px rgba(26, 54, 54, 0.2)'
                                    }}
                                >
                                    <Save size={18} /> Guardar Proveedor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .supplier-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
                }
            `}</style>
        </div>
    );
};

export default Suppliers;
