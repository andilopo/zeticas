import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Plus, Package, Save, X, ArrowUpRight, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useBusiness } from '../context/BusinessContext';

const Inventory = () => {
    const { items, setItems, refreshData } = useBusiness();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('MP'); // 'MP' or 'PT'
    const [editData, setEditData] = useState([]);
    const [modalSearch, setModalSearch] = useState('');
    const [searchMP, setSearchMP] = useState('');
    const [searchPT, setSearchPT] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [dismissedPulls, setDismissedPulls] = useState(() => {
        const saved = localStorage.getItem('zeticas_dismissed_pulls');
        return saved ? JSON.parse(saved) : [];
    });

    const handleDismissPull = (id) => {
        const newDismissed = [...dismissedPulls, id];
        setDismissedPulls(newDismissed);
        localStorage.setItem('zeticas_dismissed_pulls', JSON.stringify(newDismissed));
    };

    const getFinalStock = (item) => (item.initial || 0) + (item.purchases || 0) - (item.sales || 0);

    const pullSignals = items.filter(item =>
        getFinalStock(item) <= (item.safety || 0) && !dismissedPulls.includes(item.id)
    );

    const getStatus = (item) => {
        const stock = getFinalStock(item);
        if (stock <= (item.safety || 0) * 0.5) return 'CRITICAL';
        if (stock <= (item.safety || 0)) return 'LOW';
        return 'OPTIMAL';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CRITICAL': return '#e74c3c';
            case 'LOW': return '#f39c12';
            default: return 'var(--color-sage)';
        }
    };

    const openInventoryForm = (type) => {
        setModalType(type);
        setEditData([...items]);
        setIsModalOpen(true);
    };

    const handleAddItem = () => {
        const newItem = {
            id: 'TEMP_' + Date.now(),
            name: '',
            type: modalType === 'MP' ? 'material' : 'product',
            initial: 0,
            purchases: 0,
            sales: 0,
            safety: 0,
            unit: modalType === 'MP' ? 'kg' : 'und',
            avgCost: 0,
            price: 0,
            sku: '',
            isNew: true
        };
        setEditData([newItem, ...editData]);
    };

    const handleEditChange = (id, field, value) => {
        setEditData(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: field === 'name' || field === 'unit' || field === 'sku' ? value : (parseFloat(value) || 0) } : item
        ));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            for (const item of editData) {
                const dbData = {
                    name: item.name,
                    stock: item.initial,
                    min_stock_level: item.safety,
                    unit_measure: item.unit,
                    cost: item.avgCost,
                    price: item.price,
                    type: item.type === 'product' ? 'PT' : 'MP',
                    sku: item.sku || ('SKU-' + Math.random().toString(36).substr(2, 5).toUpperCase())
                };

                if (item.id && typeof item.id === 'string' && !item.id.startsWith('TEMP_')) {
                    // Update existing
                    await supabase.from('products').update(dbData).eq('id', item.id);
                } else if (item.isNew && item.name) {
                    // Insert new
                    await supabase.from('products').insert([dbData]);
                }
            }
            await refreshData();
            setIsModalOpen(false);
            setModalSearch('');
        } catch (err) {
            console.error("Error saving inventory:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Valuation Calculations
    const totalValueMP = items
        .filter(i => i.type === 'material')
        .reduce((acc, i) => acc + (getFinalStock(i) * (i.avgCost || 0)), 0);

    const totalValuePT = items
        .filter(i => i.type === 'product')
        .reduce((acc, i) => acc + (getFinalStock(i) * (i.price || 0)), 0);

    return (
        <div className="inventory-module" style={{ padding: '0 1rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Gestión JIT de Inventario (En Línea)</h2>
                    <button onClick={refreshData} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCw size={18} color="#64748b" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Sincronizar</span>
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                        <div>
                            <p style={{ color: '#1e293b', fontSize: '0.85rem', margin: 0, fontWeight: '700' }}>JUEGO DE INVENTARIO MP</p>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>Inv. Inicial + Compras - Producción = <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Inv. Final MP</span></p>
                        </div>
                        <button onClick={() => openInventoryForm('MP')} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={14} /> CARGAR INICIO MP
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff7ed', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                        <div>
                            <p style={{ color: '#9a3412', fontSize: '0.85rem', margin: 0, fontWeight: '700' }}>JUEGO DE INVENTARIO PT</p>
                            <p style={{ color: '#c2410c', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>Inv. Inicial PT + Producción - Pedidos = <span style={{ color: '#e67e22', fontWeight: 'bold' }}>Inv. Final PT</span></p>
                        </div>
                        <button onClick={() => openInventoryForm('PT')} style={{ padding: '0.6rem 1.2rem', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={14} /> CARGAR INICIO PT
                        </button>
                    </div>
                </div>
            </header>

            {/* Alerts */}
            {pullSignals.length > 0 && (
                <div style={{ background: '#fff5f5', borderLeft: '4px solid #e74c3c', padding: '1.2rem 1.5rem', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2.5rem' }}>
                    <AlertCircle color="#e74c3c" size={24} />
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c53030', fontWeight: 'bold' }}>Señales de Reposición ({pullSignals.length})</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {pullSignals.map(sig => (
                                <span key={sig.id} style={{ background: '#fff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fed7d7', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {sig.name} ({getFinalStock(sig)})
                                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleDismissPull(sig.id)} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Board MP */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={22} color="var(--color-primary)" /> Materias Primas</h3>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>VALORIZACIÓN COSTO</div>
                            <div style={{ fontWeight: '900', color: 'var(--color-primary)' }}>${totalValueMP.toLocaleString()}</div>
                        </div>
                    </div>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                        <input placeholder="Filtrar MP..." value={searchMP} onChange={(e) => setSearchMP(e.target.value)} style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {items.filter(i => i.type === 'material' && i.name.toLowerCase().includes(searchMP.toLowerCase())).map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{getFinalStock(item)} {item.unit} | Costo: ${item.avgCost?.toLocaleString()}</div>
                                </div>
                                <span style={{ fontSize: '0.6rem', padding: '4px 8px', borderRadius: '20px', background: getStatusColor(getStatus(item)), color: '#fff' }}>{getStatus(item)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Board PT */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowUpRight size={22} color="#e67e22" /> Producto Terminado</h3>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>VALORIZACIÓN VENTA</div>
                            <div style={{ fontWeight: '900', color: '#e67e22' }}>${totalValuePT.toLocaleString()}</div>
                        </div>
                    </div>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                        <input placeholder="Filtrar PT..." value={searchPT} onChange={(e) => setSearchPT(e.target.value)} style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {items.filter(i => i.type === 'product' && i.name.toLowerCase().includes(searchPT.toLowerCase())).map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{getFinalStock(item)} / {item.safety} {item.unit} | Precio: ${item.price?.toLocaleString()}</div>
                                </div>
                                <span style={{ fontWeight: 'bold', color: getStatusColor(getStatus(item)) }}>{getFinalStock(item)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Setup */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Cargue Maestro {modalType} (Sincronización Nube)</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none' }}><X /></button>
                        </div>
                        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                            <input placeholder="Buscar en la lista..." value={modalSearch} onChange={(e) => setModalSearch(e.target.value)} style={{ flex: 1, padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <button onClick={handleAddItem} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>+ Nuevo Ítem</button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                                    <tr>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>Nombre</th>
                                        <th style={{ padding: '0.8rem' }}>Stock Inicial</th>
                                        <th style={{ padding: '0.8rem' }}>Unidad</th>
                                        <th style={{ padding: '0.8rem' }}>S. Seguridad</th>
                                        {modalType === 'MP' ? <th>Costo</th> : <th>Precio Venta</th>}
                                        <th>SKU</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editData.filter(i => (modalType === 'MP' ? i.type === 'material' : i.type === 'product') && i.name.toLowerCase().includes(modalSearch.toLowerCase())).map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.5rem' }}><input value={item.name} onChange={(e) => handleEditChange(item.id, 'name', e.target.value)} style={{ width: '100%', padding: '0.4rem', border: 'none', background: 'transparent' }} /></td>
                                            <td style={{ padding: '0.5rem' }}><input type="number" value={item.initial} onChange={(e) => handleEditChange(item.id, 'initial', e.target.value)} style={{ width: '60px', padding: '0.4rem', border: 'none', background: '#f1f5f9', borderRadius: '4px' }} /></td>
                                            <td style={{ padding: '0.5rem' }}><input value={item.unit} onChange={(e) => handleEditChange(item.id, 'unit', e.target.value)} style={{ width: '40px', padding: '0.4rem', border: 'none', textAlign: 'center' }} /></td>
                                            <td style={{ padding: '0.5rem' }}><input type="number" value={item.safety} onChange={(e) => handleEditChange(item.id, 'safety', e.target.value)} style={{ width: '60px', padding: '0.4rem', border: 'none', background: '#f1f5f9', borderRadius: '4px' }} /></td>
                                            <td style={{ padding: '0.5rem' }}><input type="number" value={modalType === 'MP' ? item.avgCost : item.price} onChange={(e) => handleEditChange(item.id, modalType === 'MP' ? 'avgCost' : 'price', e.target.value)} style={{ width: '100px', padding: '0.4rem', border: 'none', background: '#f1f5f9', borderRadius: '4px' }} /></td>
                                            <td style={{ padding: '0.5rem' }}><input value={item.sku} onChange={(e) => handleEditChange(item.id, 'sku', e.target.value)} style={{ width: '100px', padding: '0.4rem', border: 'none', background: '#f1f5f9', borderRadius: '4px' }} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '0.8rem 2rem', borderRadius: '12px', border: '1px solid #ddd', background: '#fff' }}>Cancelar</button>
                            <button onClick={handleSave} disabled={isSaving} style={{ padding: '0.8rem 2rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 'bold' }}>
                                {isSaving ? 'Guardando...' : 'Sincronizar con Nube'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
