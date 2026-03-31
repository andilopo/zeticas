import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Plus, Package, Save, X, ArrowUpRight, Search } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

const Inventory = () => {
    const { items, updateItem } = useBusiness();
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

    const pullSignals = (items || []).filter(item =>
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
            case 'CRITICAL': return '#ef4444';
            case 'LOW': return '#D4785A';
            default: return '#10b981';
        }
    };

    const StatusTooltip = ({ children }) => {
        const [show, setShow] = useState(false);
        return (
            <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
                {children}
                {show && (
                    <div style={{ position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '1rem', borderRadius: '12px', width: '250px', fontSize: '0.75rem', zIndex: 10000, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontWeight: '900', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.3rem' }}>POLÍTICA DE SEMÁFORO</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> <b>CRITICAL:</b> ≤ 50% de la meta
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4785A' }} /> <b>LOW:</b> ≤ 100% de la meta
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6 }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> <b>OPTIMAL:</b> {">"} meta (Ocultos)
                        </div>
                        <div style={{ marginTop: '0.6rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.65rem' }}>* Los niveles se definen individualmente en Data Maestra.</div>
                        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1e293b' }} />
                    </div>
                )}
            </div>
        );
    };

    const openInventoryForm = (type) => {
        setModalType(type);
        setEditData([...items]);
        setIsModalOpen(true);
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
                if (item.id && typeof item.id === 'string') {
                    await updateItem(item.id, { initial: item.initial });
                }
            }
            setIsModalOpen(false);
            setModalSearch('');
        } catch (err) {
            console.error("Error saving inventory:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const totalValueMP = items
        .filter(i => i.type === 'material')
        .reduce((acc, i) => acc + (getFinalStock(i) * (i.avgCost || 0)), 0);

    const totalValuePT = items
        .filter(i => i.type === 'product')
        .reduce((acc, i) => acc + (getFinalStock(i) * (i.price || 0)), 0);

    const deepTeal = "#023636";
    const institutionOcre = "#D4785A";
    const premiumSalmon = "#E29783";
    const glassWhite = "rgba(255, 255, 255, 0.85)";

    return (
        <div style={{ padding: '2rem', minHeight: '100vh', background: '#f8fafc', animation: 'fadeUp 0.6s ease-out' }}>
            
            {/* Header removed as it's redundant with the main layout */}

            {/* Valuation Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                    background: `linear-gradient(135deg, ${deepTeal} 0%, #037075 100%)`, 
                    padding: '1.5rem 2rem', 
                    borderRadius: '24px', 
                    color: '#fff',
                    boxShadow: `0 15px 35px ${deepTeal}20`,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}><Package size={120} /></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Valorización MP</span>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', lineHeight: 1, margin: '1rem 0' }}>
                           <span style={{ fontSize: '1.2rem', verticalAlign: 'top', marginRight: '4px', opacity: 0.4 }}>$</span>
                           {totalValueMP.toLocaleString()}
                        </div>
                        <button onClick={() => openInventoryForm('MP')} style={{ padding: '0.8rem 1.8rem', borderRadius: '14px', border: 'none', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', color: '#fff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem' }}>
                            <Plus size={16} /> GESTIONAR MP
                        </button>
                    </div>
                </div>

                <div style={{ 
                    background: '#fff', 
                    padding: '1.5rem 2rem', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(2, 54, 54, 0.05)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.02)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}><ArrowUpRight size={120} color={institutionOcre} /></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Valorización PT</span>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: deepTeal, letterSpacing: '-1px', lineHeight: 1, margin: '1rem 0' }}>
                           <span style={{ fontSize: '1.2rem', verticalAlign: 'top', marginRight: '4px', opacity: 0.2 }}>$</span>
                           {totalValuePT.toLocaleString()}
                        </div>
                        <button onClick={() => openInventoryForm('PT')} style={{ padding: '0.8rem 1.8rem', borderRadius: '14px', border: 'none', background: institutionOcre, color: '#fff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem' }}>
                            <Plus size={16} /> GESTIONAR PT
                        </button>
                    </div>
                </div>
            </div>

            {/* Critical Alerts Bar */}
            {pullSignals.length > 0 && (
                <div style={{ background: `linear-gradient(90deg, ${premiumSalmon} 0%, #B85B42 100%)`, padding: '1.2rem 2rem', borderRadius: '18px', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: `0 10px 30px ${premiumSalmon}20` }}>
                    <StatusTooltip>
                        <div style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'help' }}>
                            <AlertCircle size={22} />
                        </div>
                    </StatusTooltip>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: '900', letterSpacing: '-0.2px', marginBottom: '0.3rem' }}>Protocolo de Reabastecimiento Crítico</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {pullSignals.map(sig => (
                                <div key={sig.id} style={{ background: 'rgba(255,255,255,0.15)', padding: '0.6rem 1.2rem', borderRadius: '15px', fontSize: '0.85rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {sig.name.toUpperCase()} <span style={{ opacity: 0.7 }}>|</span> {getFinalStock(sig)} {sig.unit}
                                    <button onClick={() => handleDismissPull(sig.id)} style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', padding: '2px', opacity: 0.6 }}><X size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '900' }}>{pullSignals.length}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '900', opacity: 0.8, textTransform: 'uppercase' }}>Alertas</div>
                    </div>
                </div>
            )}

            {/* Assets Matrix Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: glassWhite, backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(2, 54, 54, 0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: deepTeal }}>Inventario MP</h3>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input value={searchMP} onChange={e => setSearchMP(e.target.value)} placeholder="Filtrar..." style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', border: '1px solid #f1f5f9', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900', outline: 'none', background: '#fcfcfc' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {items.filter(i => i.type === 'material' && i.name.toLowerCase().includes(searchMP.toLowerCase()) && getStatus(i) !== 'OPTIMAL').map(item => {
                            const status = getStatus(item);
                            const color = getStatusColor(status);
                            return (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.2rem', background: '#fff', borderRadius: '14px', border: '1px solid #f8fafc', transition: 'all 0.3s' }} className="inventory-row-hover">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${deepTeal}08`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: deepTeal }}><Package size={18} /></div>
                                        <div>
                                            <div style={{ fontWeight: '900', fontSize: '0.95rem', color: '#1e293b' }}>{item.name.toUpperCase()}</div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: '900', color: institutionOcre, marginTop: '2px' }}>{item.unit} | {item.sku}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: deepTeal }}>{getFinalStock(item)}</div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: '900', color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{status}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ background: glassWhite, backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(2, 54, 54, 0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: deepTeal }}>Inventario PT</h3>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input value={searchPT} onChange={e => setSearchPT(e.target.value)} placeholder="Filtrar..." style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', border: '1px solid #f1f5f9', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900', outline: 'none', background: '#fcfcfc' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {items.filter(i => i.type === 'product' && i.name.toLowerCase().includes(searchPT.toLowerCase()) && getStatus(i) !== 'OPTIMAL').map(item => {
                            const status = getStatus(item);
                            const color = getStatusColor(status);
                            return (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.2rem', background: '#fff', borderRadius: '14px', border: '1px solid #f8fafc', transition: 'all 0.3s' }} className="inventory-row-hover">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${institutionOcre}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: institutionOcre }}><ArrowUpRight size={18} /></div>
                                        <div>
                                            <div style={{ fontWeight: '900', fontSize: '0.95rem', color: '#1e293b' }}>{item.name.toUpperCase()}</div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: '900', color: deepTeal, marginTop: '2px', opacity: 0.6 }}>{item.safety} {item.unit} | {item.sku}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color }}>{getFinalStock(item)}</div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: '950', color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{status === 'OPTIMAL' ? 'STOCK OK' : status}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal de Gestión de Inventario (MP o PT según modalType) */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem' }}>
                    <div style={{ background: '#fff', borderRadius: '32px', width: '100%', maxWidth: '1100px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ padding: '1.5rem 2.5rem', background: modalType === 'MP' ? deepTeal : institutionOcre, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
                                    {modalType === 'MP' ? 'Maestro de Materias Primas e Insumos' : 'Maestro de Productos Terminados (PT)'}
                                </h3>
                                <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.85rem' }}>Gestiona el catálogo base y niveles de stock de seguridad.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                        </div>

                        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #f1f5f9', background: '#fcfcfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: '350px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input value={modalSearch} onChange={e => setModalSearch(e.target.value)} placeholder="Busca por nombre o SKU..." style={{ width: '100%', padding: '0.8rem 1.2rem 0.8rem 3rem', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff', fontWeight: '700', fontSize: '0.9rem' }} />
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                                * Para crear nuevos SKUs o cambiar unidades, dirígete a <b>Data Maestra / Catálogo</b>.
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2.5rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.8rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>
                                        <th style={{ padding: '0 1rem' }}>Nombre / SKU</th>
                                        <th style={{ padding: '0 1rem', width: '150px', textAlign: 'center' }}>Unidad Actual</th>
                                        <th style={{ padding: '0 1rem', width: '150px', textAlign: 'center' }}>Stock Físico (Ajuste)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editData.filter(i => 
                                        ((modalType === 'MP' && i.type === 'material') || (modalType === 'PT' && (i.type === 'product' || i.type === 'PT'))) &&
                                        (i.name.toLowerCase().includes(modalSearch.toLowerCase()) || (i.sku || '').toLowerCase().includes(modalSearch.toLowerCase()))
                                    ).map(item => (
                                        <tr key={item.id}>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                <div style={{ fontWeight: '800', color: deepTeal }}>{item.name.toUpperCase()}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.sku}</div>
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>
                                                {item.unit}
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                <input 
                                                    type="number" 
                                                    value={item.initial} 
                                                    onChange={e => handleEditChange(item.id, 'initial', e.target.value)} 
                                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', textAlign: 'center', fontWeight: '900', fontSize: '1.1rem', color: deepTeal }} 
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ padding: '1.5rem 2.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1.2rem' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '0.8rem 2rem', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}>DESCARTAR</button>
                            <button onClick={handleSave} disabled={isSaving} style={{ padding: '0.8rem 2.5rem', borderRadius: '14px', border: 'none', background: deepTeal, color: '#fff', fontWeight: '800', cursor: 'pointer', boxShadow: `0 10px 25px ${deepTeal}30`, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                {isSaving ? <RefreshCw size={20} className="spin" /> : <Save size={20} />}
                                {isSaving ? 'ACTUALIZANDO...' : 'SINCRO FÍSICA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Styles for Interactions */}
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                .inventory-row-hover:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.04); border-color: ${institutionOcre}40 !important; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.95; transform: scale(1.005); } 100% { opacity: 1; } }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Inventory;
