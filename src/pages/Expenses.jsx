import React, { useState, useMemo } from 'react';
import {
    Receipt, Plus, DollarSign, Calendar, Tag, FileText,
    ArrowUpRight, ArrowDownRight, Landmark, PieChart,
    Trash2, Search, Filter, TrendingUp, TrendingDown
} from 'lucide-react';

const Expenses = ({ expenses, setExpenses, orders, purchaseOrders, banks, setBanks }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'Administración',
        description: '',
        amount: '',
        bank: 'Bancolombia'
    });

    // P&L Calculations (PYG)
    const pygData = useMemo(() => {
        const income = orders.reduce((acc, o) => acc + (o.status !== 'Cancelado' ? (o.amount || 0) : 0), 0);

        // Cost of Goods Sold (Purchases received)
        const cogs = purchaseOrders
            .filter(oc => oc.status === 'Recibida')
            .reduce((acc, oc) => {
                const totalOC = oc.items.reduce((sum, it) => sum + (it.toBuy * it.purchasePrice), 0);
                return acc + totalOC;
            }, 0);

        const grossProfit = income - cogs;

        const adminExpenses = expenses
            .filter(e => e.category === 'Administración')
            .reduce((acc, e) => acc + (e.amount || 0), 0);

        const salesExpenses = expenses
            .filter(e => e.category === 'Ventas')
            .reduce((acc, e) => acc + (e.amount || 0), 0);

        const totalExpenses = adminExpenses + salesExpenses;
        const netProfit = grossProfit - totalExpenses;

        return {
            income,
            cogs,
            grossProfit,
            adminExpenses,
            salesExpenses,
            totalExpenses,
            netProfit,
            margin: income > 0 ? (netProfit / income * 100).toFixed(1) : 0
        };
    }, [orders, purchaseOrders, expenses]);

    const filteredExpenses = expenses.filter(e => {
        const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddExpense = (e) => {
        e.preventDefault();
        const newExpense = {
            id: Date.now(),
            ...formData,
            amount: parseFloat(formData.amount) || 0
        };

        setExpenses([newExpense, ...expenses]);

        // Update bank balance
        setBanks(banks.map(b =>
            b.name === formData.bank
                ? { ...b, balance: b.balance - (parseFloat(formData.amount) || 0) }
                : b
        ));

        setFormData({
            date: new Date().toISOString().split('T')[0],
            category: 'Administración',
            description: '',
            amount: '',
            bank: 'Bancolombia'
        });
        setShowModal(false);
    };

    const handleDeleteExpense = (id) => {
        if (!window.confirm("¿Estás seguro que quieres eliminar este gasto?")) {
            return;
        }
        const expense = expenses.find(e => e.id === id);
        if (expense) {
            setBanks(banks.map(b =>
                b.name === expense.bank
                    ? { ...b, balance: b.balance + expense.amount }
                    : b
            ));
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

    return (
        <div className="expenses-module" style={{ padding: '0 1rem' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '2.4rem', color: 'var(--color-primary)', margin: 0 }}>Gastos y P&L (PYG)</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.4rem' }}>Control financiero de administración, ventas y estado de resultados.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,77,77,0.2)' }}
                >
                    <Plus size={20} /> Registrar Gasto
                </button>
            </header>

            {/* P&L Summary Dashboard */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
                        <ArrowUpRight size={16} color="#10b981" /> VENTAS (INGRESOS)
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1A3636' }}>${pygData.income.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.4rem' }}>Basado en pedidos activos</div>
                </div>

                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
                        <ArrowDownRight size={16} color="#ef4444" /> COSTO VENTAS (MP)
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ef4444' }}>${pygData.cogs.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.4rem' }}>Compras recibidas de proveedores</div>
                </div>

                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
                        <Tag size={16} color="#f59e0b" /> GASTOS OP.
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#f59e0b' }}>${pygData.totalExpenses.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.4rem' }}>Administración y Ventas</div>
                </div>

                <div style={{ background: pygData.netProfit >= 0 ? '#ecfdf5' : '#fef2f2', padding: '1.5rem', borderRadius: '20px', border: `1px solid ${pygData.netProfit >= 0 ? '#10b981' : '#ef4444'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: pygData.netProfit >= 0 ? '#065f46' : '#991b1b', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
                        <PieChart size={16} /> UTILIDAD NETA / MARGEN
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: pygData.netProfit >= 0 ? '#047857' : '#b91c1c' }}>
                        ${pygData.netProfit.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: pygData.netProfit >= 0 ? '#10b981' : '#ef4444', marginTop: '0.4rem' }}>
                        {pygData.margin}% Margen Neto
                    </div>
                </div>
            </section>

            {/* Bank Reconciliations Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                {/* Expenses List */}
                <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Registro de Gastos</h3>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar gasto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', width: '200px' }}
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                            >
                                <option value="All">Todas las Categorías</option>
                                <option value="Administración">Administración</option>
                                <option value="Ventas">Ventas</option>
                            </select>
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', color: '#64748b' }}>FECHA</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', color: '#64748b' }}>CATEGORÍA</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', color: '#64748b' }}>DESCRIPCIÓN</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', color: '#64748b' }}>BANCO</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.7rem', color: '#64748b' }}>VALOR</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.7rem', color: '#64748b' }}>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map(exp => (
                                <tr key={exp.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{exp.date}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 'bold',
                                            background: exp.category === 'Administración' ? '#eff6ff' : '#faf5ff',
                                            color: exp.category === 'Administración' ? '#1e40af' : '#7e22ce'
                                        }}>{exp.category.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '500' }}>{exp.description}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Landmark size={14} /> {exp.bank}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#ef4444' }}>-${exp.amount.toLocaleString()}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleDeleteExpense(exp.id)}
                                            style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                                            onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Banks / Reconciliation Board */}
                <div style={{ background: '#1A3636', borderRadius: '32px', padding: '2rem', color: '#fff', boxShadow: '0 20px 40px rgba(26,54,54,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
                        <Landmark size={24} />
                        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Conciliación Bancaria</h3>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {banks.map(bank => (
                            <div key={bank.id} style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', opacity: 0.9 }}>{bank.name}</div>
                                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 'bold' }}>SALDO DISPONIBLE</div>
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>${bank.balance.toLocaleString()}</div>
                                <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '1rem' }}>
                                    <div style={{ height: '100%', width: '70%', background: '#fff', borderRadius: '2px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button style={{ width: '100%', marginTop: '2rem', padding: '1rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        + Agregar Cuenta Bancaria
                    </button>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '24px', width: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', color: 'var(--color-primary)' }}>Registrar Nuevo Gasto</h3>
                        <form onSubmit={handleAddExpense} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: '#64748b', marginBottom: '0.5rem' }}>FECHA</label>
                                    <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: '#64748b', marginBottom: '0.5rem' }}>CATEGORÍA</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <option value="Administración">Administración</option>
                                        <option value="Ventas">Ventas</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: '#64748b', marginBottom: '0.5rem' }}>DESCRIPCIÓN</label>
                                <input type="text" required placeholder="Eje: Pago Internet, Publicidad..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: '#64748b', marginBottom: '0.5rem' }}>VALOR ($)</label>
                                    <input type="number" required placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: '#64748b', marginBottom: '0.5rem' }}>BANCO / ORIGEN</label>
                                    <select value={formData.bank} onChange={e => setFormData({ ...formData, bank: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        {banks.map(b => (
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Gasto</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
