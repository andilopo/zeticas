import React, { useState, useMemo, useEffect } from 'react';
import {
    Receipt, Plus, DollarSign, Calendar, Tag, FileText,
    ArrowUpRight, ArrowDownRight, Landmark, PieChart,
    Trash2, Search, Filter, TrendingUp, TrendingDown, Pencil, X, RefreshCw
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
    const { user } = useAuth();
    const { expenses, orders, purchaseOrders, banks, updateBankBalance, addExpense, updateExpense, deleteExpense } = useBusiness();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState(['Administración', 'Nomina', 'Matería Prima (Compras)', 'Transporte / Envío', 'Comisiones / Bancos', 'Servicios Públicos', 'Alimentación', 'Venta Activos', 'Traslado entre Bancos']);
    const [editingExpense, setEditingExpense] = useState(null);

    const [filterType, setFilterType] = useState('month');
    const [customRange, setCustomRange] = useState({ from: '', to: '' });

    const deepTeal = '#023636';
    const institutionOcre = '#D4785A';
    const premiumSalmon = '#E29783';
    const glassWhite = 'rgba(255, 255, 255, 0.85)';

    const isWithinRange = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        if (filterType === 'week') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            lastWeek.setHours(0, 0, 0, 0); // Zero out for exact day comparison
            return d >= lastWeek;
        } else if (filterType === 'month') {
            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);
            return d >= thisMonth;
        } else if (filterType === 'custom' && customRange.from && customRange.to) {
            const from = new Date(customRange.from + 'T00:00:00');
            const to = new Date(customRange.to + 'T23:59:59');
            return d >= from && d <= to;
        }
        return true;
    };

    const [formData, setFormData] = useState({
        date: new Date().toLocaleDateString('en-CA'),
        category: 'Administración',
        description: '',
        amount: '',
        bankId: '',
        targetBankId: ''
    });

    const pygData = useMemo(() => {
        // 1. INGRESOS (VENTAS)
        const filteredOrders = (orders || []).filter(o => isWithinRange(o.date));
        const totalPedidosBrutos = filteredOrders.reduce((acc, o) => acc + (o.amount || 0), 0);
        
        const ordenesPagadas = filteredOrders.filter(o => o.payment_status === 'Pagado' || o.paymentStatus === 'Pagado');
        const totalIngresosEfectivo = ordenesPagadas.reduce((acc, o) => acc + (o.amount || 0), 0);

        // 2. COSTO DE VENTAS (MATERIA PRIMA)
        // Autocarga de OC Pagadas
        const ocsPagadas = (purchaseOrders || []).filter(po => 
            isWithinRange(po.date) && 
            (po.paymentStatus === 'Pagado' || po.payment_status === 'Pagado')
        );
        const totalOcPagadas = ocsPagadas.reduce((acc, po) => acc + (po.total || 0), 0);

        const filteredExpensesList = (expenses || [])
            .map(e => {
                const bank = banks.find(b => b.id === (e.bankId || e.bank_id));
                return { ...e, bankName: bank ? bank.name : 'N/A' };
            })
            .filter(e => isWithinRange(e.date || e.expense_date))
            .filter(e => e.category !== 'Traslado entre Bancos');

        // Gastos manuales etiquetados como Materia Prima
        const gastosManualesMateriaPrima = filteredExpensesList
            .filter(e => (e.category || '').toUpperCase().includes('MATERIA') || (e.category || '').toUpperCase().includes('COMPRAS'))
            .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

        const totalCostosMateriaPrima = totalOcPagadas + gastosManualesMateriaPrima;

        // 3. GASTOS OPERATIVOS (OPEX)
        // Automático: Envíos (Interrapidisimo)
        const totalEnvíosAutomaticos = ordenesPagadas.reduce((acc, o) => acc + (Number(o.shipping_cost) || 0), 0);
        
        // Automático: Comisiones (Bold - Aprox 3% + 900 si vino de la web)
        const totalComisionesAutomaticas = ordenesPagadas.reduce((acc, o) => {
            if (o.payment_method === 'Bold' || o.payment_gateway === 'Bold' || o.id?.toString().includes('WEB')) {
                return acc + (o.amount * 0.0299 + 900);
            }
            return acc;
        }, 0);

        // Gastos Manuales (Administrativos, etc.)
        const totalGastosManuales = filteredExpensesList
            .filter(e => !(e.category || '').toUpperCase().includes('MATERIA') && !(e.category || '').toUpperCase().includes('COMPRAS'))
            .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

        const totalGastosOperativos = totalGastosManuales + totalEnvíosAutomaticos + totalComisionesAutomaticas;

        // 4. UTILIDAD NETA (FLUJO DE CAJA)
        const utilidadNeta = totalIngresosEfectivo - totalCostosMateriaPrima - totalGastosOperativos;

        return {
            ingresos: totalIngresosEfectivo,
            cartera: totalPedidosBrutos - totalIngresosEfectivo,
            costos: totalCostosMateriaPrima,
            gastos: totalGastosOperativos,
            utilidad: utilidadNeta,
            pedidosBrutos: totalPedidosBrutos,
            listaGastos: filteredExpensesList,
            breakdown: {
                oc: totalOcPagadas,
                manualMP: gastosManualesMateriaPrima,
                envios: totalEnvíosAutomaticos,
                comisiones: totalComisionesAutomaticas,
                manualGasto: totalGastosManuales
            }
        };
    }, [orders, purchaseOrders, expenses, filterType, customRange, banks]);

    const filteredExpenses = (pygData.listaGastos || []).filter(e => {
        const q = searchTerm.toLowerCase();
        if (!q) return true;
        return (
            (e.date || e.expense_date || '').toLowerCase().includes(q) ||
            (e.category || '').toLowerCase().includes(q) ||
            (e.description || '').toLowerCase().includes(q) ||
            (e.bankName || '').toLowerCase().includes(q)
        );
    });

    const handleAddExpense = async (e) => {
        if (e) e.preventDefault();
        const amount = parseFloat(formData.amount) || 0;
        if (!formData.category || !formData.bankId || amount <= 0) return alert("Por favor complete todos los campos.");

        try {
            const res = await addExpense({
                date: formData.date,
                category: formData.category,
                description: formData.description,
                amount: amount,
                bank_id: formData.bankId,
                target_bank_id: formData.category === 'Traslado entre Bancos' ? formData.targetBankId : null
            });

            if (res.success) {
                setShowModal(false);
                setFormData({ date: new Date().toLocaleDateString('en-CA'), category: 'Administración', description: '', amount: '', bankId: '', targetBankId: '' });
                alert("Movimiento registrado y saldo bancario actualizado satisfactoriamente.");
            }
        } catch (err) { alert("Error: " + err.message); }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm("¿Eliminar este registro y reintegrar el saldo al banco?")) return;
        try {
            const res = await deleteExpense(id, user);
            if (!res.success) alert(res.error);
        } catch (err) { alert(err.message); }
    };

    return (
        <div style={{ padding: '1.5rem', minHeight: '100vh', background: '#f8fafc' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: deepTeal }}>
                    <Receipt size={24} />
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>Rentabilidad & Gastos Operativos</h2>
                </div>
                <button
                    onClick={() => { setEditingExpense(null); setShowModal(true); }}
                    style={{ background: deepTeal, color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '12px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                    <Plus size={16} /> CARGAR GASTO
                </button>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', background: '#fff', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    {['week', 'month', 'custom'].map(t => (
                        <button key={t} onClick={() => setFilterType(t)} style={{ padding: '0.5rem 1.2rem', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '900', background: filterType === t ? deepTeal : 'transparent', color: filterType === t ? '#fff' : '#64748b', cursor: 'pointer' }}>
                            {t === 'week' ? 'Semana' : t === 'month' ? 'Mes' : 'Filtro'}
                        </button>
                    ))}
                </div>
                {filterType === 'custom' && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="date" value={customRange.from} onChange={e => setCustomRange({ ...customRange, from: e.target.value })} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <span style={{ fontSize: '0.7rem' }}>a</span>
                        <input type="date" value={customRange.to} onChange={e => setCustomRange({ ...customRange, to: e.target.value })} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                )}
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                </div>
            </div>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem', marginBottom: '2.5rem' }}>
                <div style={{ background: '#fff', padding: '1.8rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#94a3b8' }}>INGRESOS (COBRADOS)</span>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: deepTeal, margin: '8px 0' }}>${pygData.ingresos.toLocaleString('es-CO')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>BRUTO PEDIDOS: ${pygData.pedidosBrutos.toLocaleString()}</div>
                </div>
                <div style={{ background: '#fff', padding: '1.8rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#94a3b8' }}>MATERIA PRIMA (OC)</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: premiumSalmon, background: '#fff1f2', padding: '4px 10px', borderRadius: '10px' }}>
                            {pygData.ingresos > 0 ? ((pygData.costos / pygData.ingresos) * 100).toFixed(1) : 0}%
                        </span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: premiumSalmon, margin: '8px 0' }}>${pygData.costos.toLocaleString('es-CO')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>OC ({pygData.breakdown.oc.toLocaleString()}) + MANUAL ({pygData.breakdown.manualMP.toLocaleString()})</div>
                </div>
                <div style={{ background: '#fff', padding: '1.8rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#94a3b8' }}>GASTOS OPERATIVOS</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: institutionOcre, background: '#fff7ed', padding: '4px 10px', borderRadius: '10px' }}>
                            {pygData.ingresos > 0 ? ((pygData.gastos / pygData.ingresos) * 100).toFixed(1) : 0}%
                        </span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: institutionOcre, margin: '8px 0' }}>${pygData.gastos.toLocaleString('es-CO')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>BOLD+ENVÍOS: ${(pygData.breakdown.comisiones + pygData.breakdown.envios).toLocaleString('es-CO')}</div>
                </div>
                <div style={{ background: deepTeal, color: '#fff', padding: '1.8rem', borderRadius: '30px', boxShadow: '0 10px 15px -3px rgba(2, 54, 54, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '900', opacity: 0.7 }}>UTILIDAD NETA (FLUJO)</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#fff', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '10px' }}>
                            {pygData.ingresos > 0 ? ((pygData.utilidad / pygData.ingresos) * 100).toFixed(1) : 0}%
                        </span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', margin: '8px 0' }}>${pygData.utilidad.toLocaleString('es-CO')}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>FLUJO DE CAJA REAL (MENSUAL)</div>
                </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
                <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900' }}>Relación de Gastos</h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '1.2rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#94a3b8' }}>FECHA</th>
                                <th style={{ padding: '1.2rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#94a3b8' }}>CONCEPTO / BANCO</th>
                                <th style={{ padding: '1.2rem 1rem', textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8' }}>VALOR</th>
                                <th style={{ padding: '1.2rem 1rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>ACC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map(exp => (
                                <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1.2rem 1rem', fontSize: '0.8rem', fontWeight: '900', color: '#64748b', whiteSpace: 'nowrap' }}>{exp.date || exp.expense_date || (exp.created_at ? exp.created_at.split('T')[0] : 'S/F')}</td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <div style={{ fontWeight: '800', fontSize: '1rem' }}>{exp.description}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '4px' }}>{exp.category} • {exp.bankName}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontWeight: '900', color: premiumSalmon, fontSize: '1rem' }}>${(Number(exp.amount) || 0).toLocaleString()}</td>
                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                        <button onClick={() => handleDeleteExpense(exp.id)} style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredExpenses.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No hay gastos en este periodo.</div>}
                </div>

                <div style={{ background: deepTeal, borderRadius: '24px', padding: '1.5rem', color: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Disponibilidad Bancaria</h3>
                        <RefreshCw size={14} style={{ opacity: 0.4 }} />
                    </div>
                     <div style={{ display: 'grid', gap: '0.8rem' }}>
                        {banks.map(bank => (
                            <div key={bank.id} style={{ background: 'rgba(255,255,255,0.06)', padding: '1.2rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.4rem' }}>{bank.name.toUpperCase()}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>${((bank.balance || 0) + (bank.initial_balance || 1000000)).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: deepTeal, fontWeight: '900' }}>Registrar Gasto o Traslado</h3>
                            <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleAddExpense} style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8' }}>CATEGORÍA DE GASTO</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '700' }}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8' }}>FECHA</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: '700' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8' }}>VALOR ($)</label>
                                    <input type="number" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: '900' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8' }}>CONCEPTO / DESCRIPCIÓN</label>
                                <input type="text" required placeholder="Ej: Pago nómina quincena..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: '700' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: formData.category === 'Traslado entre Bancos' ? '1fr 1fr' : '1fr', gap: '0.8rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8' }}>{formData.category === 'Traslado entre Bancos' ? 'BANCO ORIGEN' : 'BANCO QUE PAGA'}</label>
                                    <select required value={formData.bankId} onChange={e => setFormData({ ...formData, bankId: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: '700' }}>
                                        <option value="">Seleccione banco...</option>
                                        {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                {formData.category === 'Traslado entre Bancos' && (
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#10b981' }}>BANCO DESTINO</label>
                                        <select required value={formData.targetBankId} onChange={e => setFormData({ ...formData, targetBankId: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '2px solid #10b981', background: '#f0fdf4', fontWeight: '700' }}>
                                            <option value="">Seleccione destino...</option>
                                            {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '0.8rem', background: deepTeal, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.8rem' }}>REGISTRAR MOVIMIENTO</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
