import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useBusiness } from '../context/BusinessContext';
import {
    Clock,
    Search,
    CheckCircle2,
    Activity,
    Package,
    X,
    ShoppingCart,
    Zap,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Send,
    ArrowRight
} from 'lucide-react';

const Production = () => {
    const { orders, items, setItems, recipes, refreshData, providers } = useBusiness();
    const [explosionPreview, setExplosionPreview] = useState(null);
    const [odpSettings, setOdpSettings] = useState(() => {
        const saved = localStorage.getItem('zeticas_odp_settings');
        return saved ? JSON.parse(saved) : {};
    });

    const [confModal, setConfModal] = useState({ show: false, odp: null });
    const [mpConfModal, setMpConfModal] = useState({ show: false, odp: null, materials: [] });
    const [searchQuery, setSearchQuery] = useState('');
    const [isGeneratingOC, setIsGeneratingOC] = useState(false);

    const updateOdp = (sku, field, value) => {
        const newSettings = {
            ...odpSettings,
            [sku]: { ...(odpSettings[sku] || {}), [field]: value }
        };
        setOdpSettings(newSettings);
        localStorage.setItem('zeticas_odp_settings', JSON.stringify(newSettings));

        if (field === 'end' && value && !newSettings[sku]?.inventorySynced) {
            const odp = odpQueue.find(o => o.sku === sku);
            if (odp) {
                setConfModal({ show: true, odp: { ...odp, finalQty: odp.finalQty } });
            }
        }

        if (field === 'start' && value && !newSettings[sku]?.mpSynced) {
            const odp = odpQueue.find(o => o.sku === sku);
            const recipe = recipes[sku] || [];
            if (odp && recipe.length > 0) {
                const materials = recipe.map(r => ({
                    ...r,
                    totalQty: (r.qty * (Number(odp.finalQty) || 0)).toFixed(2)
                }));
                setMpConfModal({ show: true, odp: { ...odp, finalQty: odp.finalQty }, materials });
            } else if (odp && recipe.length === 0) {
                updateOdp(sku, 'mpSynced', true);
            }
        }
    };

    const handleMPSync = async (odp, materials) => {
        try {
            for (const m of materials) {
                const item = items.find(i => i.name === m.name);
                if (item) {
                    const newStock = (item.initial || 0) - Number(m.totalQty);
                    await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
                }
            }
            const newSettings = { ...odpSettings, [odp.sku]: { ...(odpSettings[odp.sku] || {}), mpSynced: true } };
            setOdpSettings(newSettings);
            localStorage.setItem('zeticas_odp_settings', JSON.stringify(newSettings));
            await refreshData();
            setMpConfModal({ show: false, odp: null, materials: [] });
        } catch (err) {
            console.error("Error syncing MP:", err);
        }
    };

    const handleInventorySync = async (odp) => {
        try {
            const item = items.find(i => i.name === odp.sku);
            if (item) {
                const newStock = (item.initial || 0) + Number(odp.finalQty);
                await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
            }
            const newSettings = { ...odpSettings, [odp.sku]: { ...(odpSettings[odp.sku] || {}), inventorySynced: true } };
            setOdpSettings(newSettings);
            localStorage.setItem('zeticas_odp_settings', JSON.stringify(newSettings));
            await refreshData();
            setConfModal({ show: false, odp: null });
        } catch (err) {
            console.error("Error syncing PT:", err);
        }
    };

    const pendingOrders = useMemo(() => orders.filter(o => o.status === 'En Producción' || o.status === 'En Producción (Iniciada)'), [orders]);

    const odpQueue = useMemo(() => {
        const groups = {};
        pendingOrders.forEach(order => {
            order.items.forEach(item => {
                const sku = item.name;
                if (!groups[sku]) groups[sku] = { sku, relatedOrders: [], totalRequested: 0 };
                groups[sku].relatedOrders.push(order);
                groups[sku].totalRequested += item.quantity;
            });
        });

        return Object.values(groups).map((group, index) => {
            const product = items.find(i => i.name === group.sku);
            const inventoryPT = product ? (product.initial || 0) + (product.purchases || 0) - (product.sales || 0) : 0;
            const safetyStock = product?.safety || 0;
            const calculatedQty = Math.max(0, group.totalRequested - inventoryPT + safetyStock);
            const settings = odpSettings[group.sku] || {};
            const finalQty = settings.customQty !== undefined ? settings.customQty : calculatedQty;

            let status = { text: 'Programada', color: '#fee2e2', textColor: '#ef4444' };
            if (settings.start) status = { text: 'En Producción', color: '#fef3c7', textColor: '#d97706' };
            if (settings.end) status = { text: 'Finalizada', color: '#dcfce7', textColor: '#16a34a' };

            return {
                ...group,
                odpId: `ODP-${(index + 1).toString().padStart(3, '0')}`,
                inventoryPT,
                safetyStock,
                calculatedQty,
                finalQty,
                settings,
                status
            };
        });
    }, [pendingOrders, items, odpSettings]);

    const filteredOdpQueue = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return odpQueue.filter(odp => odp.odpId.toLowerCase().includes(query) || odp.sku.toLowerCase().includes(query));
    }, [odpQueue, searchQuery]);

    const handleGlobalExplosion = () => {
        const materialRequirements = {};
        odpQueue.forEach(odp => {
            const recipe = recipes[odp.sku];
            if (recipe) {
                recipe.forEach(ing => {
                    const matInfo = items.find(i => i.id === ing.id || i.name === ing.name);
                    const matId = matInfo?.id || ing.id;
                    const matName = matInfo?.name || ing.name;

                    if (!materialRequirements[matName]) {
                        materialRequirements[matName] = {
                            id: matId,
                            name: matName,
                            required: 0,
                            stock: matInfo ? (matInfo.initial + (matInfo.purchases || 0) - (matInfo.sales || 0)) : 0,
                            safety: matInfo?.safety || 0,
                            unit: matInfo?.unit || 'und',
                            cost: matInfo?.avgCost || 0
                        };
                    }
                    materialRequirements[matName].required += ing.qty * Number(odp.finalQty);
                });
            }
        });
        setExplosionPreview(Object.values(materialRequirements));
    };

    const handlePreviewAndSendOC = async () => {
        setIsGeneratingOC(true);
        try {
            // Group by supplier - for now, we'll assign the first supplier that provides the material or 'Proveedor General'
            const materialsToBuy = explosionPreview.filter(m => (m.required - m.stock + m.safety) > 0);

            // Logic to group items by supplier (mock or simplified)
            const groupedBySupplier = {};

            for (const m of materialsToBuy) {
                const toBuy = Math.max(0, m.required - m.stock + m.safety);
                // Try to find a supplier that provides this material from catalog - simplified: use a random one or generic
                const supplier = providers[0] || { id: 'generic', name: 'Proveedor General' };
                const sId = supplier.id;

                if (!groupedBySupplier[sId]) {
                    groupedBySupplier[sId] = {
                        supplier_id: sId,
                        supplier_name: supplier.name,
                        items: [],
                        total: 0
                    };
                }

                const itemTotal = toBuy * m.cost;
                groupedBySupplier[sId].items.push({
                    raw_material_id: m.id,
                    name: m.name,
                    quantity: toBuy,
                    unit_cost: m.cost,
                    total_cost: itemTotal
                });
                groupedBySupplier[sId].total += itemTotal * 1.19; // Including estimated IVA
            }

            // Create POs in Supabase
            for (const sId in groupedBySupplier) {
                const poData = groupedBySupplier[sId];
                const { data: newPO, error: poErr } = await supabase.from('purchases').insert({
                    po_number: `OC-${Math.floor(1000 + Math.random() * 9000)}`,
                    supplier_id: poData.supplier_id !== 'generic' ? poData.supplier_id : null,
                    total_cost: poData.total,
                    status: 'ENVIADA',
                    payment_status: 'Pendiente',
                    associated_orders: odpQueue.map(o => o.odpId).join(', ')
                }).select().single();

                if (!poErr && newPO) {
                    const itemsToInsert = poData.items.map(i => ({
                        purchase_id: newPO.id,
                        raw_material_id: i.raw_material_id,
                        quantity: i.quantity,
                        unit_cost: i.unit_cost,
                        total_cost: i.total_cost
                    }));
                    await supabase.from('purchase_items').insert(itemsToInsert);
                }
            }

            alert("Órdenes de Compra generadas exitosamente basadas en la explosión de materiales.");
            setExplosionPreview(null);
            await refreshData();
        } catch (err) {
            console.error("Error generating OCs:", err);
            alert("Error al generar las órdenes de compra.");
        } finally {
            setIsGeneratingOC(false);
        }
    };

    const totalEstimatedOCs = useMemo(() => {
        if (!explosionPreview) return 0;
        return explosionPreview.reduce((acc, m) => {
            const toBuy = Math.max(0, m.required - m.stock + m.safety);
            return acc + (toBuy * m.cost * 1.19); // Est. total with IVA
        }, 0);
    }, [explosionPreview]);

    return (
        <div className="production-module" style={{ padding: '0 1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Módulo de Producción (En Línea)</h2>
                    <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem' }}>Seguimiento de órdenes de producción sincronizado con la nube.</p>
                </div>
                <button onClick={handleGlobalExplosion} style={{ background: '#ea580c', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShoppingCart size={18} /> Explosionar Materiales
                </button>
            </header>

            <section style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="text" placeholder="Buscar por ODP o SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '15px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
            </section>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '0.7rem', color: '#94a3b8' }}>
                            <th style={{ padding: '1rem' }}>ODP</th>
                            <th style={{ padding: '1rem' }}>SKU</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>CANTIDAD</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>INICIO</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>FIN</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>ESTADO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOdpQueue.map(odp => (
                            <tr key={odp.odpId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{odp.odpId}</td>
                                <td style={{ padding: '1rem' }}>{odp.sku}</td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <input type="number" value={odp.finalQty} onChange={(e) => updateOdp(odp.sku, 'customQty', e.target.value)} style={{ width: '60px', textAlign: 'center', border: '1px solid #eee', borderRadius: '4px' }} />
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <input type="datetime-local" value={odp.settings.start || ''} onChange={(e) => updateOdp(odp.sku, 'start', e.target.value)} style={{ fontSize: '0.75rem' }} />
                                    {odp.settings.mpSynced && <div style={{ color: '#16a34a', fontSize: '0.6rem' }}>✓ MP Descontada</div>}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <input type="datetime-local" value={odp.settings.end || ''} onChange={(e) => updateOdp(odp.sku, 'end', e.target.value)} style={{ fontSize: '0.75rem' }} />
                                    {odp.settings.inventorySynced && <div style={{ color: '#16a34a', fontSize: '0.6rem' }}>✓ PT Cargado</div>}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', background: odp.status.color, color: odp.status.textColor }}>{odp.status.text}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Explosión de Materiales - BOM Preview */}
            {explosionPreview && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26, 54, 54, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', borderRadius: '28px', width: '90%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

                        <header style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', padding: '0.8rem', borderRadius: '16px' }}>
                                    <ShoppingCart size={28} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: '#1A3636' }}>Previsualización de Órdenes (BOM)</h3>
                                    <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Revisa, ajusta cantidades y proveedores antes de generar las Órdenes de Compra.</p>
                                </div>
                            </div>
                            <button onClick={() => setExplosionPreview(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        </header>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'grid', gap: '1rem' }}>
                            {explosionPreview.map((m, idx) => {
                                const toBuy = Math.max(0, m.required - m.stock + m.safety);
                                return (
                                    <div key={idx} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '20px', padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.8rem', borderRadius: '14px' }}>
                                                <Package size={22} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>{m.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                                                    Requerido: <strong>{m.required.toFixed(1)} {m.unit}</strong> |
                                                    Stock: <strong>{m.stock.toFixed(1)} {m.unit}</strong> |
                                                    Safety: <strong>{m.safety} {m.unit}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                            <div style={{
                                                background: toBuy > 0 ? '#ea580c' : 'rgba(234, 88, 12, 0.05)',
                                                padding: '0.8rem 1.2rem',
                                                borderRadius: '16px',
                                                border: toBuy > 0 ? '1px solid #ea580c' : '1px solid rgba(234, 88, 12, 0.2)',
                                                transition: 'all 0.3s'
                                            }}>
                                                <div style={{ fontSize: '0.65rem', fontWeight: '900', color: toBuy > 0 ? '#fff' : '#ea580c', textTransform: 'uppercase', marginBottom: '0.2rem' }}>A COMPRAR</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: toBuy > 0 ? '#fff' : '#ea580c' }}>{toBuy.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>{m.unit}</span></div>
                                            </div>
                                            <ChevronDown size={20} color="#cbd5e1" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <footer style={{ padding: '2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>Total Estimado OCs:</div>
                                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1A3636' }}>${totalEstimatedOCs.toLocaleString()}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setExplosionPreview(null)} style={{ padding: '0.8rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar y Cancelar</button>
                                <button style={{ padding: '0.8rem 1.5rem', borderRadius: '16px', border: '1px solid var(--color-primary)', background: '#fff', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <Zap size={18} /> Mover a Producción
                                </button>
                                <button
                                    onClick={handlePreviewAndSendOC}
                                    disabled={isGeneratingOC}
                                    style={{
                                        padding: '0.8rem 2rem',
                                        borderRadius: '16px',
                                        border: 'none',
                                        background: '#ea580c',
                                        color: '#fff',
                                        fontWeight: '900',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.8rem',
                                        boxShadow: '0 8px 16px rgba(234, 88, 12, 0.2)',
                                        transition: 'transform 0.2s'
                                    }}>
                                    {isGeneratingOC ? 'PROCESANDO...' : 'Previsualizar OC y Enviar'} <Send size={18} />
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}

            {/* Synced confirmation modals */}
            {mpConfModal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', maxWidth: '500px', width: '90%' }}>
                        <h3>Confirmar Consumo de Materias Primas</h3>
                        <p style={{ color: '#64748b' }}>¿Autorizas descontar materiales para <strong>{mpConfModal.odp?.finalQty}</strong> unidades de {mpConfModal.odp?.sku}?</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={() => setMpConfModal({ show: false, odp: null, materials: [] })} style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #eee' }}>Cancelar</button>
                            <button onClick={() => handleMPSync(mpConfModal.odp, mpConfModal.materials)} style={{ padding: '0.8rem', borderRadius: '12px', background: '#ea580c', color: '#fff', border: 'none' }}>Autorizar Consumo</button>
                        </div>
                    </div>
                </div>
            )}

            {confModal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', maxWidth: '450px' }}>
                        <h3>Ingreso a Inventario PT</h3>
                        <p style={{ color: '#64748b' }}>¿Autorizas ingresar <strong>{confModal.odp?.finalQty}</strong> unidades a Producto Terminado?</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={() => setConfModal({ show: false, odp: null })} style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #eee' }}>Omitir</button>
                            <button onClick={() => handleInventorySync(confModal.odp)} style={{ padding: '0.8rem', borderRadius: '12px', background: 'var(--color-primary)', color: '#fff', border: 'none' }}>Cargar Inventario</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Production;
