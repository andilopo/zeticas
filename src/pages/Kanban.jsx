import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import {
    LayoutGrid,
    FileText,
    ShoppingCart,
    ChefHat,
    Truck,
    DollarSign,
    Info,
    X,
    CheckCircle2,
    Clock,
    TrendingUp,
    Package,
    AlertCircle,
    User,
    Calendar
} from 'lucide-react';

const Kanban = ({ orders = [], items = [] }) => {
    const { purchaseOrders } = useBusiness();
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Premium Branding Colors
    const deepTeal = "#025357";
    const institutionOcre = "#D6BD98";
    const premiumSalmon = "#D4785A";

    // Define the columns and their status mappings
    const columns = [
        {
            id: 'pedido',
            label: 'Pedido',
            icon: <FileText size={18} />,
            inProcessStatuses: ['Pendiente'],
            finishedStatuses: ['En Compras', 'En Compras (OC Generadas)']
        },
        {
            id: 'compras',
            label: 'Compras',
            icon: <ShoppingCart size={18} />,
            inProcessStatuses: ['En Compras', 'En Compras (OC Generadas)'],
            finishedStatuses: ['En Producción']
        },
        {
            id: 'produccion',
            label: 'Producción',
            icon: <ChefHat size={18} />,
            inProcessStatuses: ['En Producción', 'En Producción (Iniciada)'],
            finishedStatuses: ['Listo para Despacho']
        },
        {
            id: 'despachos',
            label: 'Despachos',
            icon: <Truck size={18} />,
            inProcessStatuses: ['Listo para Despacho', 'Despachado'],
            finishedStatuses: ['Entregado']
        },
        {
            id: 'cartera',
            label: 'Cartera',
            icon: <DollarSign size={18} />,
            inProcessStatuses: ['Entregado'],
            finishedStatuses: ['Pagado']
        }
    ];

    // Helper to determine if an order belongs to a column and its color
    const getOrderStageInfo = (order, column) => {
        if (column.inProcessStatuses.includes(order.status)) {
            return { show: true, color: '#ef4444', status: 'En Proceso' };
        }
        if (column.finishedStatuses.includes(order.status)) {
            return { show: true, color: '#10b981', status: 'Finalizado' };
        }
        return { show: false };
    };

    // Calculate Column Indicators (Historical cumulative count)
    const getColumnStats = (column, colIndex) => {
        let inProcess = 0;
        let finished = 0;

        const downstreamStatuses = [...column.finishedStatuses];
        for (let i = colIndex + 1; i < columns.length; i++) {
            downstreamStatuses.push(...columns[i].inProcessStatuses);
            downstreamStatuses.push(...columns[i].finishedStatuses);
        }

        orders.forEach(o => {
            if (column.inProcessStatuses.includes(o.status)) {
                inProcess++;
            } else if (downstreamStatuses.includes(o.status)) {
                finished++;
            }
        });
        return { inProcess, finished };
    };

    const StatusTag = ({ color, text }) => (
        <div style={{ 
            background: `${color}15`, 
            color: color, 
            fontSize: '0.65rem', 
            fontWeight: '900', 
            padding: '4px 10px', 
            borderRadius: '50px',
            border: `1px solid ${color}30`,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
        }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
            {text}
        </div>
    );

    return (
        <div className="kanban-module" style={{ minHeight: 'calc(100vh - 12rem)', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Column Navigation Strip — visible on tablet/mobile */}
            <div className="kanban-nav-strip">
                {columns.map((col, index) => {
                    const stats = getColumnStats(col, index);
                    return (
                        <button
                            key={col.id}
                            className="kanban-nav-pill"
                            onClick={() => {
                                const el = document.getElementById(`kanban-col-${col.id}`);
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {col.icon}
                                <span>{col.label}</span>
                            </span>
                            {stats.inProcess > 0 && (
                                <span className="kanban-nav-badge">{stats.inProcess}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Columns Container */}
            <div className="kanban-columns-container">
                {columns.map((col, index) => {
                    const stats = getColumnStats(col, index);
                    return (
                        <div
                            id={`kanban-col-${col.id}`}
                            key={col.id}
                            className="kanban-col"
                        >
                            {/* Column Header - Premium Style */}
                            <div style={{ 
                                padding: '1.5rem', 
                                background: '#fff', 
                                borderBottom: '1px solid rgba(2, 83, 87, 0.05)',
                                position: 'relative'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: deepTeal, marginBottom: '1rem' }}>
                                    <div style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        borderRadius: '12px', 
                                        background: `${deepTeal}0D`, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: deepTeal,
                                        boxShadow: `0 4px 10px ${deepTeal}1A`
                                    }}>
                                        {col.icon}
                                    </div>
                                    <span style={{ fontWeight: '900', fontSize: '1rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{col.label}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <div style={{ 
                                        flex: 1, 
                                        background: `${premiumSalmon}0D`, 
                                        color: premiumSalmon, 
                                        padding: '0.6rem', 
                                        borderRadius: '14px', 
                                        textAlign: 'center', 
                                        fontSize: '0.75rem', 
                                        fontWeight: '900',
                                        border: `1px solid ${premiumSalmon}1A`
                                    }}>
                                        {stats.inProcess} <span style={{ opacity: 0.6 }}>WAIT</span>
                                    </div>
                                    <div style={{ 
                                        flex: 1, 
                                        background: '#F0FDF4', 
                                        color: '#16a34a', 
                                        padding: '0.6rem', 
                                        borderRadius: '14px', 
                                        textAlign: 'center', 
                                        fontSize: '0.75rem', 
                                        fontWeight: '900',
                                        border: '1px solid #DCFCE7'
                                    }}>
                                        {stats.finished} <span style={{ opacity: 0.6 }}>DONE</span>
                                    </div>
                                </div>
                            </div>

                            {/* Column Body - Smooth Scroll */}
                            <div style={{ 
                                padding: '1.2rem', 
                                flex: 1, 
                                overflowY: 'auto', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '1rem',
                                scrollbarWidth: 'none'
                            }}>
                                {orders.map(order => {
                                    const stage = getOrderStageInfo(order, col);
                                    if (!stage.show) return null;
                                    return { ...order, stageInfo: stage };
                                }).filter(Boolean).sort((a, b) => {
                                    const aFinished = a.stageInfo.status === 'Finalizado';
                                    const bFinished = b.stageInfo.status === 'Finalizado';
                                    if (aFinished && !bFinished) return 1;
                                    if (!aFinished && bFinished) return -1;
                                    return new Date(b.date || 0) - new Date(a.date || 0);
                                }).map(order => {
                                    const stage = order.stageInfo;

                                    return (
                                        <div
                                            key={order.id}
                                            onClick={() => setSelectedOrder({ ...order, stageName: col.label })}
                                            style={{
                                                background: '#fff',
                                                padding: '1.2rem',
                                                borderRadius: '20px',
                                                border: `1px solid ${stage.color}15`,
                                                borderLeft: `6px solid ${stage.color}`,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                                <span style={{ fontWeight: '900', fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.5px' }}>#{order.id}</span>
                                                <StatusTag color={stage.color} text={stage.status} />
                                            </div>
                                            
                                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                                                {order.items?.map(i => i.name).join(' + ') || 'Sin ítems'}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid #f8fafc' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}>
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <User size={10} />
                                                    </div>
                                                    {(order.client || 'N/A').length > 15 ? (order.client || 'N/A').substring(0, 15) + '...' : (order.client || 'N/A')}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '900', color: deepTeal, background: `${deepTeal}0D`, padding: '4px 12px', borderRadius: '10px' }}>
                                                    {order.items?.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0) || 0} <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>UND</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div> {/* end kanban-columns-container */}

            {/* Detailed Info Modal */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '1rem'
                }}>
                    <div className="kanban-detail-modal">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: '#f1f5f9', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                                            <div style={{ 
                                                                width: '64px', 
                                                                height: '64px', 
                                                                background: `${deepTeal}0D`, 
                                                                borderRadius: '20px', 
                                                                color: deepTeal,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <Info size={32} />
                                                            </div>
                                                            <div>
                                                                <h3 style={{ margin: 0, fontSize: '1.8rem', color: deepTeal, fontWeight: '900', letterSpacing: '-0.5px' }}>Detalle del Pedido</h3>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.3rem' }}>
                                                                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Etapa:</span>
                                                                    <StatusTag color={deepTeal} text={selectedOrder.stageName} />
                                                                </div>
                                                            </div>
                                                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.05em' }}>CLIENTE / ID</label>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{selectedOrder.client || 'N/A'} ({selectedOrder.id})</div>
                                     <div style={{ fontSize: '0.65rem', color: institutionOcre, fontWeight: '900', marginTop: '4px', textTransform: 'uppercase' }}>Consumidor Final / VIP</div>
                                 </div>
                                 <div>
                                     <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.05em' }}>PRODUCTO Y CANTIDAD</label>
                                     {selectedOrder.items?.map(item => (
                                         <div key={item.id} style={{ fontSize: '0.95rem', fontWeight: '700', color: deepTeal }}>{item.name} - x{item.quantity} und</div>
                                     )) || <div style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Sin productos registrados</div>}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.05em' }}>STATUS GLOBAL</label>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800',
                                        background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5'
                                    }}>
                                        {(selectedOrder.status || 'PENDIENTE').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: '#64748b', marginBottom: '1rem' }}>INFORMACIÓN POR ETAPA</label>

                                {selectedOrder.stageName === 'Pedido' && (
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                                            <Package size={14} style={{ marginRight: '0.5rem' }} />
                                            Inventario PT: <span style={{ fontWeight: 'bold' }}>Sincronizado</span>
                                        </p>
                                        <div style={{ marginTop: '0.5rem', background: '#fff', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                                            {selectedOrder.items?.map(item => {
                                                const inv = items.find(i => i.id === item.id);
                                                return (
                                                    <div key={item.id}>Stock {item.name}: {inv ? (inv.initial + inv.purchases - inv.sales) : 'N/A'} {inv?.unit}</div>
                                                );
                                            }) || 'No hay ítems'}
                                        </div>
                                    </div>
                                )}

                                {selectedOrder.stageName === 'Compras' && (
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>OC Asociadas a este Pedido:</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {purchaseOrders.filter(po => po.relatedOrders && po.relatedOrders.includes(selectedOrder.id)).length > 0 ? (
                                                purchaseOrders
                                                    .filter(po => po.relatedOrders && po.relatedOrders.includes(selectedOrder.id))
                                                    .map(po => (
                                                        <div key={po.id} style={{ padding: '0.8rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--color-primary)' }}>{po.id}</span>
                                                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#10b981', padding: '2px 8px', background: '#ecfdf5', borderRadius: '10px' }}>{po.status}</span>
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>Prov: {po.providerName}</div>
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#334155', marginTop: '0.2rem' }}>$$ {(po.total || 0).toLocaleString()}</div>
                                                        </div>
                                                    ))
                                            ) : (
                                                <div style={{ padding: '0.8rem', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                                                    Aún no se han generado OCs para los materiales de este pedido.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedOrder.stageName === 'Producción' && (
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: '#475569' }}>Ejecución Piso:</p>
                                        <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}>OP: <span style={{ fontWeight: '800' }}>{selectedOrder.opId || 'OP-PENDIENTE'}</span></div>
                                            <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 'bold' }}>
                                                {selectedOrder.productionDetails ? 'PRODUCCIÓN FINALIZADA' : 'INICIADA / COLA'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedOrder.stageName === 'Despachos' && (
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: '#475569' }}>Carga y Facturación:</p>
                                        <div style={{ marginTop: '0.8rem' }}>
                                            <div style={{ marginBottom: '0.4rem' }}>Guía / Fact: <span style={{ fontWeight: '800' }}>{selectedOrder.invoiceNum || 'PENDIENTE'}</span></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                <Truck size={14} /> ESTATUS: {selectedOrder.status === 'Despachado' ? 'EN RUTA' : 'LISTO CARGUE'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedOrder.stageName === 'Cartera' && (
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: '#475569' }}>Gestión de Cobro:</p>
                                        <div style={{ marginTop: '1rem', background: '#fee2e2', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                            <Calendar size={20} color="#b91c1c" style={{ marginBottom: '0.4rem' }} />
                                            <div style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: '900' }}>Vence en 30 días</div>
                                            <div style={{ color: '#b91c1c', fontSize: '0.75rem' }}>Desde: {selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : 'N/A'}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            style={{ 
                                width: '100%', 
                                marginTop: '2.5rem', 
                                padding: '1.2rem', 
                                borderRadius: '20px', 
                                border: 'none', 
                                background: deepTeal, 
                                color: '#fff', 
                                fontWeight: '900', 
                                cursor: 'pointer', 
                                boxShadow: `0 10px 25px ${deepTeal}40`,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Cerrar Vista Operativa
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                /* ── Kanban Responsive Layout ─────────────────────────────── */

                .kanban-nav-strip {
                    display: none;
                    flex-wrap: nowrap;
                    overflow-x: auto;
                    gap: 0.5rem;
                    padding: 0.5rem 0.25rem 0.75rem;
                    scrollbar-width: none;
                }
                .kanban-nav-strip::-webkit-scrollbar { display: none; }

                .kanban-nav-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 50px;
                    border: 1px solid rgba(2, 83, 87, 0.2);
                    background: rgba(255,255,255,0.8);
                    color: #025357;
                    font-size: 0.75rem;
                    font-weight: 800;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: all 0.2s;
                    backdrop-filter: blur(8px);
                }
                .kanban-nav-pill:hover {
                    background: #025357;
                    color: #fff;
                }
                .kanban-nav-badge {
                    background: #D4785A;
                    color: #fff;
                    font-size: 0.65rem;
                    font-weight: 900;
                    padding: 1px 6px;
                    border-radius: 50px;
                    min-width: 18px;
                    text-align: center;
                }

                /* ── Columns container ────────────────────────────────────── */
                .kanban-columns-container {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 1.5rem;
                    flex: 1;
                    min-height: 0;
                    padding: 0.5rem;
                    overflow-x: auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    scroll-snap-type: x mandatory;
                    -webkit-overflow-scrolling: touch;
                }
                .kanban-columns-container::-webkit-scrollbar { display: none; }

                /* ── Individual column ────────────────────────────────────── */
                .kanban-col {
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 28px;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid rgba(2, 83, 87, 0.05);
                    overflow: auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                    backdrop-filter: blur(10px);
                    min-width: 260px;
                    scroll-snap-align: start;
                }

                /* ── Detail modal ─────────────────────────────────────────── */
                .kanban-detail-modal {
                    background: #fff;
                    width: 600px;
                    max-width: 95vw;
                    max-height: 90vh;
                    overflow-y: auto;
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    position: relative;
                }

                /* ── TABLET (640px – 1099px) ──────────────────────────────── */
                @media (max-width: 1099px) {
                    .kanban-nav-strip { display: flex; }

                    .kanban-columns-container {
                        grid-template-columns: repeat(5, 44vw);
                        gap: 1rem;
                        padding: 0.25rem;
                    }

                    .kanban-col {
                        min-width: unset;
                        border-radius: 20px;
                    }

                    .kanban-detail-modal {
                        width: 95vw;
                        padding: 1.5rem;
                    }
                }

                /* ── MOBILE (<640px) ──────────────────────────────────────── */
                @media (max-width: 639px) {
                    .kanban-module {
                        min-height: calc(100vh - 8rem);
                    }

                    .kanban-columns-container {
                        grid-template-columns: repeat(5, 90vw);
                        gap: 0.75rem;
                        padding: 0.25rem 0.5rem;
                    }

                    .kanban-col {
                        border-radius: 20px;
                        min-height: 60vh;
                    }

                    .kanban-detail-modal {
                        width: 100vw;
                        border-radius: 20px 20px 0 0;
                        padding: 1.2rem;
                        margin-top: auto;
                    }
                }

                /* ── scrollbar global ─────────────────────────────────────── */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

export default Kanban;
