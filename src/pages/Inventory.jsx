import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Plus, Package, Save, X, ArrowRight, ArrowUpRight, TrendingDown, TrendingUp, Search } from 'lucide-react';

const Inventory = ({ items, setItems }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('MP'); // 'MP' or 'PT'
    const [editData, setEditData] = useState([]);
    const [modalSearch, setModalSearch] = useState('');
    const [searchMP, setSearchMP] = useState('');
    const [searchPT, setSearchPT] = useState('');

    const getFinalStock = (item) => (item.initial || 0) + (item.purchases || 0) - (item.sales || 0);

    const pullSignals = items.filter(item => getFinalStock(item) <= (item.safety || 0));

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
            id: Date.now(),
            name: '',
            type: modalType === 'MP' ? 'material' : 'product',
            initial: 0,
            purchases: 0,
            sales: 0,
            safety: 0,
            unit: modalType === 'MP' ? 'kg' : 'und',
            avgCost: 0,
            unitsPerBox: modalType === 'PT' ? 12 : 0,
            unitsPerLot: modalType === 'PT' ? 100 : 0,
            barcode: '',
            isNew: true
        };
        setEditData([newItem, ...editData]);
    };

    const handleSave = (e) => {
        e.preventDefault();
        setItems(editData.map(({ isNew, ...rest }) => rest));
        setIsModalOpen(false);
        setModalSearch('');
    };

    const handleEditChange = (id, field, value) => {
        setEditData(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: field === 'name' || field === 'unit' ? value : (parseFloat(value) || 0) } : item
        ));
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
                <h2 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', marginBottom: '1.5rem', margin: 0 }}>Gestión JIT de Inventario</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                        <div>
                            <p style={{ color: '#1e293b', fontSize: '0.85rem', margin: 0, fontWeight: '700' }}>
                                JUEGO DE INVENTARIO MP
                            </p>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>
                                Inv. Inicial + Compras = Disponible - Producción = <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Inv. Final MP</span>
                            </p>
                        </div>
                        <button
                            onClick={() => openInventoryForm('MP')}
                            style={{ fontSize: '0.75rem', padding: '0.6rem 1.2rem', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(26, 54, 54, 0.1)' }}
                        >
                            <Plus size={14} /> CARGAR INVENTARIO INICIAL MP
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff7ed', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                        <div>
                            <p style={{ color: '#9a3412', fontSize: '0.85rem', margin: 0, fontWeight: '700' }}>
                                JUEGO DE INVENTARIO PT
                            </p>
                            <p style={{ color: '#c2410c', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>
                                Inv. Inicial PT + Producción = Disp. para venta - Pedidos = <span style={{ color: '#e67e22', fontWeight: 'bold' }}>Inv. Final PT</span>
                            </p>
                        </div>
                        <button
                            onClick={() => openInventoryForm('PT')}
                            style={{ fontSize: '0.75rem', padding: '0.6rem 1.2rem', background: '#e67e22', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(230, 126, 34, 0.1)' }}
                        >
                            <Plus size={14} /> CARGAR INVENTARIO INICIAL PT
                        </button>
                    </div>
                </div>
            </header>

            {/* Dynamic Pull Signals Alert */}
            {pullSignals.length > 0 && (
                <div style={{
                    background: '#fff5f5',
                    borderLeft: '4px solid #e74c3c',
                    padding: '1.2rem 1.5rem',
                    borderRadius: '0 8px 8px 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: '2.5rem',
                    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.08)'
                }}>
                    <AlertCircle color="#e74c3c" size={24} style={{ marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                        <strong style={{ color: '#c53030', display: 'block', marginBottom: '0.3rem' }}>Señal de Pull detectada ({pullSignals.length}):</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {pullSignals.map(sig => (
                                <span key={sig.id} style={{ fontSize: '0.85rem', background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fed7d7', color: '#742a2a' }}>
                                    {sig.name} ({getFinalStock(sig)} {sig.unit})
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Material Board */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: '#f0f4f4', padding: '0.6rem', borderRadius: '12px', color: 'var(--color-primary)' }}><Package size={22} /></div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>Insumos & MP</h3>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.242rem', fontWeight: '900', color: '#94a3b8' }}>VALORIZACIÓN TOTAL</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--color-primary)' }}>${totalValueMP.toLocaleString()}</div>
                        </div>
                    </div>

                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Buscar insumo o MP..."
                            value={searchMP}
                            onChange={(e) => setSearchMP(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem' }}
                        />
                        <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {items.filter(i => i.type === 'material' && i.name.toLowerCase().includes(searchMP.toLowerCase())).map(item => {
                            const stock = getFinalStock(item);
                            const status = getStatus(item);
                            const itemValue = stock * (item.avgCost || 0);
                            return (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1.2rem',
                                    background: '#f8fafc',
                                    borderRadius: '16px',
                                    border: '1px solid #f1f5f9',
                                    transition: 'transform 0.2s ease'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                            <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#334155' }}>{item.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>MP-{item.id}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                                            <span>Stock: <strong style={{ color: '#1e293b' }}>{stock} {item.unit}</strong></span>
                                            <span>Cost: <strong>${(item.avgCost || 0).toLocaleString()}</strong></span>
                                            <span>Total: <strong>${itemValue.toLocaleString()}</strong></span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            fontSize: '0.6rem',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            background: getStatusColor(status),
                                            color: '#fff',
                                            fontWeight: '800'
                                        }}>
                                            {status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => openInventoryForm('MP')}
                        style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem', borderRadius: '12px', background: '#f8fafc', color: 'var(--color-primary)', border: '1px dashed #cbd5e1', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                        + Ajustar Inventario Inicial MP
                    </button>
                </div>

                {/* Products Board */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: '#fef7ed', padding: '0.6rem', borderRadius: '12px', color: '#e67e22' }}><ArrowUpRight size={22} /></div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>Producto Terminado</h3>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8' }}>VALORIZACIÓN TOTAL</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#e67e22' }}>${totalValuePT.toLocaleString()}</div>
                        </div>
                    </div>

                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Buscar producto terminado..."
                            value={searchPT}
                            onChange={(e) => setSearchPT(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid #ffedd5', background: '#fffcf8', outline: 'none', fontSize: '0.85rem' }}
                        />
                        <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#fbabd2' }} color="#fb923c" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {items.filter(i => i.type === 'product' && i.name.toLowerCase().includes(searchPT.toLowerCase())).map(item => {
                            const stock = getFinalStock(item);
                            const status = getStatus(item);
                            const percentage = Math.min((stock / (item.safety || 1)) * 100, 100);
                            const itemValue = stock * (item.price || 0);

                            return (
                                <div key={item.id} style={{ padding: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1e293b' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                Costo (PPC): ${(item.avgCost || 0).toLocaleString()} | Precio Publico: ${(item.price || 0).toLocaleString()} | Total Valor (Venta): ${itemValue.toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: getStatusColor(status) }}>{stock}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}> / {item.safety} {item.unit}</span>
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            background: getStatusColor(status),
                                            borderRadius: '10px',
                                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => openInventoryForm('PT')}
                        style={{ width: '100%', marginTop: '2.5rem', padding: '0.8rem', borderRadius: '12px', background: '#fef7ed', color: '#e67e22', border: '1px dashed #ffedd5', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                        + Ajustar Inventario Inicial PT
                    </button>
                </div>
            </div>

            {/* Inventory Setup Modal Form */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(26, 54, 54, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '1000px',
                        maxHeight: '90vh',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary)' }}>
                                    Cargue de Inventario Inicial {modalType === 'MP' ? 'MP' : 'PT'}
                                </h3>
                                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                    {modalType === 'MP'
                                        ? 'Configuración de materias primas e insumos (inicial + Compras - Producción)'
                                        : 'Configuración de productos terminados (inicial + Producción - Pedidos)'}
                                </p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); setModalSearch(''); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#666' }}><X size={20} /></button>
                        </div>

                        <div style={{ padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder={`Buscar por nombre de ${modalType === 'MP' ? 'materia prima' : 'producto'}...`}
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                    style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                                />
                                <Package size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            </div>
                            <button
                                onClick={handleAddItem}
                                style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Plus size={16} /> Añadir Nuevo {modalType === 'MP' ? 'Insumo' : 'Producto'}
                            </button>
                        </div>

                        <div style={{ padding: '0 2rem 2rem', overflowY: 'auto', flex: 1 }}>
                            <form onSubmit={handleSave}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: modalType === 'MP' ? '2fr 0.8fr 0.6fr 0.8fr 1.4fr 1fr 0.8fr' : '2fr 0.8fr 0.6fr 0.8fr 1.4fr 0.7fr 0.7fr 0.8fr 0.8fr',
                                    gap: '1rem',
                                    padding: '1.2rem 1rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    color: '#64748b',
                                    textTransform: 'uppercase',
                                    position: 'sticky',
                                    top: 0,
                                    background: '#fff',
                                    zIndex: 10,
                                    borderBottom: '2px solid #f1f5f9'
                                }}>
                                    <span>{modalType === 'MP' ? 'Insumo / MP' : 'Producto Terminado'}</span>
                                    <span>Stock inicial</span>
                                    <span>Unidad</span>
                                    <span>Stock Seguridad</span>
                                    <span>{modalType === 'MP' ? 'Compras / Producción' : 'Producción / Pedidos'}</span>
                                    {modalType === 'MP' && <span>Costo Inicial</span>}
                                    {modalType === 'PT' && <span title="Unidades por Caja">Unid. x Caja</span>}
                                    {modalType === 'PT' && <span title="Unidades por Lote de Producción">Unid. x Lote</span>}
                                    {modalType === 'PT' && <span>Precio Venta</span>}
                                    <span>INV. FINAL</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                    {editData
                                        .filter(item => modalType === 'MP' ? item.type === 'material' : item.type === 'product')
                                        .filter(item => item.name.toLowerCase().includes(modalSearch.toLowerCase()))
                                        .map(item => (
                                            <div key={item.id} style={{
                                                display: 'grid',
                                                gridTemplateColumns: modalType === 'MP' ? '2fr 0.8fr 0.6fr 0.8fr 1.4fr 1fr 0.8fr' : '2fr 0.8fr 0.6fr 0.8fr 1.4fr 0.7fr 0.7fr 0.8fr 0.8fr',
                                                gap: '1rem',
                                                padding: '0.85rem 1rem',
                                                background: item.isNew ? '#fffbeb' : '#f8fafc',
                                                borderRadius: '8px',
                                                alignItems: 'center',
                                                border: item.isNew ? '1px solid #fde68a' : '1px solid #e2e8f0'
                                            }}>
                                                {item.isNew ? (
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) => handleEditChange(item.id, 'name', e.target.value)}
                                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #fbbf24', fontSize: '0.85rem', background: '#fff' }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#334155' }}>{item.name}</span>
                                                )}

                                                <input
                                                    type="number"
                                                    value={item.initial}
                                                    onChange={(e) => handleEditChange(item.id, 'initial', e.target.value)}
                                                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.9rem' }}
                                                />

                                                <span style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>{item.unit}</span>

                                                <input
                                                    type="number"
                                                    value={item.safety}
                                                    onChange={(e) => handleEditChange(item.id, 'safety', e.target.value)}
                                                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.9rem' }}
                                                />

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <span style={{ position: 'absolute', left: '6px', top: '-14px', fontSize: '0.6rem', color: '#10b981', fontWeight: 'bold' }}>{modalType === 'MP' ? 'Compras' : 'Producción'}</span>
                                                        <input
                                                            type="number"
                                                            value={item.purchases}
                                                            readOnly
                                                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '100%', background: '#f1f5f9', color: '#64748b' }}
                                                        />
                                                    </div>
                                                    <div style={{ position: 'relative' }}>
                                                        <span style={{ position: 'absolute', left: '6px', top: '-14px', fontSize: '0.6rem', color: '#ef4444', fontWeight: 'bold' }}>{modalType === 'MP' ? 'Producción' : 'Pedidos'}</span>
                                                        <input
                                                            type="number"
                                                            value={item.sales}
                                                            readOnly
                                                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '100%', background: '#f1f5f9', color: '#64748b' }}
                                                        />
                                                    </div>
                                                </div>

                                                {modalType === 'MP' && (
                                                    <input
                                                        type="number"
                                                        value={item.avgCost}
                                                        onChange={(e) => handleEditChange(item.id, 'avgCost', e.target.value)}
                                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.9rem', fontWeight: 'bold' }}
                                                    />
                                                )}

                                                {modalType === 'PT' && (
                                                    <input
                                                        type="number"
                                                        value={item.unitsPerBox}
                                                        onChange={(e) => handleEditChange(item.id, 'unitsPerBox', e.target.value)}
                                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.9rem' }}
                                                    />
                                                )}

                                                {modalType === 'PT' && (
                                                    <input
                                                        type="number"
                                                        value={item.unitsPerLot}
                                                        onChange={(e) => handleEditChange(item.id, 'unitsPerLot', e.target.value)}
                                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.9rem', color: '#0369a1', fontWeight: 'bold' }}
                                                    />
                                                )}

                                                {modalType === 'PT' && (
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => handleEditChange(item.id, 'price', e.target.value)}
                                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.9rem', fontWeight: 'bold', color: '#16a34a' }}
                                                    />
                                                )}

                                                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1rem', color: 'var(--color-primary)', background: '#f8fafc', padding: '0.4rem', borderRadius: '4px' }}>
                                                    {getFinalStock(item)}
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                <div style={{ marginTop: '2.5rem', padding: '1.5rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#fff', position: 'sticky', bottom: '-2rem', zIndex: 10 }}>
                                    <button type="button" onClick={() => { setIsModalOpen(false); setModalSearch(''); }} style={{ padding: '0.8rem 2rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: '500' }}>Cancelar</button>
                                    <button type="submit" style={{ padding: '0.8rem 2rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Save size={18} /> Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
