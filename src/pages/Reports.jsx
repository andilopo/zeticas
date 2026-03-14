import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
    BarChart3, TrendingUp, Users, DollarSign,
    ArrowUpRight, ArrowDownRight, Calendar, Filter,
    Download, PieChart as PieIcon, Activity,
    Clock, Zap, Target, Edit2, Check, Receipt, ShoppingCart
} from 'lucide-react';

const Reports = ({ orders = [], taxSettings = {}, setTaxSettings, expenses = [], purchaseOrders = [] }) => {
    const [isEditingTax, setIsEditingTax] = useState(false);
    const [tempTax, setTempTax] = useState(taxSettings || {});

    // 0. P&L Calculation (PYG) with heavy safety checks
    const pygSummary = useMemo(() => {
        const safeOrders = Array.isArray(orders) ? orders : [];
        const safeExpenses = Array.isArray(expenses) ? expenses : [];
        const safePOs = Array.isArray(purchaseOrders) ? purchaseOrders : [];

        const income = safeOrders.reduce((acc, o) => acc + (o && o.status !== 'Cancelado' ? (o.amount || 0) : 0), 0);

        const cogs = safePOs
            .filter(oc => oc && oc.status === 'Recibida')
            .reduce((acc, oc) => {
                const items = Array.isArray(oc.items) ? oc.items : [];
                const totalOC = items.reduce((sum, it) => sum + ((it?.toBuy || 0) * (it?.purchasePrice || 0)), 0);
                return acc + totalOC;
            }, 0);

        const totalExpenses = safeExpenses.reduce((acc, e) => acc + (e?.amount || 0), 0);
        const netProfit = income - cogs - totalExpenses;

        return {
            income,
            cogs,
            totalExpenses,
            netProfit,
            margin: income > 0 ? ((netProfit / income) * 100).toFixed(1) : 0
        };
    }, [orders, purchaseOrders, expenses]);

    const safeTax = taxSettings || { iva: 19, retefuente: 2.5, ica: 9.6, renta: 35 };
    const ivaValue = (Array.isArray(orders) ? orders : []).reduce((acc, o) => acc + (o?.amount || 0), 0) * ((safeTax?.iva || 0) / 100);

    // 1. Data Processing for Facturación
    const salesData = useMemo(() => {
        const groups = {
            'Ene': 0, 'Feb': 0, 'Mar': 0, 'Abr': 0, 'May': 0, 'Jun': 0,
            'Jul': 0, 'Ago': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dic': 0
        };

        (Array.isArray(orders) ? orders : []).forEach(o => {
            if (!o || !o.date) return;
            try {
                const date = new Date(o.date);
                const month = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
                const key = month.charAt(0).toUpperCase() + month.slice(1);
                if (groups[key] !== undefined) {
                    groups[key] += (o.amount || 0);
                } else {
                    // Fallback to Feb if month not mapped correctly in mock
                    groups['Feb'] += (o.amount || 0);
                }
            } catch (e) {
                console.error("Error parsing date", o.date);
            }
        });

        return Object.keys(groups).map(k => ({ name: k, total: groups[k] }));
    }, [orders]);

    const salesByClient = useMemo(() => {
        const clients = {};
        (Array.isArray(orders) ? orders : []).forEach(o => {
            if (o && o.client) {
                clients[o.client] = (clients[o.client] || 0) + (o.amount || 0);
            }
        });
        return Object.keys(clients)
            .map(k => ({ name: k, value: clients[k] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [orders]);

    // 2. Data Processing for Cartera
    const carteraData = useMemo(() => {
        const pending = (Array.isArray(orders) ? orders : []).filter(o => o && o.status !== 'Pagado' && o.status !== 'Cancelado');
        const totalDebt = pending.reduce((acc, o) => acc + (o.amount || 0), 0);

        const debtByClient = {};
        pending.forEach(o => {
            if (o && o.client) {
                debtByClient[o.client] = (debtByClient[o.client] || 0) + (o.amount || 0);
            }
        });

        const pieData = Object.keys(debtByClient).map(k => ({ name: k, value: debtByClient[k] }));

        return {
            total: totalDebt,
            pie: pieData,
            corriente: totalDebt * 0.8,
            vencido: totalDebt * 0.2,
            cobroJuridico: 0
        };
    }, [orders]);

    const COLORS = ['#1A3636', '#40534C', '#677D6A', '#9FB69E', '#D6BD98'];

    const handleSaveTax = () => {
        if (setTaxSettings) setTaxSettings(tempTax);
        setIsEditingTax(false);
    };

    const handleTaxChange = (field, value) => {
        setTempTax(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    return (
        <div className="reports-dashboard" style={{ padding: '0 1.5rem', background: '#f8fafc', minHeight: '100vh', borderRadius: '24px' }}>
            {/* Header */}
            <header style={{
                padding: '2.5rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '2.6rem', color: '#1A3636', margin: 0 }}>Informes de Gestión Integral</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={18} /> Monitoreo de Eficiencia Operativa, Ventas y KPIs Lean
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: '#fff', padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', color: '#64748b' }}>
                        <Calendar size={18} /> Periodo: 2024
                    </div>
                    <button style={{ background: '#1A3636', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                        <Download size={18} /> Exportar Reporte
                    </button>
                </div>
            </header>

            {/* P&L Executive Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: '#fff', padding: '1.2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#ecfdf5', padding: '0.6rem', borderRadius: '10px', color: '#059669' }}><TrendingUp size={20} /></div>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>INGRESOS (ESTIMADOS)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1A3636' }}>${(pygSummary?.income || 0).toLocaleString()}</div>
                    </div>
                </div>
                <div style={{ background: '#fff', padding: '1.2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#fff1f2', padding: '0.6rem', borderRadius: '10px', color: '#e11d48' }}><ShoppingCart size={20} /></div>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>COSTO DE VENTAS (MP)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#e11d48' }}>-${(pygSummary?.cogs || 0).toLocaleString()}</div>
                    </div>
                </div>
                <div style={{ background: '#fff', padding: '1.1rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#fef3c7', padding: '0.6rem', borderRadius: '10px', color: '#d97706' }}><Receipt size={20} /></div>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>GASTOS OP. (ADM/VTA)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#d97706' }}>-${(pygSummary?.totalExpenses || 0).toLocaleString()}</div>
                    </div>
                </div>
                <div style={{ background: (pygSummary?.netProfit || 0) >= 0 ? '#1A3636' : '#991b1b', padding: '1.2rem', borderRadius: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem', borderRadius: '10px' }}><DollarSign size={20} /></div>
                    <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 'bold' }}>UTILIDAD NETA (P&L)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>${(pygSummary?.netProfit || 0).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Financial Dashboard Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                {/* Facturación */}
                <div style={{ background: '#E9EFEC', borderRadius: '32px', padding: '2rem', border: '1px solid #C4DAD2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div>
                            <span style={{ background: '#C4DAD2', color: '#1A3636', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase' }}>COMERCIAL</span>
                            <h3 style={{ margin: '0.5rem 0 0', fontSize: '1.6rem', color: '#1A3636' }}>Facturación Total</h3>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1A3636' }}>${(Array.isArray(orders) ? orders : []).reduce((acc, o) => acc + (o?.amount || 0), 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <div style={{ height: '250px', width: '100%', marginBottom: '2rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C4DAD2" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#40534C', fontSize: 11 }} />
                                <YAxis hide />
                                <Bar dataKey="total" fill="#1A3636" radius={[4, 4, 0, 0]} barSize={30} />
                                <Tooltip />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '20px', padding: '1.2rem' }}>
                            <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.85rem', color: '#1A3636', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={14} /> Top Clientes</h4>
                            {salesByClient.map((c, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#40534C' }}>{c.name}</span>
                                    <span style={{ fontWeight: 'bold' }}>${c.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: '#1A3636', borderRadius: '20px', padding: '1.2rem', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Impacto {(safeTax?.iva || 0)}% IVA</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>${ivaValue.toLocaleString()}</div>
                            <div style={{ fontSize: '0.6rem', marginTop: '4px' }}>Cálculo basado en configuración fiscal</div>
                        </div>
                    </div>
                </div>

                {/* Cartera */}
                <div style={{ background: '#E8F1F5', borderRadius: '32px', padding: '2rem', border: '1px solid #D1E1E9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <span style={{ background: '#D1E1E9', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase' }}>A/R</span>
                            <h3 style={{ margin: '0.5rem 0 0', fontSize: '1.6rem', color: '#0369a1' }}>Cartera Total</h3>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0369a1' }}>${(carteraData?.total || 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '160px', height: '160px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={carteraData?.pie || []} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                                        {(carteraData?.pie || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1, display: 'grid', gap: '0.6rem' }}>
                            <div style={{ background: '#fff', borderRadius: '12px', padding: '0.8rem', border: '1px solid #D1E1E9' }}>
                                <div style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#64748b' }}>CORRIENTE</div>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>${(carteraData?.corriente || 0).toLocaleString()}</div>
                            </div>
                            <div style={{ background: '#ef4444', borderRadius: '12px', padding: '0.8rem', color: '#fff' }}>
                                <div style={{ fontSize: '0.6rem', fontWeight: 'bold', opacity: 0.9 }}>VENCIDO (+30 DÍAS)</div>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>${(carteraData?.vencid || 0).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Operational Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.8rem' }}>
                        <div style={{ background: '#f0f4f4', padding: '0.6rem', borderRadius: '12px', color: 'var(--color-primary)' }}><Clock size={24} /></div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>Eficiencia del Tiempo</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>Lead Time (Promedio)</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tiempo desde pedido hasta despacho</div>
                            </div>
                            <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--color-primary)' }}>4.2 días</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>Takt Time (Requerido)</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ritmo de producción vs demanda</div>
                            </div>
                            <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--color-primary)' }}>18 min/und</span>
                        </div>
                    </div>
                </div>

                <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.8rem' }}>
                        <div style={{ background: '#fff7ed', padding: '0.6rem', borderRadius: '12px', color: '#ea580c' }}><Zap size={24} /></div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>OEE (Indicador de Eficacia)</h3>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', fontWeight: '900', color: '#ea580c', lineHeight: 1 }}>82%</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.8rem', fontWeight: '600' }}>RENDIMIENTO DE PLANTA <span style={{ color: '#94a3b8', fontWeight: '400' }}>(META: 85%)</span></div>
                    </div>
                </div>
            </div>

            {/* Fixed Editable Tax Rules Summary */}
            <div style={{
                position: 'fixed', bottom: '2rem', right: '2rem', background: '#fff', padding: '1.5rem',
                borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                width: '320px', zIndex: 100
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #E9EFEC', paddingBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#1A3636' }}>CONFIGURACIÓN TRIBUTARIA</div>
                    {isEditingTax ? (
                        <button onClick={handleSaveTax} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Check size={14} /></button>
                    ) : (
                        <button onClick={() => { setTempTax(safeTax); setIsEditingTax(true); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Edit2 size={14} /></button>
                    )}
                </div>

                <div style={{ display: 'grid', gap: '0.8rem' }}>
                    {[
                        { key: 'iva', label: 'IVA (%)', suffix: '(Mensual)' },
                        { key: 'retefuente', label: 'Retefuente (%)', suffix: '(Ventas)' },
                        { key: 'ica', label: 'ICA (x 1000)', suffix: '' },
                        { key: 'renta', label: 'Impuesto Renta (%)', suffix: '(Anual)' }
                    ].map((config) => (
                        <div key={config.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                            <span style={{ color: '#64748b', fontWeight: '600' }}>{config.label}</span>
                            {isEditingTax ? (
                                <input
                                    type="number"
                                    step="0.1"
                                    value={tempTax[config.key] || 0}
                                    onChange={(e) => handleTaxChange(config.key, e.target.value)}
                                    style={{ width: '60px', padding: '2px 4px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right', fontSize: '0.8rem' }}
                                />
                            ) : (
                                <span style={{ color: '#1A3636', fontWeight: '800' }}>
                                    {config.key === 'ica' ? (safeTax[config.key] || 0) : `${(safeTax[config.key] || 0)}%`} {config.suffix}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @font-face { font-family: 'DM Serif Display'; src: url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap'); }
                .font-serif { font-family: 'DM Serif Display', serif; }
            `}</style>
        </div>
    );
};

export default Reports;
