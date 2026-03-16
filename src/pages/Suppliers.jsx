import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useBusiness } from '../context/BusinessContext';
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
    ExternalLink,
    Check,
    Edit3,
    Trash2,
    AlertTriangle,
    RefreshCw,
    Briefcase
} from 'lucide-react';

const Suppliers = () => {
    const { items, providers: suppliers, refreshData, loading } = useBusiness();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCatalogSupplier, setActiveCatalogSupplier] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, targetId: null, title: '', message: '' });

    const [newSupplier, setNewSupplier] = useState({
        name: '',
        nit: '',
        email: '',
        phone: '',
        address: '',
        type: 'Jurídica',
        location: 'Local',
        category: 'Insumos'
    });

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nit?.includes(searchTerm) ||
        (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSaveSupplier = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const supplierData = {
            name: newSupplier.name,
            nit: newSupplier.nit,
            email: newSupplier.email,
            phone: newSupplier.phone,
            address: newSupplier.address,
            type: newSupplier.type,
            category: newSupplier.category,
            status: 'ACTIVE'
        };

        try {
            if (editingSupplier) {
                const { error } = await supabase.from('suppliers').update(supplierData).eq('id', editingSupplier.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('suppliers').insert([supplierData]);
                if (error) throw error;
            }

            await refreshData();
            setIsModalOpen(false);
            setEditingSupplier(null);
            setNewSupplier({ name: '', nit: '', email: '', phone: '', address: '', type: 'Jurídica', location: 'Local', category: 'Insumos' });
        } catch (err) {
            console.error("Error saving supplier:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (supplier) => {
        setConfirmModal({
            show: true,
            targetId: supplier.id,
            title: '¿Eliminar Proveedor?',
            message: `¿Estás seguro que quieres eliminar a "${supplier.name}"? Esta acción no se puede deshacer.`
        });
    };

    const executeDeletion = async () => {
        try {
            const { error } = await supabase.from('suppliers').delete().eq('id', confirmModal.targetId);
            if (error) throw error;
            await refreshData();
            setConfirmModal({ show: false, targetId: null, title: '', message: '' });
        } catch (err) {
            console.error("Error deleting supplier:", err);
        }
    };

    const toggleMaterialAssociation = async (materialId) => {
        if (!activeCatalogSupplier) return;

        const currentItems = activeCatalogSupplier.associatedItems || [];
        const updatedItems = currentItems.includes(materialId)
            ? currentItems.filter(id => id !== materialId)
            : [...currentItems, materialId];

        try {
            const { error } = await supabase.from('suppliers').update({ associated_items: updatedItems }).eq('id', activeCatalogSupplier.id);
            if (!error) {
                setActiveCatalogSupplier({ ...activeCatalogSupplier, associatedItems: updatedItems });
                await refreshData();
            }
        } catch (err) {
            console.error("Error updating association:", err);
        }
    };

    const rawMaterials = items.filter(i => i.type === 'material');

    return (
        <div className="suppliers-module" style={{ padding: '0 1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Directorio de Proveedores</h2>
                    <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem' }}>Gestión centralizada de aliados comerciales sincronizados con la nube.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Buscar en la nube..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>
                    <button onClick={refreshData} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.55rem', borderRadius: '12px', cursor: 'pointer' }} title="Actualizar Datos">
                        <RefreshCw size={18} color="#64748b" />
                    </button>
                    <button
                        onClick={() => {
                            setEditingSupplier(null);
                            setNewSupplier({ name: '', nit: '', email: '', phone: '', address: '', type: 'Jurídica', location: 'Local', category: 'Insumos' });
                            setIsModalOpen(true);
                        }}
                        style={{
                            background: '#1a3636',
                            color: '#fff',
                            padding: '0.55rem 1.2rem',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            boxShadow: '0 4px 12px rgba(26, 54, 54, 0.2)',
                            fontSize: '0.85rem'
                        }}
                    >
                        <Plus size={16} /> + Nuevo Proveedor
                    </button>
                </div>
            </header>

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
                                background: s.type === 'Natural' ? '#fdf2f8' : '#f0f9ff',
                                color: s.type === 'Natural' ? '#be185d' : '#0369a1',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                            }}>
                                {s.type === 'Natural' ? <User size={12} /> : <Briefcase size={12} />}
                                {s.type === 'Natural' ? 'B2C' : 'B2B'}
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.4rem' }}>{s.name}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            <span style={{ background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                                {s.group || 'General'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                <Package size={12} /> {(s.associatedItems || []).length} Materias
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <button onClick={() => setActiveCatalogSupplier(s)} style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', fontWeight: '700', color: '#fff', background: '#1a3636', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <ExternalLink size={14} /> Catálogo
                            </button>
                            <button onClick={() => { setEditingSupplier(s); setNewSupplier({ ...s }); setIsModalOpen(true); }} style={{ padding: '0.55rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', color: '#64748b' }}>
                                <Edit3 size={14} />
                            </button>
                            <button onClick={() => handleDeleteClick(s)} style={{ padding: '0.55rem', border: '1px solid #fca5a5', borderRadius: '12px', background: '#fff', cursor: 'pointer', color: '#ef4444' }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Catalog Association Modal */}
            {activeCatalogSupplier && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '700px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Catálogo de {activeCatalogSupplier.name}</h3>
                            <button onClick={() => setActiveCatalogSupplier(null)} style={{ border: 'none', background: 'none' }}><X /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem 0' }}>
                            {rawMaterials.map(material => {
                                const isAssociated = (activeCatalogSupplier.associatedItems || []).includes(material.id);
                                return (
                                    <div key={material.id} onClick={() => toggleMaterialAssociation(material.id)} style={{ padding: '1rem', borderRadius: '16px', border: isAssociated ? '2px solid var(--color-primary)' : '1px solid #e2e8f0', background: isAssociated ? '#f0f4f4' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{material.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#666' }}>{material.sku}</div>
                                        </div>
                                        {isAssociated && <Check size={18} color="var(--color-primary)" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Save Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '500px' }}>
                        <h3>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
                        <form onSubmit={handleSaveSupplier} style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                            <input placeholder="Nombre" required value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }} />
                            <input placeholder="NIT" required value={newSupplier.nit} onChange={(e) => setNewSupplier({ ...newSupplier, nit: e.target.value })} style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }} />
                            <select value={newSupplier.category} onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })} style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}>
                                <option value="Materias Primas">Materias Primas</option>
                                <option value="Insumos">Insumos</option>
                                <option value="Empaque">Empaque</option>
                            </select>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: '#f1f5f9' }}>Cancelar</button>
                                <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: '#1a3636', color: '#fff', fontWeight: 'bold' }}>
                                    {isSaving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {confirmModal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', maxWidth: '400px', textAlign: 'center' }}>
                        <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
                        <h3 style={{ marginBottom: '1rem' }}>{confirmModal.title}</h3>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{confirmModal.message}</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd', background: '#fff' }}>Cancelar</button>
                            <button onClick={executeDeletion} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 'bold' }}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
