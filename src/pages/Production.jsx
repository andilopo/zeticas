import React, { useState, useMemo } from 'react';
import {
    Play,
    CheckCircle2,
    Clock,
    Filter,
    Search,
    MoreVertical,
    Timer,
    BarChart,
    AlertTriangle,
    Check,
    X,
    TrendingUp,
    Activity,
    Save
} from 'lucide-react';

const Production = ({ orders, setOrders, items, setItems }) => {
    // Local state for production execution
    const [activeOP, setActiveOP] = useState(null); // Selected order for processing
    const [opDetails, setOpDetails] = useState({}); // { orderId: { start, end, manufactured, rejected, quality } }
    const [productivityFilter, setProductivityFilter] = useState('ALL'); // 'ALL', 'Dulce', 'Sal'

    // Filter orders in production phase
    const productionQueue = useMemo(() => {
        return orders.filter(o => o.status === 'En Producción' || o.status === 'En Producción (Iniciada)');
    }, [orders]);

    // Productivity Calculation Logic
    const stats = useMemo(() => {
        const completed = Object.values(opDetails).filter(d => d.end && d.start);

        let filtered = completed;
        if (productivityFilter === 'Dulce') {
            filtered = completed.filter(d => d.group === 'Dulce');
        } else if (productivityFilter === 'Sal') {
            filtered = completed.filter(d => d.group === 'Sal');
        }

        const totalHrs = filtered.reduce((acc, d) => {
            const diff = (new Date(d.end) - new Date(d.start)) / (1000 * 60 * 60);
            return acc + (diff > 0 ? diff : 0);
        }, 0);

        const totalUnits = filtered.reduce((acc, d) => acc + (d.manufactured || 0), 0);
        const totalRejected = filtered.reduce((acc, d) => acc + (d.rejected || 0), 0);

        const productivity = totalHrs > 0 ? (totalUnits / totalHrs).toFixed(1) : 0;

        return {
            productivity,
            totalUnits,
            totalRejected,
            count: filtered.length
        };
    }, [opDetails, productivityFilter]);

    // Actions
    const handleStartProduction = (orderId) => {
        const now = new Date().toISOString();
        setOpDetails({
            ...opDetails,
            [orderId]: {
                ...opDetails[orderId],
                start: now,
                status: 'En Proceso'
            }
        });
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'En Producción (Iniciada)' } : o));
    };

    const handleOpenFinishModal = (order) => {
        setActiveOP(order);
    };

    const handleFinishProduction = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const manufactured = parseInt(formData.get('manufactured'));
        const rejected = parseInt(formData.get('rejected'));
        const quality = formData.get('quality');
        const endTime = new Date().toISOString();

        if (isNaN(manufactured) || manufactured < 0) {
            alert('Por favor ingresa una cantidad válida de unidades fabricadas.');
            return;
        }

        // 1. Update Inventory PT (purchases column for PT represents "Producción")
        const updatedInventory = [...items];
        activeOP.items.forEach(orderItem => {
            const invItemIndex = updatedInventory.findIndex(i => i.id === orderItem.id || i.name === orderItem.name);
            if (invItemIndex !== -1) {
                // Here we update based on what was actually manufactured in this OP
                // In a simplified flow, we assume the OP target was orderItem.quantity
                updatedInventory[invItemIndex] = {
                    ...updatedInventory[invItemIndex],
                    purchases: (updatedInventory[invItemIndex].purchases || 0) + manufactured
                };
            }
        });
        setItems(updatedInventory);

        // 2. Save OP details for metrics
        // Determine group for metrics (taking from first item for simplicity)
        const primaryProduct = activeOP.items[0];
        const productInfo = items.find(i => i.id === primaryProduct?.id);
        const group = productInfo?.group || 'N/A';

        setOpDetails({
            ...opDetails,
            [activeOP.id]: {
                ...opDetails[activeOP.id],
                end: endTime,
                manufactured,
                rejected,
                quality,
                group
            }
        });

        // 3. Update Order Status to Ready for Logistics and store OP ID
        const opId = `OP-${Math.floor(1000 + Math.random() * 9000)}`;
        setOrders(orders.map(o => o.id === activeOP.id ? {
            ...o,
            status: 'Listo para Despacho',
            opId: opId,
            productionDetails: {
                manufactured,
                rejected,
                quality,
                endTime
            }
        } : o));

        alert(`Producción del pedido ${activeOP.id} finalizada (OP: ${opId}). Stock de PT actualizado.`);
        setActiveOP(null);
    };

    return (
        <div className="production-module" style={{ padding: '0 1rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Gestión de Piso - Producción JIT</h2>
                <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem' }}>Control de tiempos, calidad y productividad en tiempo real.</p>
            </header>

            {/* Productivity Dashboard */}
            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <Activity size={20} color="var(--color-primary)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#334155' }}>Indicadores de Productividad</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '10px' }}>
                        {['ALL', 'Dulce', 'Sal'].map(f => (
                            <button
                                key={f}
                                onClick={() => setProductivityFilter(f)}
                                style={{
                                    padding: '0.4rem 1rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    background: productivityFilter === f ? '#fff' : 'transparent',
                                    color: productivityFilter === f ? 'var(--color-primary)' : '#64748b',
                                    boxShadow: productivityFilter === f ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                {f === 'ALL' ? 'Global' : f}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1A3636 0%, #2D4F4F 100%)', padding: '1.8rem', borderRadius: '24px', color: '#fff', boxShadow: '0 10px 20px rgba(26, 54, 54, 0.15)' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
                            Eficiencia / Hora
                            <TrendingUp size={16} color="#4ade80" />
                        </div>
                        <div style={{ fontSize: '2.6rem', fontWeight: '900', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            {stats.productivity}
                            <span style={{ fontSize: '1rem', fontWeight: '400', opacity: 0.7 }}>Und/Hr</span>
                        </div>
                    </div>
                    <div style={{ background: '#fff', padding: '1.8rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.6rem' }}>Unidades Aprobadas</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1A3636' }}>{stats.totalUnits} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#94a3b8' }}>und</span></div>
                    </div>
                    <div style={{ background: '#fff', padding: '1.8rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.6rem' }}>Merma / Calidad</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ef4444' }}>{stats.totalRejected} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#fca5a5' }}>und</span></div>
                    </div>
                </div>
            </section>

            {/* Production Queue */}
            <section style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ background: '#f0f4f4', padding: '0.6rem', borderRadius: '12px', color: 'var(--color-primary)' }}>
                            <Clock size={22} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: '800' }}>Cola de Ejecución</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Pedidos con materiales disponibles en bodega.</p>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: '600', border: '1px solid #f1f5f9' }}>
                        {productionQueue.length} Pedidos en Fila
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.8rem' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referencia</th>
                                <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Producto / Cliente</th>
                                <th style={{ padding: '0.5rem 1rem', textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Programado</th>
                                <th style={{ padding: '0.5rem 1rem', textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inicio Real</th>
                                <th style={{ padding: '0.5rem 1rem', textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                                <th style={{ padding: '0.5rem 1rem', textAlign: 'right', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productionQueue.length > 0 ? productionQueue.map(order => {
                                const details = opDetails[order.id] || {};
                                return (
                                    <tr key={order.id} style={{ transition: 'transform 0.2s' }}>
                                        <td style={{ padding: '1rem', background: '#fcfcfc', borderRadius: '12px 0 0 12px', border: '1px solid #f1f5f9', borderRight: 'none' }}>
                                            <span style={{ fontWeight: '800', color: 'var(--color-primary)', fontSize: '0.9rem' }}>{order.id}</span>
                                        </td>
                                        <td style={{ padding: '1rem', background: '#fcfcfc', border: '1px solid #f1f5f9', borderLeft: 'none', borderRight: 'none' }}>
                                            {order.items.map(i => (
                                                <div key={i.id} style={{ fontWeight: '700', fontSize: '0.95rem', color: '#334155' }}>{i.name}</div>
                                            ))}
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                                                <Users size={12} /> {order.client}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', background: '#fcfcfc', border: '1px solid #f1f5f9', borderLeft: 'none', borderRight: 'none', textAlign: 'center' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1A3636' }}>
                                                {order.items.reduce((acc, i) => acc + i.quantity, 0)}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold' }}>UNIDADES</div>
                                        </td>
                                        <td style={{ padding: '1rem', background: '#fcfcfc', border: '1px solid #f1f5f9', borderLeft: 'none', borderRight: 'none', textAlign: 'center' }}>
                                            {details.start ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                                                    <Timer size={14} color="var(--color-secondary)" />
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-secondary)' }}>
                                                        {new Date(details.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>--:--</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', background: '#fcfcfc', border: '1px solid #f1f5f9', borderLeft: 'none', borderRight: 'none', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                background: details.start ? '#fffbeb' : '#f0f9ff',
                                                color: details.start ? '#d97706' : '#0369a1',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem'
                                            }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                                {details.start ? 'EN PROCESO' : 'LISTO'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', background: '#fcfcfc', border: '1px solid #f1f5f9', borderLeft: 'none', borderRadius: '0 12px 12px 0', textAlign: 'right' }}>
                                            {!details.start ? (
                                                <button
                                                    onClick={() => handleStartProduction(order.id)}
                                                    style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(26, 54, 54, 0.2)' }}
                                                >
                                                    <Play size={16} fill="currentColor" /> INICIAR
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenFinishModal(order)}
                                                    style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}
                                                >
                                                    <CheckCircle2 size={16} /> FINALIZAR
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                                        <div style={{ background: '#f8fafc', display: 'inline-flex', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem', color: '#cbd5e1' }}>
                                            <Timer size={48} strokeWidth={1} />
                                        </div>
                                        <h4 style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>No hay órdenes activas</h4>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Las órdenes aparecerán aquí una vez se reciban los materiales en Compras.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Finish Production Modal */}
            {activeOP && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2500
                }}>
                    <div style={{
                        background: '#fff',
                        width: '450px',
                        borderRadius: '24px',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)' }}>Finalizar Producción {activeOP.id}</h3>
                            <button onClick={() => setActiveOP(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleFinishProduction}>
                            <div style={{ display: 'grid', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.4rem' }}>CANTIDAD FABRICADA (PT)</label>
                                    <input
                                        type="number"
                                        name="manufactured"
                                        required
                                        placeholder="Ej: 50"
                                        defaultValue={activeOP.items.reduce((acc, i) => acc + i.quantity, 0)}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.4rem' }}>CANTIDAD RECHAZADA (MERMA)</label>
                                    <input
                                        type="number"
                                        name="rejected"
                                        defaultValue="0"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.4rem' }}>APROBACIÓN DE CALIDAD</label>
                                    <select
                                        name="quality"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff' }}
                                    >
                                        <option value="Aprobado">Cumple Estándares (Aprobado)</option>
                                        <option value="Rechazado">No Cumple (Rechazado)</option>
                                    </select>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                                        <Timer size={14} />
                                        Tiempo transcurrido desde inicio: {Math.round((new Date() - new Date(opDetails[activeOP.id].start)) / (1000 * 60))} min
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '1rem',
                                        background: 'var(--color-primary)',
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
                                    <Save size={18} /> Registrar y Pasar a Despacho
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Production;
