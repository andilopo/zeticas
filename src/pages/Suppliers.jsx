import React, { useState } from 'react';
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
    ShoppingBag,
    CreditCard,
    LayoutGrid,
    ClipboardList,
    CheckCircle,
    RefreshCw,
    Edit3,
    Trash2,
    AlertTriangle,
    Download
} from 'lucide-react';

const Suppliers = () => {
    const { items, providers: suppliers, refreshData, addSupplier, updateSupplier, deleteSupplier } = useBusiness();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCatalogSupplier, setActiveCatalogSupplier] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [newSupplier, setNewSupplier] = useState({
        name: '',
        nit: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        contact_person: '',
        category: 'Insumos',
        payment_method: '',
        payment_number: ''
    });

    const q = searchTerm.toLowerCase();
    const filteredSuppliers = suppliers.filter(s => {
        const matchesSearch = (
            (s.name || '').toLowerCase().includes(q) ||
            (s.nit || '').toLowerCase().includes(q) ||
            (s.city || '').toLowerCase().includes(q) ||
            (s.email || '').toLowerCase().includes(q) ||
            (s.phone || '').toLowerCase().includes(q) ||
            (s.contact_person || '').toLowerCase().includes(q) ||
            (s.category || '').toLowerCase().includes(q)
        );
        const isArchived = s.status === 'Archived';
        if (showArchived) return matchesSearch && isArchived;
        return matchesSearch && !isArchived;
    }).sort((a, b) => {
        // Enviar Zeticas al final
        const aIsOwn = a.is_own_company === true || (a.name || '').toLowerCase().includes('zeticas');
        const bIsOwn = b.is_own_company === true || (b.name || '').toLowerCase().includes('zeticas');
        if (aIsOwn && !bIsOwn) return 1;
        if (!aIsOwn && bIsOwn) return -1;
        return (a.name || '').localeCompare(b.name || '');
    });

    const handleSaveSupplier = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const supplierData = {
            name: newSupplier.name || '',
            nit: newSupplier.nit || '',
            email: newSupplier.email || '',
            phone: newSupplier.phone || '',
            address: newSupplier.address || '',
            city: newSupplier.city || '',
            contact_person: newSupplier.contact_person || '',
            category: newSupplier.category || 'Insumos',
            payment_method: newSupplier.payment_method || '',
            payment_number: newSupplier.payment_number || '',
            status: newSupplier.status || 'ACTIVE'
        };

        try {
            if (editingSupplier) {
                const res = await updateSupplier(editingSupplier.id, supplierData);
                if (!res.success) throw new Error(res.error);
            } else {
                const res = await addSupplier(supplierData);
                if (!res.success) throw new Error(res.error);
            }

            await refreshData();
            setIsModalOpen(false);
            setEditingSupplier(null);
            setNewSupplier({ 
                name: '', nit: '', email: '', phone: '', address: '', city: '', 
                contact_person: '', category: 'Insumos', payment_method: '', payment_number: '' 
            });
            alert("¡Proveedor guardado con éxito!");
        } catch (err) {
            console.error("Error saving supplier:", err);
            alert("No se pudo guardar el proveedor: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    /* ── archive ─────────────────────────────────────────────────────── */
    const toggleArchive = async (s) => {
        const isCurrentlyArchived = s.status === 'Archived';
        try {
            setIsSaving(true);
            const res = await updateSupplier(s.id, { status: isCurrentlyArchived ? 'Active' : 'Archived' });
            if (!res.success) throw new Error(res.error);
            await refreshData();
        } catch (err) {
            alert('Error al procesar: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    /* ── delete ──────────────────────────────────────────────────────── */
    const handleDeleteSupplier = async (id) => {
        setIsSaving(true);
        try {
            const res = await deleteSupplier(id);
            if (!res.success) throw new Error(res.error);
            setConfirmDeleteId(null);
            await refreshData();
        } catch (err) {
            alert('Error al eliminar: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };


    const toggleMaterialAssociation = async (materialId) => {
        if (!activeCatalogSupplier) return;

        const currentItems = activeCatalogSupplier.associatedItems || [];
        const updatedItems = currentItems.includes(materialId)
            ? currentItems.filter(id => id !== materialId)
            : [...currentItems, materialId];

        try {
            const res = await updateSupplier(activeCatalogSupplier.id, { associated_items: updatedItems });
            if (res.success) {
                setActiveCatalogSupplier({ ...activeCatalogSupplier, associatedItems: updatedItems });
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
                    <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem' }}>Directorio centralizado ({filteredSuppliers.length} proveedores).</p>
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

                    <button 
                        onClick={() => setShowArchived(!showArchived)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.62rem 1.2rem', borderRadius: '12px', 
                            border: '1px solid #e2e8f0', background: showArchived ? '#64748b' : '#f8fafc', 
                            color: showArchived ? '#fff' : '#475569', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' 
                        }}
                    >
                        <ShoppingBag size={15} style={{ opacity: 0.7 }} /> {showArchived ? 'Activos' : 'Archivados'}
                    </button>

                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.3rem', borderRadius: '14px', gap: '0.2rem' }}>
                        <button 
                            onClick={() => setViewMode('grid')} 
                            style={{ 
                                padding: '0.55rem', borderRadius: '10px', border: 'none', 
                                background: viewMode === 'grid' ? '#fff' : 'transparent',
                                color: viewMode === 'grid' ? 'var(--color-primary)' : '#94a3b8',
                                cursor: 'pointer', display: 'flex', boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')} 
                            style={{ 
                                padding: '0.55rem', borderRadius: '10px', border: 'none', 
                                background: viewMode === 'list' ? '#fff' : 'transparent',
                                color: viewMode === 'list' ? 'var(--color-primary)' : '#94a3b8',
                                cursor: 'pointer', display: 'flex', boxShadow: viewMode === 'list' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            <ClipboardList size={18} />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setEditingSupplier(null);
                            setNewSupplier({ name: '', nit: '', email: '', phone: '', address: '', city: '', contact_person: '', category: 'Insumos' });
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

            {/* VIEW RENDERER */}
            {viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {filteredSuppliers.map(s => {
                        const isOwnCompany = s.is_own_company === true || (s.name || '').toLowerCase().includes('zeticas');
                        return (
                            <div key={s.id} style={{
                                background: isOwnCompany ? 'linear-gradient(135deg, #fff 0%, #f0f4f4 100%)' : '#fff',
                                padding: '1.8rem',
                                borderRadius: '24px',
                                border: isOwnCompany ? '2px solid var(--color-primary)' : '1px solid #f1f5f9',
                                boxShadow: isOwnCompany ? '0 10px 25px rgba(26, 54, 54, 0.1)' : '0 4px 15px rgba(0,0,0,0.02)',
                                transition: 'all 0.3s ease',
                                opacity: s.status === 'Archived' ? 0.7 : 1,
                                position: 'relative'
                            }} className="supplier-card">
                                {isOwnCompany && (
                                    <div style={{ 
                                        position: 'absolute', top: '-12px', right: '20px', 
                                        background: 'var(--color-primary)', color: '#fff', 
                                        padding: '4px 12px', borderRadius: '10px', fontSize: '0.65rem', 
                                        fontWeight: '900', letterSpacing: '0.5px' 
                                    }}>
                                        NUESTRA EMPRESA
                                    </div>
                                )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a3636', margin: 0 }}>{s.name}</h3>
                                <span style={{ 
                                    background: s.status === 'Archived' ? '#f1f5f9' : '#dcfce7', 
                                    padding: '4px 10px', 
                                    borderRadius: '20px', 
                                    fontSize: '0.65rem', 
                                    color: s.status === 'Archived' ? '#64748b' : '#166534', 
                                    fontWeight: '700' 
                                }}>
                                    {s.status === 'Archived' ? 'Archivado' : 'Activo'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                                <span style={{ background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', color: '#166534', border: '1px solid #dcfce7', fontWeight: '600' }}>
                                    {s.category || 'General'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>
                                    <Package size={12} /> {(s.associatedItems || []).length} Materias
                                </span>
                            </div>

                            <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <Building2 size={14} style={{ color: '#94a3b8' }} />
                                    <span style={{ fontWeight: '600' }}>NIT:</span> {s.nit || 'N/A'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <MapPin size={14} style={{ color: '#94a3b8' }} />
                                    <span>{s.address || 'Sin dirección'} {s.city ? `(${s.city})` : ''}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                        <Phone size={14} style={{ color: '#94a3b8' }} />
                                        <span>{s.phone || 'N/A'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <Mail size={14} style={{ color: '#94a3b8' }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                                    <User size={14} style={{ color: '#1a3636' }} />
                                    <span style={{ fontSize: '0.75rem' }}><b>Contacto:</b> {s.contact_person || 'No definido'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button onClick={() => setActiveCatalogSupplier(s)} style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', fontWeight: '700', color: '#fff', background: '#1a3636', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                    <ExternalLink size={14} /> Catálogo
                                </button>
                                <button onClick={() => { 
                                    setEditingSupplier(s); 
                                    setNewSupplier({
                                        name: '', nit: '', email: '', phone: '', address: '', city: '', contact_person: '', category: 'Insumos', payment_method: '', payment_number: '',
                                        ...s 
                                    }); 
                                    setIsModalOpen(true); 
                                }} style={{ padding: '0.55rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', color: '#64748b' }}>
                                    <Edit3 size={14} />
                                </button>
                                <button onClick={() => toggleArchive(s)} title={s.status === 'Archived' ? 'Restaurar' : 'Archivar'} style={{ padding: '0.55rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', color: '#64748b' }}>
                                    <Download size={14} style={{ transform: s.status === 'Archived' ? 'rotate(180deg)' : 'none' }} />
                                </button>
                                <button 
                                    onClick={() => {
                                        if (confirmDeleteId === s.id) {
                                            handleDeleteSupplier(s.id);
                                        } else {
                                            setConfirmDeleteId(s.id);
                                            setTimeout(() => setConfirmDeleteId(null), 3000);
                                        }
                                    }} 
                                    style={{ 
                                        padding: confirmDeleteId === s.id ? '0.55rem 0.8rem' : '0.55rem', 
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: '12px', 
                                        background: confirmDeleteId === s.id ? '#ef4444' : '#fff', 
                                        cursor: 'pointer', 
                                        color: confirmDeleteId === s.id ? '#fff' : '#ef4444', 
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        transition: 'all 0.2s', fontSize: '0.7rem', fontWeight: 800
                                    }}>
                                    <Trash2 size={14} /> {confirmDeleteId === s.id ? '¿BORRAR?' : ''}
                                </button>
                            </div>
                        </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Proveedor</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Categoría</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Contacto</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 1.2rem' }}>
                                        <div style={{ fontWeight: 800, color: '#1a3636', fontSize: '0.9rem' }}>{s.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>NIT: {s.nit || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.2rem' }}>
                                        <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                                            {s.category || 'General'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.2rem', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569' }}><Phone size={12} /> {s.phone || '-'}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.75rem' }}>{s.contact_person || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.2rem' }}>
                                        <span style={{ 
                                            background: s.status === 'Archived' ? '#f1f5f9' : '#dcfce7', 
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', 
                                            color: s.status === 'Archived' ? '#64748b' : '#166534', fontWeight: '700' 
                                        }}>
                                            {s.status === 'Archived' ? 'Archivado' : 'Activo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.2rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setActiveCatalogSupplier(s)} style={{ padding: '0.4rem', border: 'none', background: 'transparent', color: '#1a3636', cursor: 'pointer' }} title="Ver Catálogo"><ExternalLink size={16} /></button>
                                            <button onClick={() => { 
                                                setEditingSupplier(s); 
                                                setNewSupplier({ ...s }); 
                                                setIsModalOpen(true); 
                                            }} style={{ padding: '0.4rem', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}><Edit3 size={16} /></button>
                                            <button 
                                                onClick={() => {
                                                    if (confirmDeleteId === s.id) {
                                                        handleDeleteSupplier(s.id);
                                                    } else {
                                                        setConfirmDeleteId(s.id);
                                                        setTimeout(() => setConfirmDeleteId(null), 3000);
                                                    }
                                                }} 
                                                style={{ 
                                                    padding: '0.4rem', border: 'none', background: 'transparent', 
                                                    color: confirmDeleteId === s.id ? '#ef4444' : '#94a3b8', 
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                                    fontWeight: 800, fontSize: '0.7rem'
                                                }}>
                                                <Trash2 size={16} /> {confirmDeleteId === s.id ? 'BORRAR?' : ''}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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
                        <form onSubmit={handleSaveSupplier} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Nombre o Razón Social</label>
                                <input placeholder="Nombre" required value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>NIT / Identificación</label>
                                <input placeholder="NIT" required value={newSupplier.nit} onChange={(e) => setNewSupplier({ ...newSupplier, nit: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Categoría</label>
                                <select value={newSupplier.category} onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })} style={{ width: '100%', padding: '0.86rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', background: '#fff' }}>
                                    <option value="Materias Primas">Materias Primas</option>
                                    <option value="Insumos">Insumos</option>
                                    <option value="Empaque">Empaque</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Correo Electrónico</label>
                                <input placeholder="Email" type="email" value={newSupplier.email} onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Teléfono</label>
                                <input placeholder="Teléfono" value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Dirección</label>
                                <input placeholder="Dirección" value={newSupplier.address} onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Ciudad</label>
                                <input placeholder="Ciudad" value={newSupplier.city} onChange={(e) => setNewSupplier({ ...newSupplier, city: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Persona de Contacto</label>
                                <input placeholder="Nombre de contacto" value={newSupplier.contact_person} onChange={(e) => setNewSupplier({ ...newSupplier, contact_person: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Medio de Pago (Nequi, Banco, etc)</label>
                                <input placeholder="Ej: Nequi, Bancolombia" value={newSupplier.payment_method} onChange={(e) => setNewSupplier({ ...newSupplier, payment_method: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Número de Pago / Cuenta</label>
                                <input placeholder="Ej: 310..., Cuenta Ahorros..." value={newSupplier.payment_number} onChange={(e) => setNewSupplier({ ...newSupplier, payment_number: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', gridColumn: 'span 2' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: '#1a3636', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                                    {isSaving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            )}
        </div>
    );
};

export default Suppliers;
